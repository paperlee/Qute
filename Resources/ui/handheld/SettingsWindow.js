var COLOR_FB = '#3b5998';
var COLOR_PURPLE = '#9857a7';
var COLOR_PURPLE_90ALPHA = '#E69857a7';
var COLOR_LINK = '#149599';
var lang_at = 0;
var lang_is_showing = false;
var lang_select = 0;
var lang_origin = 0;
var langs = ['en', 'zh-Hant', 'zh-Hans'];
var langsName = ['English', '繁體中文', '简体中文'];

var locale = require('com.shareourideas.locale');
var dropbox = require('dropbox');
var cookiejar = require('com.kosso.cookiejar');

var URL_QUTE = 'https://www.facebook.com/pages/Qute/368537286624382';

function db2array(rows) {
	var returnArray = [];

	var fieldCount;
	//fieldCount is property in Android
	if (Ti.Platform.name === 'android') {
		fieldCount = rows.fieldCount;
	} else {
		fieldCount = rows.fieldCount();
	}

	var obj = {};

	while (rows.isValidRow()) {
		obj = new Object();
		for (var i = 0; i < fieldCount; i++) {
			obj[rows.fieldName(i)] = rows.field(i);
		}
		console.log(obj);
		returnArray.push(obj);
		rows.next();
	}
	console.log(returnArray);
	return returnArray;
}

