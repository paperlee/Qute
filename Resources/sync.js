function sync() {
	var dropbox = require('dropbox');
	var Keys = require('keys');
	var cookiejar = require('com.kosso.cookiejar');

	var keys = new Keys();

	var client = dropbox.createClient({
		app_key : keys.dropbox_appkey,
		app_secret : keys.dropbox_appskey,
		root : 'sandbox'
	});

	var getAllData = function() {
		var db = Ti.Database.open('qute');
		var rows = db.execute('SELECT * FROM history ORDER BY id DESC');

		var fieldCount;
		
		fieldCount = rows.fieldCount;
		
		// After Ti. 3.3.0, fieldCount() had been removed from SDK
		//fieldCount is property in Android
		/*if (Ti.Platform.name === 'android') {
			fieldCount = rows.fieldCount;
		} else {
			fieldCount = rows.fieldCount();
		}*/

		var datas = [];
		// keys saves all image file name to easily search in datas
		var data_keys = [];

		while (rows.isValidRow()) {
			var obj = {};
			for (var i = 0; i < fieldCount; i++) {
				obj[rows.fieldName(i)] = rows.field(i);
			}

			datas.push(obj);
			var img_file_name = obj['img'].split('/')[1];
			console.log('img named: ' + img_file_name);
			data_keys.push(img_file_name.split('.')[0]);

			rows.next();
		}

		var deleted_rows = db.execute('SELECT * FROM _deleted');
		var deleted_keys = [];
		while (deleted_rows.isValidRow()) {
			deleted_keys.push(deleted_rows.fieldByName('deleted_key'));

			deleted_rows.next();
		}

		db.close();
		return [datas, data_keys, deleted_keys];
	};

	var importOrExport = function() {
		// TODO: Error prove to avoid error uploading
		console.log('method: importOrExport');
		// 1. Get files metadata from dropbox
		var dropbox_files = [];
		client.metadata('Content', {
			list : true,
			include_deleted : false
		}, function(stat, reply) {
			dropbox_files = reply['contents'];
			var need_recheck_photo = true;

			if (dropbox_files.length == 0) {
				pureExport();
			} else {
				//console.log('Go importOrExport one by one!\n' + JSON.stringify(reply));
				console.log('Cloud has ' + dropbox_files.length + ' files');

				// Below code too late to response!
				/*var dropbox_files_amount = dropbox_files.length;

				client.metadata('Photo', {
				list : true,
				include_deleted : false
				}, function(stat, reply) {
				console.log('[2]Cloud has ' + reply['contents'].length + ' photos');
				if (reply['contents'].length < dropbox_files_amount) {
				need_recheck_photo = true;
				}
				});*/

				// 2. Get local datas
				var datasAndKeys = getAllData();
				var datas = datasAndKeys[0];
				var data_keys = datasAndKeys[1];
				var deleted_keys = datasAndKeys[2];

				// To store ids which were updated in db
				var changed_ids = [];
				var insert_ids = [];

				// To define if all actions done
				var end_counter = 0;
				var total_amount = data_keys.length;

				console.log('Local has ' + datas.length + ' datas. And ' + data_keys.length + ' keys');
				// 3. Check if file exist in local? EXIST:continue NO:get
				dropbox_files.forEach(function(element, key, array) {
					var id2 = element['path'].split('Content/')[1];
					var id = id2.split('.')[0];

					var at = data_keys.indexOf(id);
					//console.log('Rest datas amount: ' + data_keys.length);
					console.log('Path: ' + element['path'] + ':: ID: ' + id + ':: at:' + at);
					//console.log(element['modified'] + ' = ' + (new Date(element['modified'])).getTime());
					if (at < 0) {

						// Add one more obj that shall be completed
						total_amount += 1;

						// Not existed in local. Download it
						if (deleted_keys.indexOf(id) < 0) {
							// Only if not exist in deleted_keys
							client.get(element['path'], {}, function(stat, reply, metadata) {
								console.log('metadata:' + metadata);
								var content = JSON.parse(reply);
								if (content.title) {
									var db = Ti.Database.open('qute');
									db.execute('INSERT INTO history (title, date, qrtype, content, raw, img, loved, post_id, qute_link, last_update, last_sync, from_me, sync_address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', content.title, content.date, content.qrtype, content.content, content.raw, content.img, content.loved, content.post_id, content.qute_link, content.last_update, content.last_sync, content.from_me, content.sync_address);
									insert_ids.push(db.lastInsertRowId);
									db.close();
									var photo_path = JSON.parse(metadata)['path'].replace('Content', 'Photo');
									photo_path = photo_path.replace('.json', '.png');
									console.log('Photo path: ' + photo_path);

									// Make sure the Qute folder in local is created
									var foldername = Ti.Filesystem.applicationDataDirectory + "Qute/";
									var folder = Ti.Filesystem.getFile(foldername);
									if (!folder.exists()) {
										folder.createDirectory();
									}

									// media can't be get by get() method
									/*client.get(photo_path, {}, function(stat, reply, metadata) {

									//Save file to local storage
									var img_name = JSON.parse(metadata)['path'].replace('/Photo','Qute'); // Get image file name
									var filename = Ti.Filesystem.applicationDataDirectory + img_name;
									var file = Ti.Filesystem.getFile(filename);
									file.write(reply);
									});*/

									// Get photo's direct url and apply to imageView to store it
									client.media(photo_path, {}, function(stat, reply) {

										var pp = photo_path;
										//Save file to local storage
										var img_name = pp.replace('/Photo', 'Qute');
										var local_img_path = Ti.Filesystem.applicationDataDirectory + img_name;
										var file = Ti.Filesystem.getFile(local_img_path);
										if (file.exists) {
											file.deleteFile();
										}

										var xhr = Ti.Network.createHTTPClient({
											onload : function(e) {
												file.write(this.responseData);
												end_counter++;
												Ti.API.info('Current end counter: ' + end_counter);
												if (end_counter >= total_amount) {
													Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
													Ti.App.fireEvent('end_syncing', {
														changed_ids : changed_ids,
														insert_ids : insert_ids
													});
												} else {
													// To share current sync progress
													Ti.App.fireEvent('sync_progress_changed', {
														now : end_counter,
														all : total_amount
													});
												}
											},
											onerror : function(e) {
												console.log('Get image fail! ' + e.error);
												end_counter++;
												Ti.API.info('Current end counter: ' + end_counter);
												if (end_counter >= total_amount) {
													Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
													Ti.App.fireEvent('end_syncing', {
														changed_ids : changed_ids,
														insert_ids : insert_ids
													});
												} else {
													Ti.App.fireEvent('sync_progress_changed', {
														now : end_counter,
														all : total_amount
													});
												}
												//TODO: More consitions to consider sync_done in HTTPClient?
											},
											timeout : 2 * 60000
										});

										xhr.open('GET', reply['url']);
										xhr.send();

										console.log('Img url is ' + reply['url'] + "::full path: " + pp);

										//temp_img.addEventListener('load',saveImage);
										//file.write(temp_img.toImage());

									});
								}
								//Ti.API.info('The file content: ' + JSON.parse(reply).title);
							});
						} else {
							// The key matched something in deleted_id
							end_counter++;
							if (end_counter >= total_amount) {
								Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
								Ti.App.fireEvent('end_syncing', {
									changed_ids : changed_ids,
									insert_ids : insert_ids
								});
							} else {
								Ti.App.fireEvent('sync_progress_changed', {
									now : end_counter,
									all : total_amount
								});
							}
						}

					} else {
						// File existed.
						// 4. Check if dropbox_file_date >(newer) local_file_date? YES:get EQUAL:skip NO:upload(content)
						// tolerance: Newer - 1 min. - Equal - 1 min. - Older

						// Do rest action only if there is related time flag
						if (datas[at].last_sync && datas[at].last_update && element['modified']) {
							console.log(element['modified'] + ' = ' + (new Date(element['modified'])).getTime());

							var dropbox_file_date = (new Date(element['modified'])).getTime();
							var local_file_update_date = (new Date(datas[at].last_update)).getTime();
							var local_file_sync_date = (new Date(datas[at].last_sync)).getTime();
							if (dropbox_file_date > local_file_sync_date + 60000) {
								var obj = datas[at];
								// Dropbox newer than Local. Need to download file (get content only)
								client.get(element['path'], {}, function(stat, reply, metadata) {
									console.log('metadata:' + metadata);
									var content = JSON.parse(reply);
									if (content.title) {
										//console.log('Updating data #' + datas[at]['id']);
										var db = Ti.Database.open('qute');
										// TODO:Weird error? datas[at].id undefined?
										db.execute('UPDATE history SET title=?, date=?, qrtype=?, content=?, raw=?, img=?, loved=?, post_id=?, qute_link=?, last_update=?, last_sync=?, from_me=?, sync_address=? WHERE id=?', content.title, content.date, content.qrtype, content.content, content.raw, content.img, content.loved, content.post_id, content.qute_link, content.last_update, content.last_sync, content.from_me, content.sync_address, obj.id);
										changed_ids.push(obj.id);
										db.close();
										var photo_path = JSON.parse(metadata)['path'].replace('Content', 'Photo');
										photo_path = photo_path.replace('.json', '.png');
										console.log('Photo path: ' + photo_path);

										// Make sure the Qute folder in local is created
										// TODO:Not neccessary?
										// !IMPORTANT: Not need to update image file. There shall be no way in app to update the image
										/*var foldername = Ti.Filesystem.applicationDataDirectory + "Qute/";
										 var folder = Ti.Filesystem.getFile(foldername);
										 if (!folder.exists()) {
										 folder.createDirectory();
										 }

										 // Get photo's direct url and apply to imageView to store it
										 client.media(photo_path, {}, function(stat, reply) {

										 var pp = photo_path;
										 //Save file to local storage
										 var img_name = pp.replace('/Photo', 'Qute');
										 var local_img_path = Ti.Filesystem.applicationDataDirectory + img_name;
										 var file = Ti.Filesystem.getFile(local_img_path);

										 if (file.exists){
										 file.deleteFile();
										 }

										 var xhr = Ti.Network.createHTTPClient({
										 onload : function(e) {
										 file.write(this.responseData);
										 },
										 onerror : function(e) {
										 console.log('Get image fail! ' + e.error);
										 },
										 timeout : 2 * 60000
										 });

										 xhr.open('GET', reply['url']);
										 xhr.send();

										 console.log('Img url is ' + reply['url'] + "::full path: " + pp);

										 //temp_img.addEventListener('load',saveImage);
										 //file.write(temp_img.toImage());

										 });*/
									}

									end_counter++;
									Ti.API.info('Current end counter: ' + end_counter);
									if (end_counter >= total_amount) {
										Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
										Ti.App.fireEvent('end_syncing', {
											changed_ids : changed_ids,
											insert_ids : insert_ids
										});
									} else {
										Ti.App.fireEvent('sync_progress_changed', {
											now : end_counter,
											all : total_amount
										});
									}
									//Ti.API.info('The file content: ' + JSON.parse(reply).title);
								});

							} else if (dropbox_file_date < local_file_update_date - 60000) {
								// Dropbox older than Local. Need to update dropbox data (upload content only)
								// TODO: Debug
								var obj = datas[at];
								console.log('[2]Uploading data #' + datas[at].id + " = " + obj['id']);
								var datetime = (new Date()).toISOString();
								obj['last_sync'] = datetime;
								var fname = obj['sync_address'];
								if (fname == 'no') {
									// fetch file name from image name
									var img_name = obj['img'].split('Qute/')[1];
									fname = img_name.split('.')[0];
								}

								client.put('Content/' + fname + '.json', JSON.stringify(obj), {
									overwrite : true
								}, function(stat, reply) {
									//Ti.API.info('stat:' + stat);
									//Ti.API.info('reply:' + JSON.stringify(reply));
									end_counter++;
									Ti.API.info('Current end counter: ' + end_counter);
									if (end_counter >= total_amount) {
										Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
										Ti.App.fireEvent('end_syncing', {
											changed_ids : changed_ids,
											insert_ids : insert_ids
										});
									} else {
										Ti.App.fireEvent('sync_progress_changed', {
											now : end_counter,
											all : total_amount
										});
									}
								});

								var db = Ti.Database.open('qute');
								db.execute('UPDATE history SET last_sync=? WHERE id=?', datetime, obj['id']);

							} else {
								// Equal. Nothing to do.
								end_counter++;
								Ti.API.info('Current end counter: ' + end_counter);
								if (end_counter >= total_amount) {
									Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
									Ti.App.fireEvent('end_syncing', {
										changed_ids : changed_ids,
										insert_ids : insert_ids
									});
								} else {
									Ti.App.fireEvent('sync_progress_changed', {
										now : end_counter,
										all : total_amount
									});
								}
							}
							// Kick out the handled obj

							// TODO:Too heavy the sync action! Don't check everytime or do check if needed (ie. content length > photo length)
							// Check if the photo missing
							// TODO:syncing progress in this situation
							console.log('need_recheck_photo? ' + need_recheck_photo + ' #' + at + '::' + datas[at]['sync_address']);
							if (need_recheck_photo) {
								var obj_p = datas[at];
								var sync_name = obj_p['sync_address'];
								if (sync_name == 'no') {
									// fetch file name from image name
									var img_name = obj_p['img'].split('Qute/')[1];
									sync_name = img_name.split('.')[0];
								}

								var photo_path = 'Photo/' + sync_name + '.png';
								client.metadata(photo_path, {}, function(stat, reply) {
									//console.log('get what? '+reply.length+'::'+JSON.stringify(reply));
									if (reply['is_deleted'] || reply['path'] === undefined) {
										var photo_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + obj_p['img']);
										client.put(photo_path, photo_file.read(), {}, function(stat, reply) {
											if (reply.error) {
												Ti.API.error('Re-put image ERROR! ' + reply.error);
											} else {
												Ti.API.info('Re-put image successfully!' + JSON.stringify(reply));
											}

										});
									}
								});
							}

							datas.splice(at, 1);
							data_keys.splice(at, 1);
						}

					}
				});
				// 5. The rest local data: Upload (photo+content)
				if (datas.length > 0) {
					// There are something in local and not exist in dropbox. Need to upload them (content+photo)
					var db = Ti.Database.open('qute');
					datas.forEach(function(element, key, array) {

						var photo_name = element['img'].split('/')[1];
						var sync_address = photo_name.split('.png')[0];

						var datetime = (new Date()).toISOString();
						element['last_sync'] = datetime;
						element['sync_address'] = sync_address;

						client.put('Content/' + sync_address + '.json', JSON.stringify(element), {
							overwrite : true
						}, function(stat, reply) {
							if (reply['error']) {
								Ti.API.error('Error! ' + reply['error']);
							}
						});

						var photo_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + element['img']);
						if (photo_file.exists()) {
							client.put('Photo/' + photo_name, photo_file.read(), {
								overwrite : true
							}, function(stat, reply) {
								if (reply['error']) {
									//TODO:error msg may cause App crash?
									Ti.API.error('Error! ' + reply['error']);
								}
								end_counter++;
								Ti.API.info('Current end counter: ' + end_counter);
								if (end_counter >= total_amount) {
									Ti.API.info('Changed ids: ' + changed_ids + "::Inserted ids: " + insert_ids);
									Ti.App.fireEvent('end_syncing', {
										changed_ids : changed_ids,
										insert_ids : insert_ids
									});
								} else {
									Ti.App.fireEvent('sync_progress_changed', {
										now : end_counter,
										all : total_amount
									});
								}
							});
						}

						db.execute('UPDATE history SET last_sync=?,sync_address=? WHERE id=?', datetime, sync_address, element['id']);

					});
					db.close();
				}
			}
		});
	};

	var pureExport = function() {
		var db = Ti.Database.open('qute');
		var rows = db.execute('SELECT * FROM history ORDER BY id DESC');
		var end_counter = 0;

		var fieldCount;
		
		fieldCount = rows.fieldCount;
		
		// After Ti 3.3.0, fieldCount() had been removed from SDK
		//fieldCount is property in Android
		/*if (Ti.Platform.name === 'android') {
			fieldCount = rows.fieldCount;
		} else {
			fieldCount = rows.fieldCount();
		}*/

		var rows_amount = rows.rowCount;

		while (rows.isValidRow()) {
			var obj = {};
			for (var i = 0; i < fieldCount; i++) {
				obj[rows.fieldName(i)] = rows.field(i);
			}

			var photo_name = obj['img'].split('/')[1];
			var unique_name = photo_name.split('.png')[0];

			// Save last sync time and sync address in local
			var datetime = new Date().toISOString();
			obj['last_sync'] = datetime;
			obj['sync_address'] = unique_name;

			client.put('Content/' + unique_name + '.json', JSON.stringify(obj), {
				overwrite : true
			}, function(stat, reply) {
				//Ti.API.info('stat:' + stat);
				//Ti.API.info('reply:' + JSON.stringify(reply));
			});

			var photo_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + obj['img']);
			client.put('Photo/' + photo_name, photo_file.read(), {
				overwrite : true
			}, function(stat, reply) {
				//Ti.API.info('stat:' + stat);
				//Ti.API.info('reply:' + JSON.stringify(reply));
				// Calculate how many rows are done. Fire end_syncing event whenn all rows are done.
				console.log('End counter: ' + end_counter);
				end_counter++;
				Ti.API.info('Current end counter: ' + end_counter);
				if (end_counter >= rows_amount) {
					Ti.App.fireEvent('end_syncing', {
						changed_ids : [],
						insert_ids : []
					});
				} else {
					Ti.App.fireEvent('sync_progress_changed', {
						now : end_counter,
						all : rows_amount
					});
				}
			});

			// Update last_sync in local data

			db.execute('UPDATE history SET last_sync=?,sync_address=? WHERE id=?', datetime, unique_name, obj['id']);

			rows.next();
		}
		db.close();
	};

	var doSync = function() {
		client.search('.', 'Content', {}, function(stat, reply) {
			if (reply.length > 0) {
				importOrExport();
			} else {
				pureExport();
			}
		});
	};
	
	var self = {
		doSync : function() {
			doSync();
		},
		logout : function() {
			// Not really logout. Or it will repeatly log in
			cookiejar.clearWebViewCookies('.dropbox.com');
			console.log('Before logout: ' + Ti.App.Properties.getString('DROPBOX_TOKENS'));
			Ti.App.Properties.setString('DROPBOX_TOKENS', null);
			Ti.App.Properties.setBool('syncing', false);
		},
		loginAndSync : function() {
			//TODO: add end_syncing event
			Ti.App.fireEvent('start_syncing', {});
			Ti.App.Properties.setString('latestSync', (new Date()).toISOString());
			//console.log('The sync date changed: '+Ti.App.Properties.getString('latestSync'));
			Ti.App.Properties.setBool('syncing', true);
			if (client.isAuthorized()) {
				console.log('Already logged in');
				//getDelta();
				doSync();
			} else {
				console.log('Go logging in');
				client.login(function(options) {
					console.log('Great! login done!' + options.toString());
					console.log('syncing: ' + Ti.App.Properties.getBool('syncing'));
					//getDelta();
					doSync();
				});
				//Ti.App.addEventListener('dropbox_login_fail',loginFailHandler);
			}
		}
	};

	return self;
};

module.exports = sync;