function SettingsWindow() {

	var btnClose = Ti.UI.createButton({
		title : L('navibar_button_title_cancel'),
		style : Ti.UI.iPhone.SystemButtonStyle.BAR
	});

	var btnSave = Ti.UI.createButton({
		title : L('navibar_button_title_save'),
		style : Ti.UI.iPhone.SystemButtonStyle.DONE,
		enabled : false
	});

	var main = Ti.UI.createWindow({
		navBarHidden : false,
		leftNavButton : btnClose,
		rightNavButton : btnSave,
		title : L('window_title_settings')
	});

	var navWin = Ti.UI.iOS.createNavigationWindow({
		tintColor : COLOR_PURPLE,
		backgroundColor : 'white',
		modal : true,
		window : main
	});

	var powerByDropboxView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : 30,
		layout : 'horizontal'
	});

	var powerByText = Ti.UI.createLabel({
		font : {
			fontSize : 12
		},
		color : '#999999',
		text : L('settings_power_by'),
		left : 100
	});

	var dropboxImage = Ti.UI.createImageView({
		image : 'images/icon_dropbox.png',
		left : 2
	});

	powerByDropboxView.add(powerByText);
	powerByDropboxView.add(dropboxImage);

	var settingsSection = Ti.UI.createTableViewSection({
		footerView : powerByDropboxView
	});

	var languageRow = Ti.UI.createTableViewRow({
		height : 44
	});

	var languageView = Ti.UI.createView({
		height : Ti.UI.FILL
	});

	var languageTitle = Ti.UI.createLabel({
		font : {
			fontSize : 16
		},
		text : L('settings_title_language'),
		left : 12,
		color : 'black'
	});

	var lang = 'English';
	var langProperty = Ti.App.Properties.getString('locale');
	if (langProperty.indexOf('zh') > -1) {
		if (langProperty.indexOf('CN') > -1 || langProperty.indexOf('Hans') > -1) {
			lang = '简体中文';
			lang_at = 2;
		} else {
			lang = '繁體中文';
			lang_at = 1;
		}
	} else {
		lang = 'English';
		lang_at = 0;
	}

	lang_origin = lang_at;

	var languageValue = Ti.UI.createLabel({
		font : {
			fontSize : 14
		},
		text : lang,
		right : 12,
		color : COLOR_PURPLE
	});

	languageView.add(languageTitle);
	languageView.add(languageValue);

	languageRow.add(languageView);

	var btnDone = Ti.UI.createButton({
		style : Ti.UI.iPhone.SystemButtonStyle.DONE,
		title : L('toolbar_button_title_done')
	});

	var btnCancel = Ti.UI.createButton({
		style : Ti.UI.iPhone.SystemButtonStyle.DONE,
		title : L('toolbar_button_title_cancel')
	});

	var btnFlexSpace = Ti.UI.createButton({
		systemButton : Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE
	});

	var langToolbar = Ti.UI.iOS.createToolbar({
		height : 40,
		width : '100%',
		left : 0,
		top : 0,
		items : [btnCancel, btnFlexSpace, btnDone]
	});

	var langView = Ti.UI.createView({
		height : 260,
		backgroundColor : 'white',
		bottom : 0
	});

	var data = [];
	data[0] = Ti.UI.createPickerRow({
		title : 'English'
	});
	data[1] = Ti.UI.createPickerRow({
		title : '繁體中文'
	});
	data[2] = Ti.UI.createPickerRow({
		title : '简体中文'
	});

	var langPicker = Ti.UI.createPicker({
		selectionIndicator : true,
		top : 40,
		left : 0,
		width : 320,
		height : 230
	});

	langPicker.add(data);

	langView.add(langPicker);
	langView.add(langToolbar);

	//main.add(langView);

	btnDone.addEventListener('click', function(e) {
		Ti.API.info('lang at ' + lang_at);
		if (lang_at == lang_select) {
			//didn't change the option
		} else {
			lang_at = lang_select;
			languageValue.text = langsName[lang_at];

		}

		if (lang_at != lang_origin) {
			btnSave.enabled = true;
		} else {
			btnSave.enabled = false;
		}

		Ti.API.info('The locale is ' + Ti.Platform.locale);
		Ti.API.info('Current locale is ' + Ti.App.Properties.getString('locale'));
		Ti.API.info('Custom? ' + Ti.App.Properties.getBool('customLocal'));

		//langViewAnimation.bottom = -260;
		langView.animate(langViewHideAnimation);

		Ti.API.info('PICKER DONE');
		main.remove(langView);
	});

	btnCancel.addEventListener('click', function(e) {
		//langViewAnimation.bottom = -260;
		langView.animate(langViewHideAnimation);

		Ti.API.info('PICKER CANCELED');

	});

	var langViewShowAnimation = Ti.UI.createAnimation({
		duration : 500,
		bottom : 0
	});

	var langViewHideAnimation = Ti.UI.createAnimation({
		duration : 500,
		bottom : -260
	});

	langViewHideAnimation.addEventListener('complete', function(e) {
		main.remove(langView);
		//langView.visible = false;
	});

	languageRow.addEventListener('click', function(e) {
		//language selector
		//lang_is_showing = true;

		main.add(langView);

		//langViewAnimation.bottom = 0;
		langView.bottom = -260;
		langView.animate(langViewShowAnimation);

		langView.visible = true;

		langPicker.setSelectedRow(0, lang_at, false);

		langPicker.addEventListener('change', function(e) {
			Ti.API.info('PICKER CHANGED: ' + e.rowIndex);
			lang_select = e.rowIndex;
		});

	});

	settingsSection.add(languageRow);

	var syncRow = Ti.UI.createTableViewRow({
		height : 44,
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY
	});

	var syncTitle = Ti.UI.createLabel({
		font : {
			fontSize : 16
		},
		text : L('settings_title_sync'),
		left : 12,
		color : 'black'
	});

	var syncSwitch = Ti.UI.createSwitch({
		value : Ti.App.Properties.getBool('syncing'),
		color : COLOR_PURPLE,
		right : 12
	});

	syncRow.add(syncTitle);
	syncRow.add(syncSwitch);

	settingsSection.add(syncRow);

	// Create dropbox client if syncing

	var getDelta = function() {
		var options = {

		};
		client.delta(options, function(status, reply) {
			Ti.API.info(status);
			Ti.API.info(reply);
			/*console.log(typeof reply);
			 if (reply['error']){
			 console.log('Error!');
			 client.login(function(options){
			 //console.log('Great! login done!'+options.toString());
			 getDelta();

			 });
			 }*/
		});
	};

	var logout = function() {
		// Not really logout. Or it will repeatly log in
		cookiejar.clearWebViewCookies('.dropbox.com');
		console.log('Before logout: ' + Ti.App.Properties.getString('DROPBOX_TOKENS'));
		Ti.App.Properties.setString('DROPBOX_TOKENS', null);
		Ti.App.Properties.setBool('syncing', false);
	};

	var pureExport = function() {
		var db = Ti.Database.open('qute');
		var rows = db.execute('SELECT * FROM history ORDER BY id DESC');

		var fieldCount;
		//fieldCount is property in Android
		if (Ti.Platform.name === 'android') {
			fieldCount = rows.fieldCount;
		} else {
			fieldCount = rows.fieldCount();
		}

		while (rows.isValidRow()) {
			var obj = {};
			for (var i = 0; i < fieldCount; i++) {
				obj[rows.fieldName(i)] = rows.field(i);
			}

			var photo_name = obj['img'].split('/')[1];
			var unique_name = photo_name.split('.png')[0];

			client.put('Content/' + unique_name + '.json', JSON.stringify(obj), {
				overwrite : true
			}, function(stat, reply) {
				Ti.API.info('stat:' + stat);
				Ti.API.info('reply:' + JSON.stringify(reply));
			});

			var photo_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + obj['img']);
			client.put('Photo/' + photo_name, photo_file.read(), {
				overwrite : true
			}, function(stat, reply) {
				Ti.API.info('stat:' + stat);
				Ti.API.info('reply:' + JSON.stringify(reply));
			});

			// Update last_sync in local data
			var datetime = new Date().toISOString();
			db.execute('UPDATE history SET last_sync=?,sync_address=? WHERE id=?', datetime, unique_name, obj['id']);
			
			//TODO: make dropbox file also include sync_address update
			rows.next();
		}
		db.close();
	};

	var getAllData = function() {
		var db = Ti.Database.open('qute');
		var rows = db.execute('SELECT * FROM history ORDER BY id DESC');

		var fieldCount;
		//fieldCount is property in Android
		if (Ti.Platform.name === 'android') {
			fieldCount = rows.fieldCount;
		} else {
			fieldCount = rows.fieldCount();
		}

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
			conosle.log('img named: ' + img_file_name);
			data_keys.push(img_file_name.split('.')[0]);

			rows.next();
		}
		db.close();
		return [datas, data_keys];
	};

	var importOrExport = function() {
		console.log('method: importOrExport');
		// 1. Get files metadata from dropbox
		var dropbox_files = [];
		client.metadata('Content', {
			list : true,
			include_deleted : false
		}, function(stat, reply) {
			dropbox_files = reply['contents'];
			if (dropbox_files.length == 0) {
				pureExport();
			} else {
				console.log('Go importOrExport one by one!\n' + JSON.stringify(reply));
				console.log('Cloud has ' + dropbox_files.length + ' files');
				// 2. Get local datas
				var datasAndKeys = getAllData();
				var datas = datasAndKeys[0];
				var data_keys = datasAndKeys[1];
				console.log('Local has ' + datas.length + ' datas. And ' + data_keys.length + ' keys');
				// 3. Check if file exist in local? EXIST:continue NO:get
				dropbox_files.forEach(function(element, key, array) {
					var id2 = element['path'].split('Content/')[1];
					var id = id2.split('.')[0];

					var at = data_keys.indexOf(id);
					console.log('Path: ' + element['path'] + ':: ID: ' + id + ':: at:' + at);
					console.log(element['modified'] + ' = ' + (new Date(element['modified'])).getTime());
					//TODO: add real action to do import or export
					if (at < 0) {
						// Not existed in local. Download it
						client.get(element['path'], {}, function(stat, reply, metadata) {
							console.log('metadata:'+metadata);
							var content = JSON.parse(reply);
							if (content.title) {
								var db = Ti.Database.open('qute');
								db.execute('INSERT INTO history (title, date, qrtype, content, raw, img, loved, post_id, qute_link, last_update, last_sync, from_me, sync_address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', content.title, content.date, content.qrtype, content.content, content.raw, content.img, content.loved, content.post_id, content.qute_link, content.last_update, content.last_sync, content.from_me, content.sync_address);
								db.close();
								var photo_path = JSON.parse(metadata).path.replace('Content','Photo');
								photo_path.replace('.json','.png');
								client.get(photo_path, {}, function(stat, reply, metadata) {
									var foldername = Ti.Filesystem.applicationDataDirectory + "Qute/";
									var folder = Ti.Filesystem.getFile(foldername);
									if (!folder.exists()) {
										folder.createDirectory();
									}

									//Save file to local storage
									var img_name = 'Qute/'+JSON.parse(metadata).path.splite('Photo/')[1]; // Get image file name
									var filename = Ti.Filesystem.applicationDataDirectory + img_name;
									var file = Ti.Filesystem.getFile(filename);
									file.write(reply);
								});
							}
							Ti.API.info('The file content: ' + JSON.parse(reply).title);
						});
					} else {
						// File existed.
						// 4. Check if dropbox_file_date >(newer) local_file_date? YES:get EQUAL:skip NO:upload(content)
						// tolerance: Newer - 1 min. - Equal - 1 min. - Older
						console.log(element['modified'] + ' = ' + (new Date(element['modified'])).getTime());
						var dropbox_file_date = (new Date(element['modified'])).getTime();
						var local_file_date = (new Date(datas[at].last_update)).getTime();
						if (dropbox_file_date > local_file_date + 60000) {
							// Dropbox newer than Local. Need to download file

						} else if (dropbox_file_date < local_file_date - 60000) {
							// Dropbox older than Local. Need to update dropbox data

						} else {
							// Equal. Nothing to do.
						}
					}
				});
			}
		});

		// TODO: 5. The rest local data: Upload (photo+content)

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

	/*Ti.App.addEventListener('dropbox_error', function(e) {
	 client.login(function(options) {
	 //console.log('Great! login done!'+options.toString());
	 getDelta();

	 });
	 });*/

	syncSwitch.addEventListener('change', function(e) {
		if (e.value) {
			console.log('Start connecting to Dropbox');
			if (client.isAuthorized()) {
				console.log('Already logged in');
				//getDelta();
				doSync();
			} else {
				console.log('Go logging in');
				client.login(function(options) {
					Ti.App.Properties.setBool('syncing', true);
					console.log('Great! login done!' + options.toString());
					console.log('syncing: ' + Ti.App.Properties.getBool('syncing'));
					//getDelta();
					doSync();
				});
			}
		} else {
			// do logout
			logout();
		}
	});

	var linkSection = Ti.UI.createTableViewSection({

	});

	var visitQuteRow = Ti.UI.createTableViewRow({
		height : 44,
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY
	});

	var visitQuteView = Ti.UI.createView({
		height : Ti.UI.FILL
	});

	var visitQuteLabel = Ti.UI.createLabel({
		text : L('settings_item_visit_qute'),
		color : COLOR_PURPLE,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		}
	});

	visitQuteRow.addEventListener('click', function(e) {
		var confirmVisitQute = Ti.UI.createOptionDialog({
			title : URL_QUTE,
			options : [L('confirm_option_visit_qute'), L('confirm_option_cancel')],
			cancel : 1
		});

		confirmVisitQute.addEventListener('click', function(e) {
			if (e.index == 0) {
				Ti.Platform.openURL(URL_QUTE);
			}
		});

		confirmVisitQute.show();
		//Ti.Platform.openURL(URL_QUTE);
	});

	visitQuteView.add(visitQuteLabel);
	visitQuteRow.add(visitQuteView);

	linkSection.add(visitQuteRow);

	var authorSection = Ti.UI.createTableViewSection({

	});

	//Tweet me option
	var tweetMeRow = Ti.UI.createTableViewRow({
		height : 44,
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY
	});

	var tweetMeView = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	});

	var tweetMeLabel = Ti.UI.createLabel({
		text : '@paperli',
		color : COLOR_PURPLE,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		}
	});

	tweetMeRow.addEventListener('click', function(e) {
		if (!Ti.Platform.openURL('twitter://user?screen_name=paperli')) {
			Ti.Platform.openURL('http://twitter.com/paperli');
		}
	});

	tweetMeView.add(tweetMeLabel);
	tweetMeRow.add(tweetMeView);

	authorSection.add(tweetMeRow);

	//Email me option
	var emailMeRow = Ti.UI.createTableViewRow({
		height : 44,
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.GRAY
	});

	var emailMeView = Ti.UI.createView({
		height : Ti.UI.FILL,
		width : Ti.UI.FILL
	});

	var emailMeLabel = Ti.UI.createLabel({
		text : 'paper.li@gmail.com',
		color : COLOR_PURPLE,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		}
	});

	emailMeRow.addEventListener('click', function(e) {
		var emailDialog = Ti.UI.createEmailDialog({
			subject : L('email_subject'),
			messageBody : L('email_body'),
			toRecipients : ['paper.li@gmail.com']
		});
		emailDialog.open();
	});

	emailMeView.add(emailMeLabel);
	emailMeRow.add(emailMeView);

	authorSection.add(emailMeRow);

	var table = Ti.UI.createTableView({
		style : Ti.UI.iPhone.TableViewStyle.GROUPED
	});

	table.appendSection(settingsSection);
	table.appendSection(linkSection);
	table.appendSection(authorSection);
	//table.appendRow(visitQuteRow);

	main.add(table);

	var claimView = Ti.UI.createView({
		width : 'auto',
		height : 60,
		bottom : 10,
		layout : 'vertical'
	});

	var claimPaperworks = Ti.UI.createView({
		backgroundImage : '/images/paperworks.png',
		width : 200,
		height : 28,
		bottom : 4
	});

	var claimLabel = Ti.UI.createLabel({
		text : L('claim_msg'),
		color : '#999999',
		font : {
			fontSize : 12
		}
	});

	claimView.add(claimPaperworks);
	claimView.add(claimLabel);

	main.add(claimView);

	navWin.open({
		modal : true,
		modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
		modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_CURRENT_CONTEXT
	});

	btnClose.addEventListener('click', function(e) {
		navWin.close({
			transition : Ti.UI.iPhone.AnimationStyle.CURL_DOWN
		});
	});

	//Save the settings
	btnSave.addEventListener('click', function(e) {

		if (lang_at != lang_origin) {
			Ti.App.Properties.setString('locale', langs[lang_at]);
			Ti.App.Properties.setBool('customLocal', true);

			//Must re-launch the app to make the change of lang.

			if (lang_at == 0) {
				//en
				locale.setLocale("en");
			} else if (lang_at == 1) {
				//zh_TW
				locale.setLocale("zh_TW");
			} else {
				//zh_CN
				locale.setLocale("zh_CN");
			}

			var alertUpdateLang = Ti.UI.createAlertDialog({
				title : L('alert_title_lang_changed'),
				message : L('alert_msg_lang_changed')
			});

			alertUpdateLang.show();
		}

		navWin.close({
			transition : Ti.UI.iPhone.AnimationStyle.CURL_DOWN
		});

	});

	return main;

};

module.exports = SettingsWindow;
