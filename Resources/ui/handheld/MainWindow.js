function isIOS7Plus() {
	// iOS-specific test
	if (Titanium.Platform.name == 'iPhone OS') {
		var version = Titanium.Platform.version.split(".");
		var major = parseInt(version[0], 10);

		// Can only test this support on a 3.2+ device
		if (major >= 7) {
			return true;
		}
	}
	return false;
}

var ICON_LOVED = '/images/icon_loved.png';
var ICON_UNLOVED = '/images/icon_unloved.png';
var ICON_STATUS_COMMENT = '/images/icon_status_comment.png';
var ICON_STATUS_OFFLINE = '/images/icon_status_offline.png';
var ICON_STATUS_ONLINE = '/images/icon_status_online.png';

var COLOR_PURPLE = '#9857a7';
var COLOR_GREY = '#dddddd';
var COLOR_GUIDE_TEXT = '#1B2326';

var need_refresh = false;
//set to true if something changed in Result page
var loveds = [];
var history = [];
var historyRows = [];
var historyIds = [];
var lovedRows = [];
var iOS7 = isIOS7Plus();
var theTop = iOS7 ? 20 : 0;
var billboardHeight = 160;
var history_amount;
var table;
//var blankSpaceHeader;
var segmenterHeader;
var segmenterIndex = 0;
var scannerPicOverlayHeader;
var scannerPicPlaceholder;
var ResultWindow = require('ui/handheld/Result');
var LoginWidget = require('ui/handheld/LoginWidget');
var hasExtraSpace = true;
var self;
var ios7;
var SCANNER_PIC_PLACEHOLDER_URL = '/images/pic_placeholder.png';
var TABLE_CELL_HEIGHT = 60;
var patt_http = /^(http|https)/gi;
var patt_web = /^bit\.ly|^www\.|^tinyurl\.com|^goo\.gl|[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}([\/]+[a-zA-Z0-9\/\-\?\$\=]*$|$))/g;
var fb = require('facebook');
var Toast = require('ui/handheld/iToast');
var Loading = require('ui/handheld/iLoading');
var SettingsWindow = require('ui/handheld/SettingsWindow');
var Keys = require('keys');
var LikedAnimation = require('ui/handheld/LikedAnimation');
var tableData = [];
//var Login = require('ui/handheld/Login');

var QRRow = require('ui/handheld/QRRow');

var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function MainWindow() {

	//Determine if ios7+
	ios7 = isIOS7Plus();

	var main = Ti.UI.createWindow({
		backgroundColor : '#000000',
		title : L('window_title_scanner'),
		tintColor : '#d1140b',
		navBarHidden : true,
		statusBarStyle : Ti.UI.iPhone.StatusBar.LIGHT_CONTENT
	});

	scannerPicPlaceholder = Ti.UI.createImageView({
		top : 0,
		image : SCANNER_PIC_PLACEHOLDER_URL,
		width : 320,
		height : 480
	});

	/*if (Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + 'last.png').exists()) {
	 var temp = Ti.UI.createImageView({
	 image : Ti.Filesystem.applicationDataDirectory + 'last.png',
	 width : 'auto',
	 height : 'auto'
	 });

	 var h = 320 * temp.toImage().height / temp.toImage().width;
	 scannerPicPlaceholder.setHeight(h);
	 scannerPicPlaceholder.setImage(Ti.Filesystem.applicationDataDirectory + 'last.png');

	 temp = null;
	 }*/

	var scannerButton = Ti.UI.createButton({
		center : {
			x : '50%',
			y : '50%'
		},
		width : TABLE_CELL_HEIGHT,
		height : TABLE_CELL_HEIGHT,
		image : '/images/button_scan.png',
		tintColor : '#ffffff',
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	var scannerPicPlaceholderOverlay = Ti.UI.createView({
		backgroundColor : '#66000000',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});

	main.add(scannerPicPlaceholder);
	main.add(scannerPicPlaceholderOverlay);
	//self.add(scannerButton);

	var TiBar = require('tibar');

	scannerButton.addEventListener('click', function() {
		Ti.API.info('Start scanning');
		TiBar.scan({
			// simple configuration for iPhone simulator
			configure : {
				classType : "ZBarReaderViewController",
				sourceType : "Camera",
				cameraMode : "Sampling",
				videoQuality : "UIImagePickerControllerQualityTypeIFrame960x540",
				config : {
					"showsCameraControls" : true,
					"showsHelpOnFail" : true,
					"takesPicture" : true,
					"tracksSymbols" : true,
					"showsZBarControls" : true
				},
				symbol : {
					"QR-Code" : true,
					"PDF417" : true,
					"CODE-128" : true,
					"CODE-39" : true,
					"I25" : true,
					"DataBar" : true,
					"DataBar-Exp" : true,
					"EAN-13" : true,
					"EAN-8" : true,
					"UPC-A" : true,
					"UPC-E" : true,
					"ISBN-13" : true,
					"ISBN-10" : true
				}
			},
			success : function(data) {

				//Vibrate when scan successfully
				Ti.Media.vibrate([0, 500]);

				Ti.API.info('TiBar success callback!');
				if (data && data.barcode) {

					//adjust image size
					var temp = Ti.UI.createImageView({
						image : Ti.Filesystem.applicationDataDirectory + 'last.png',
						width : 'auto',
						height : 'auto'
					});

					var h = 320 * temp.toImage().height / temp.toImage().width;

					scannerPicPlaceholder.setHeight(h);
					scannerPicPlaceholder.setImage(temp.toImage());

					//save to camera roll
					/*Ti.Media.saveToPhotoGallery(temp.toImage(),function(){
					Ti.UI.createAlertDialog({
					title:'Saved!'
					}).show();
					});*/

					//Save to db
					var db = Ti.Database.open('qute');
					var datetime = new Date().toISOString();
					var qr_type = -1;
					if (data.barcode.search(patt_http) < 0 && data.barcode.search(patt_web) < 0) {
						//other type: 1
						//TODO: add more types
						Ti.API.info("No. it's not link");
						qr_type = 1;

					} else {
						//HTTP type: 0
						Ti.API.info("You call it is http");
						qr_type = 0;
					}

					//db.execute('INSERT INTO history (title, date, qrtype, content, raw, img, loved, last_update, from_me) VALUES (?,?,?,?,?,?,?,?,?)', data.barcode, datetime, qr_type, data.barcode, data.barcode, "none", 0, datetime, 0);
					
					//select/create directory
					var foldername = Ti.Filesystem.applicationDataDirectory + "Qute/";
					var folder = Ti.Filesystem.getFile(foldername);
					if (!folder.exists()) {
						folder.createDirectory();
					}

					//Save file to local storage
					// TODO:careful! too long the file name!
					var img_file_name = (new Date()).getTime() + '' + (db.lastInsertRowId + 1);
					console.log('new image name is ' + img_file_name);
					var filename_part = "Qute/" + img_file_name + ".png";
					//var filename_part = "Qute/" + getUniqueFileName() + ".png";
					var filename = Ti.Filesystem.applicationDataDirectory + filename_part;
					var file = Ti.Filesystem.getFile(filename);
					file.write(temp.toImage());

					//save to Camera Roll
					//TODO: save photo in Camera Roll. But hard to find the pic?
					/*Ti.Media.saveToPhotoGallery(temp.toImage(),{
					success:function(e){
					var text = '';
					for (var i in e){
					text += ''+i+': '+e[i]+'; ';
					}
					alert(text);
					},
					error:function(e){
					alert(e.error);
					}
					});*/

					//temp = null;

					//db.execute('UPDATE history SET img=? WHERE id=?', filename_part, db.lastInsertRowId);
					db.execute('INSERT INTO history (title, date, qrtype, content, raw, img, loved, last_update, from_me) VALUES (?,?,?,?,?,?,?,?,?)', data.barcode, datetime, qr_type, data.barcode, data.barcode, filename_part, 0, datetime, 0);					
					
					//alert(new_id.fieldByName('id'));

					//TODO: post_id will be only gotten after upload or contacting fb api. need to be consider properly
					var newQR = {
						title : data.barcode,
						img : filename_part,
						raw : data.barcode,
						date : datetime,
						id : db.lastInsertRowId,
						post_id : 0, //have to reassign this value after create or follow thread in Result
						qrtype : qr_type,
						loved : 0
					};

					/*var history_result = db.execute('SELECT * FROM history ORDER BY id DESC');
					var temp_historys = db2array(history_result);
					history = temp_historys[0];
					historyIds = temp_historys[1];
					temp_historys = null;

					history_amount = history.length;
					

					//var newRow = updateTable(newQR);
					var newRow = new QRRow(newQR);
					//Add click row event
					newRow.addEventListener('click', function(e) {
						if (e.source.toString() == '[object TiUIButton]') {
							return;
						}

						var result = new ResultWindow(e.rowData['itemData'], e.row);
						self.openWindow(result);
					});
					
					historyRows.unshift(newRow);
					
					refreshTable(segmenterIndex);*/
					
					db.close();

					temp = null; // temp imageview
					
					var newRow = new QRRow(newQR);
					//Add click row event
					newRow.addEventListener('click', function(e) {
						if (e.source.toString() == '[object TiUIButton]') {
							return;
						}

						var result = new ResultWindow(e.rowData['itemData'], e.row);
						self.openWindow(result);
					});
					
					// broadcast the event to refresh the table
					self.fireEvent('new',{newQR:newQR,newRow:newRow});
					
					//TODO: Can NOT delete the QR row that just created. Because of updateSection?
					//show result page
					var result = new ResultWindow(newQR, newRow);
					self.openWindow(result);

					newRow = null;
					//Update table after showing result page
					//updateTable(newQR);
				}
			},
			cancel : function() {
				Ti.API.info('TiBar cancel callback!');
				self.setActiveTab(0);
			},
			error : function() {
				Ti.API.info('TiBar error callback!');
			}
		});
	});

	var scannerPicOverlay = Ti.UI.createView({
		height : billboardHeight,
		backgroundGradient : {
			type : 'linear',
			startPoint : {
				x : '0%',
				y : '0%'
			},
			endPoint : {
				x : '0%',
				y : '100%'
			},
			colors : [{
				color : '#00000000',
				offset : 0.0
			}, {
				color : '#00000000',
				offset : 0.4
			}, {
				color : '#66000000',
				offset : 0.85
			}, {
				color : '#CC000000',
				offset : 1.0
			}]
		}
	});

	scannerPicOverlay.add(scannerButton);

	//Add settings button
	var settingsButton = Ti.UI.createButton({
		image : '/images/icon_settings.png',
		width : 44,
		height : 44,
		top : 4,
		right : 16,
		tintColor : 'white',
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	scannerPicOverlay.add(settingsButton);

	settingsButton.addEventListener('click', function(e) {
		var settingsWin = new SettingsWindow();
	});

	scannerPicOverlayHeader = Ti.UI.createTableViewSection({
		headerView : scannerPicOverlay
	});

	/*var blankSpaceHeaderView = Ti.UI.createView({
		opacity : 0,
		height : 20,
		width : '100%'
	});

	blankSpaceHeader = Ti.UI.createTableViewSection({
		headerView : blankSpaceHeaderView
	});

	var blankSpaceRow = Ti.UI.createTableViewRow({
		height : 100,
		opacity : 0,
		width : '100%',
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	blankSpaceHeader.add(blankSpaceRow);*/

	var segmenterRow = Ti.UI.createView({
		width : '100%',
		height : 44,
		backgroundColor : '#ffffff'
	});

	var segmenter = Ti.UI.iOS.createTabbedBar({
		tintColor : '#9857a7',
		labels : [{
			image : '/images/icon_segmenter_history_selected.png'
		}, {
			image : '/images/icon_segmenter_favorite.png'
		}],
		center : {
			x : '50%',
			y : '50%'
		},
		width : '90%',
		index : 0
	});

	if (!ios7) {
		//set up segmenter style
		segmenter.style = Ti.UI.iPhone.SystemButtonStyle.BAR;
		segmenter.backgroundColor = COLOR_PURPLE;
	}

	segmenterRow.add(segmenter);

	segmenterHeader = Ti.UI.createTableViewSection({
		headerView : segmenterRow
	});

	segmenter.addEventListener('click', function(e) {
		if (segmenter.index == 0) {
			//at history
			segmenter.labels = [{
				image : '/images/icon_segmenter_history_selected.png'
			}, {
				image : '/images/icon_segmenter_favorite.png'
			}];

			refreshTable(0);

			segmenterIndex = 0;
		} else {
			//at favorite
			segmenter.labels = [{
				image : '/images/icon_segmenter_history.png'
			}, {
				image : '/images/icon_segmenter_favorite_selected.png'
			}];

			refreshTable(1);

			segmenterIndex = 1;
		}
	});

	var db = Ti.Database.open('qute');
	var history_result = db.execute('SELECT * FROM history ORDER BY id DESC');
	history_amount = history_result.rowCount;
	//var history = [];
	var row, element;
	var tempImg;
	var tempTitle;
	var dateblock;
	history_amount = history_result.rowCount;
	if (history_result.rowCount > 0) {
		history = [];
		historyIds = [];
		var i = 0;
		//history = db2array(history_result);
		//var rows = [];
		while (history_result.isValidRow()) {
			element = dbRow2Array(history_result);
			history.push(element);
			historyIds.push(element.id);
			row = new QRRow(element);
			row.name = 'row' + i;

			//Add click row event
			row.addEventListener('click', function(e) {
				if (e.source.toString() == '[object TiUIButton]') {
					return;
				}

				var result = new ResultWindow(e.rowData['itemData'], e.row);
				self.openWindow(result);
			});

			historyRows.push(row);

			//save to loveds
			if (element['loved'] == 1) {
				loveds.push(element);
				lovedRows.push(row);
			}

			i++;
			history_result.next();

			segmenterHeader.add(row);
		}
		/*history.forEach(function(element, index, array) {

		 row = new QRRow(element);

		 row.name = 'row' + index;
		 historyRows.push(row);
		 //save to loveds
		 if (element['loved'] == 1) {
		 loveds.push(element);
		 lovedRows.push(row);
		 }

		 //Add click row event
		 row.addEventListener('click', function(e) {
		 if (e.source.toString() == '[object TiUIButton]') {
		 return;
		 }

		 var result = new ResultWindow(e.rowData['itemData']);
		 self.openWindow(result);
		 });

		 segmenterHeader.add(row);
		 });*/

	}

	db.close();

	if (history_amount > 0) {
		var temp = Ti.UI.createImageView({
			image : Ti.Filesystem.applicationDataDirectory + history[0]['img'],
			width : 'auto',
			height : 'auto'
		});

		var h = 320 * temp.toImage().height / temp.toImage().width;
		scannerPicPlaceholder.setHeight(h);
		scannerPicPlaceholder.setImage(temp.toImage());

		temp = null;
	}

	/*var row;
	var rows = [];
	for (var i = 0; i < 10; i++) {
	row = Ti.UI.createTableViewRow({
	backgroundColor : '#ffffff',
	title : 'the ' + i + 'st row'
	});
	segmenterHeader.add(row);
	}*/

	//table.setData(rows);

	table = Ti.UI.createTableView({
		top : theTop,
		backgroundColor : '#00ffffff',
		separatorStyle : Ti.UI.iPhone.TableViewSeparatorStyle.SINGLE_LINE,
		separatorColor : '#9857a7',
		editable : true,
		moveable : true
	});
	
	tableData[0] = scannerPicOverlayHeader;
	tableData[1] = segmenterHeader;
	
	table.data = tableData;

	Ti.API.info('index of row1 is ' + table.getIndexByName('row1'));

	//No items in history table
	var noItemHistory = Ti.UI.createView({
		layout : 'vertical',
		width : 280,
		height : Ti.UI.SIZE,
		top : 60
	});

	var noItemHistoryPic = Ti.UI.createView({
		backgroundImage : '/images/icon_guide_scan.png',
		width : 80,
		height : 80,
		top : 0
	});

	var noItemHistoryText = Ti.UI.createLabel({
		text : L('no_item_quote_history'),
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		font : {
			fontSize : 18
		},
		color : COLOR_GUIDE_TEXT,
		top : 10,
		textAlign : 'center'
	});

	noItemHistory.add(noItemHistoryPic);
	noItemHistory.add(noItemHistoryText);

	//No items in loved table
	var noItemLoved = Ti.UI.createView({
		layout : 'vertical',
		width : 280,
		height : Ti.UI.SIZE,
		top : 60
	});

	var noItemLovedPic = Ti.UI.createView({
		backgroundImage : '/images/icon_guide_loved.png',
		width : 80,
		height : 80,
		top : 0
	});

	var noItemLovedText = Ti.UI.createLabel({
		text : L('no_item_quote_loved'),
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		font : {
			fontSize : 18
		},
		color : COLOR_GUIDE_TEXT,
		top : 10,
		textAlign : 'center'
	});

	noItemLoved.add(noItemLovedPic);
	noItemLoved.add(noItemLovedText);

	//UI: to attach extra space view
	var extraSpaceHeight = Ti.Platform.displayCaps.platformHeight - billboardHeight - 44 * (history_amount + 1);

	if (extraSpaceHeight > 0) {
		hasExtraSpace = true;

		var extraSpace = Ti.UI.createTableViewRow({
			backgroundColor : '#ffffff',
			height : extraSpaceHeight < 0 ? 0 : extraSpaceHeight,
			//title : (history_amount == 0) ? L('Let QR enlight your LIFE!') : ' ',
			editable : false,
			moveable : false,
			selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
		});

		//Show no item view if no items in History table
		if (history_amount == 0) {
			extraSpace.add(noItemHistory);
		}

		table.appendRow(extraSpace);
	} else {
		hasExtraSpace = false;
	}

	//table.insertRowBefore(0,blankSpaceRow);
	//table.scrollToTop(120);

	/*table.addEventListener('singletap', function(e) {
	 //workaround to  prevent invoke row click
	 if (e.source.toString() == '[object TiUIButton]') {
	 return;
	 }

	 var result = new resultWindow(e.rowData['itemData']);
	 self.openWindow(result);
	 });*/

	/*Ti.App.addEventListener('data_updated', function(e) {
	 var loadingView = new Loading();
	 //loadingView.top = 100;
	 main.add(loadingView);
	 updateTableRows();
	 //Below code to fix refresh problem when scroll on table
	 //TODO:bad Fix, it may cause by the update of section rows. Better solution?
	 //TODO:Add loading icon when performing action
	 if (segmenter.index == 0){
	 //at history
	 refreshTable(0);
	 } else {
	 //at favorate
	 refreshTable(1);
	 }
	 //var now = new Date();
	 loadingView.fireEvent('done');
	 //Ti.API.info('Loading is done at '+now.toLocaleTimeString());
	 });*/

	/*Ti.App.addEventListener('delete_row', function(e) {
	 Ti.API.info('Deleted item at ' + e.itemId);
	 deleteRow(e.itemId);
	 });*/

	table.addEventListener('delete', function(e) {
		Ti.API.info('Deleted item at ' + e.rowData['itemId']);
		deleteRow(e.rowData['itemId'], e.row);
		//TODO:delete from local array
		
	});

	table.addEventListener('scroll', function(e) {
		var offset = e.contentOffset.y;
		//Ti.API.info('offset: ' + offset);

		var fadeOut = Ti.UI.createAnimation({
			opacity : 0,
			duration : 500
		});

		var fadeIn = Ti.UI.createAnimation({
			opacity : 1,
			duration : 500
		});

		if (offset < -40) {
			scannerButton.animate(fadeOut);
			scannerPicPlaceholderOverlay.animate(fadeOut, function() {
				//do something after fade out
			});
		} else {
			scannerButton.animate(fadeIn);
			scannerPicPlaceholderOverlay.animate(fadeIn, function() {
				//do something after fade in
			});
		}

		/*if (offset < -80){
		 //reset alpha status
		 //scannerPicPlaceholderOverlay.setOpacity(1);
		 //launch camera
		 scannerButton.fireEvent('click');
		 }*/
	});

	main.add(table);

	self = Ti.UI.iOS.createNavigationWindow({
		window : main,
		backgroundColor : 'white',
		tintColor : '#9857a7'
	});

	//var loginWin = new Login();

	/*if (!fb.loggedIn){
	alert('not yet login');
	self.window = loginWin;
	//self.openWindow(loginWin);
	}*/
	
	var reLoginFB = function(){
		var keys = new Keys();
		//login in fb
		fb.appid = keys.facebook_appid;
		fb.permissions = ['publish_actions', 'publish_stream', 'read_stream'];

		fb.forceDialogAuth = true;
		fb.addEventListener('login', function(e) {
			if (e.success) {
				// hide login widget in MainWindow
				//Ti.App.fireEvent('loggedin');
				
				Ti.App.Properties.setBool('loggedin',true);
				
				//descriptionView.remove(hintToLogInBox);
				//checkThreadExist(false);
				
			} else if (e.error) {
				alert(e.error);
			} else if (e.cancelled) {
				alert('Cancelled');
			}
		});
		keys = null;
		fb.authorize();
	};
	
	//The login widget box. Check network status, check login status and skipped
	if (fb.loggedIn) {
		//Not online or logged in or skipped
		//Ti.API.info('Is online or not? '+Ti.Network.online);
		//alert('Is online or not? '+Ti.Network.online);
		//For version 1.0.0 -> 1.1.0
		Ti.App.Properties.setBool('loggedin', true);
	} else if (Ti.App.Properties.getBool('skipped')) {
		//skipped
	} else {
		// Check if the user is already loggedin once. To avoid network status disconnect problem
		if (!Ti.App.Properties.getBool('loggedin')) {
			var slideUpAnimate = Ti.UI.createAnimation({
				bottom : 0,
				duration : 1000
			});

			var fadeOutAnimate = Ti.UI.createAnimation({
				opacity : 0,
				duration : 1000
			});

			var loginWidget = new LoginWidget();
			loginWidget.bottom = -50;
			loginWidget.animate(slideUpAnimate);
			main.add(loginWidget);

			loginWidget.addEventListener('skip', function(e) {
				//skipped. remove login widget
				loginWidget.animate(fadeOutAnimate, function() {
					main.remove(loginWidget);
				});
				//self.remove(loginWidget);
			});

			loginWidget.addEventListener('loggedIn', function(e) {

				var toastLoggedIn = new Toast(L('toast_loggedin'));
				self.add(toastLoggedIn);

				//skipped. remove login widget
				loginWidget.animate(fadeOutAnimate, function() {
					main.remove(loginWidget);
				});
				//self.remove(loginWidget);
			});

			Ti.App.addEventListener('loggedin', function(e) {
				//logged in from Result page
				//Ti.API.info('LOGGED IN REMOVE WIDGET');
				main.remove(loginWidget);
			});
		} else {
			// User logged in fb once, but unknown reason he/she was logged out
			// Do re-login
			if (Ti.Network.online){
				Ti.API.info('Go relogin fb');
				Ti.UI.createAlertDialog({
					title:L('alert_relogin_fb_title'),
					message:L('alert_relogin_fb_msg')
				}).show();
				
				/*var confirmRelogin = Ti.UI.createOptionDialog({
					title:L('confirm_relogin_title'),
					options:[L('confirm_relogin_ok'),L('confirm_relogin_cancel')],
					cancel:1
				});
				
				confirmRelogin.addEventListener('click',function(e){
					if (e.index == 0){
						// Go relogin
						reLoginFB();
					} else {
						// Cancel relogin
						Ti.App.Properties.setBool('loggedin',false);
					}
				});
				
				confirmRelogin.show();*/
				// Will reset the boolean to true after reloggedin
				Ti.App.Properties.setBool('loggedin',false);
				reLoginFB();
				//Ti.App.Properties.setBool('loggedin',false);
			}
		}
	}
	
	self.addEventListener('new',function(e){
		Ti.API.info('Inserting new QR code into tableview');
		var newQR = e.newQR; // data
		var newRow = e.newRow; // cell
		
		var db = Ti.Database.open('qute');
		
		var history_result = db.execute('SELECT * FROM history ORDER BY id DESC');
		var temp_historys = db2array(history_result);
		history = temp_historys[0];
		historyIds = temp_historys[1];
		temp_historys = null;
		
		history_amount = history.length;
					
		historyRows.unshift(newRow);
		refreshTable(segmenterIndex);
		
		db.close();
		
	});
	
	// Listen to loved event. Show animation
	Ti.App.addEventListener('loved',function(e){
		var lovedView = new LikedAnimation();
		main.add(lovedView);
		
		var lovedAnimationDone = function(){
			// kill the animation view
			lovedView.removeEventListener('animationDone',lovedAnimationDone);
			main.remove(lovedView);
			lovedView = null;
		};
		
		lovedView.addEventListener('animationDone',lovedAnimationDone);
	});
	
	// Listen to end_syncing event
	Ti.App.addEventListener('end_syncing', function(e) {
		var changed_ids = e.changed_ids;
		var insert_ids = e.insert_ids;
		console.log('This time syncing changed ' + changed_ids.length + ' items and inserted ' + insert_ids.length + ' items.');
		if (changed_ids.length + insert_ids.length > 0) {
			// Do refresh only if there were something changed or inserted
			var db = Ti.Database.open('qute');
			// TODO:debug
			changed_ids.forEach(function(element, key, array) {
				// TODO: can't find match
				var at = historyIds.indexOf(element);
				if (at >= 0) {
					//Ti.API.info('found match at ' + at + '. History item is ' + history[at]);
					historyRows[at].fireEvent('status_updated');
					var newDataRow = db.execute('SELECT * FROM history WHERE id=?', element);
					history[at] = dbRow2Array(newDataRow);
					newDataRow = null;
				} else {
					Ti.API.info('Error? Can\'t found match');
				}
			});

			// Insert new rows
			insert_ids.forEach(function(element, key, array) {
				var newDataRow = db.execute('SELECT * FROM history WHERE id=?', element);
				var newData = dbRow2Array(newDataRow);
				var newRow = new QRRow(newData);

				//Add click row event
				newRow.addEventListener('click', function(e) {
					if (e.source.toString() == '[object TiUIButton]') {
						return;
					}

					var result = new ResultWindow(e.rowData['itemData'], e.row);
					self.openWindow(result);
				});

				history.unshift(newData);
				historyIds.unshift(element);
				historyRows.unshift(newRow);

				newDataRow = null;
				newRow = null;
			});

			if (insert_ids.length > 0) {
				// TODO: Listener not work after refreshTable!! (updateSection)
				refreshTable(segmenterIndex);

			}

			db.close();
		}
	});

	function refreshTable(section) {
		//section types: 0 history  1 loved
		//var row_amount;
		//var stringNoItem = L('Let QR shine your life!');
		//var db = Ti.Database.open('qute');
		if (section == 0) {
			//history

			segmenterHeader.rows = [];

			var row;
			if (history.length > 0) {
				segmenterHeader.rows = historyRows;
			} else {
				//TODO: no item page
			}
		} else {
			//switch to loved table

			/*segmenterHeader.rows.forEach(function(element, index, array) {
			 this.remove(element);
			 }, segmenterHeader);*/

			segmenterHeader.rows = [];
			loveds = [];
			lovedRows = [];

			for (var i = 0; i < historyRows.length; i++) {
				//Filter out the loveds
				if (historyRows[i].itemData['loved'] == 1) {
					loveds.push(history[i]);
					lovedRows.push(historyRows[i]);
				}
			}

			if (lovedRows.length > 0) {
				segmenterHeader.rows = lovedRows;

			} else {
				//TODO: no loved page
				//stringNoItem = L('Nothing you loved...');
			}

		}

		//db.close();
		var extraSpaceHeight = Ti.Platform.displayCaps.platformHeight - billboardHeight - 44 * (segmenterHeader.rowCount + 1);
		// +1 for segmenter

		if (extraSpaceHeight > 0) {
			hasExtraSpace = true;

			var extraSpace = Ti.UI.createTableViewRow({
				backgroundColor : '#ffffff',
				height : extraSpaceHeight < 0 ? 0 : extraSpaceHeight,
				//title : (segmenterHeader.rowCount == 0) ? stringNoItem : ' ',
				editable : false,
				moveable : false,
				selectedBackgroundColor : '#ffffff'
			});

			//Show no items page for History or Loved table
			if (segmenterHeader.rowCount == 0) {
				if (section == 0) {
					//at history
					extraSpace.add(noItemHistory);
				} else {
					//at loved
					extraSpace.add(noItemLoved);
				}
			}

			segmenterHeader.add(extraSpace);
			//table.appendRow(extraSpace);
		} else {
			hasExtraSpace = false;
		}

		table.data = tableData;
		//table.updateSection(1, segmenterHeader);

	}

	function deleteRow(itemId, row) {
		//delete from db
		var db = Ti.Database.open('qute');
		var delete_item_result = db.execute('SELECT img,post_id,from_me,sync_address FROM history WHERE id=?', itemId);
		var img_url = delete_item_result.fieldByName('img');
		var post_id = delete_item_result.fieldByName('post_id');
		var from_me = delete_item_result.fieldByName('from_me');

		// Assign sync_key to identify shall not sync afterward
		var sync_key = delete_item_result.fieldByName('sync_address');
		if (sync_key == 'no') {
			// fetch file name from image name
			var img_name = img_url.split('Qute/')[1];
			sync_key = img_name.split('.')[0];
		}

		if (post_id !== null && parseInt(post_id, 10) != -1 && parseInt(post_id, 10) != 0 && from_me) {
			//the QR is exised in FB Qute
			var confirmDelThread = Ti.UI.createOptionDialog({
				options : [L('confirm_option_delete_both'), L('confirm_option_delete_local_only'), L('confirm_option_cancel')],
				title : L('confirm_title_delete_from_fb'),
				cancel : 2,
				destructive : 0
			});
			confirmDelThread.show();
			confirmDelThread.addEventListener('click', function(e) {
				if (e.index == 0) {
					//attcg loading widget
					var loadingView = new Loading();
					main.add(loadingView);
					//delete thread from FB
					fb.requestWithGraphPath('' + post_id + '', {}, 'DELETE', function(e) {
						if (e.success) {
							//Step 1: Delete post in Qute
							var toast = new Toast(L('toast_deleted_from_fb'));
							self.add(toast);

							//Step 2: Delete local db and img
							Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + img_url).deleteFile();

							db.execute('DELETE FROM history WHERE id=?', itemId);

							db.execute('INSERT INTO _deleted (deleted_key) VALUES (?)', sync_key);
							
							// Find deleting index from historyIds instead of historyRows (too many variation)
							//var deleted_row_index = historyRows.indexOf(row);
							var deleted_row_index = historyIds.indexOf(itemId);

							if (deleted_row_index > -1) {
								Ti.API.info('deleted row is at ' + deleted_row_index);
								historyRows.splice(deleted_row_index, 1);
								history.splice(deleted_row_index, 1);
								historyIds.splice(deleted_row_index,1);
								history_amount = historyRows.length;
							} else {
								//TODO:handle unknown error
								//not found in history row. something wrong
								Ti.API.info('Something went wrong! Can\'t found match in historyRows');
							}

							db.close();

							refreshTable(segmenterIndex);

							//reassign scanner pic placeholder
							if (history_amount > 0) {
								var temp = Ti.UI.createImageView({
									image : Ti.Filesystem.applicationDataDirectory + history[0]['img'],
									width : 'auto',
									height : 'auto'
								});

								var h = 320 * temp.toImage().height / temp.toImage().width;
								scannerPicPlaceholder.setHeight(h);
								scannerPicPlaceholder.setImage(temp.toImage());

								temp = null;
							} else {
								var temp = Ti.UI.createImageView({
									image : SCANNER_PIC_PLACEHOLDER_URL,
									width : 'auto',
									height : 'auto'
								});

								var h = 320 * temp.toImage().height / temp.toImage().width;
								scannerPicPlaceholder.setHeight(h);
								scannerPicPlaceholder.setImage(temp.toImage());

								temp = null;
							}

							//loading done!
							loadingView.fireEvent('done');

						} else {
							if (e.error) {
								alert(e.error);
								refreshTable(segmenterIndex);
								db.close();
								//loading done!
								loadingView.fireEvent('done');
								return;
							} else {
								alert(L('alert_cant_delete_fb'));
								refreshTable(segmenterIndex);
								db.close();
								//loading done!
								loadingView.fireEvent('done');
								return;
							}
						}
					});
				} else if (e.index == 1) {
					//Delete local only

					//Delete local db and img
					Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + img_url).deleteFile();

					db.execute('DELETE FROM history WHERE id=?', itemId);
					db.execute('INSERT INTO _deleted (deleted_key) VALUES (?)', sync_key);
					
					// Find deleting index by historyIds instead of historyRows
					//var deleted_row_index = historyRows.indexOf(row);
					var deleted_row_index = historyIds.indexOf(itemId);

					if (deleted_row_index > -1) {
						Ti.API.info('deleted row is at ' + deleted_row_index);
						historyRows.splice(deleted_row_index, 1);
						history.splice(deleted_row_index, 1);
						historyIds.splice(deleted_row_index,1);
						history_amount = historyRows.length;
					} else {
						//not found in history row. something wrong
						Ti.API.info('Something wrong! Can\'t found match in historyRows');
					}

					db.close();

					refreshTable(segmenterIndex);

					//reassign scanner pic placeholder
					if (history_amount > 0) {
						var temp = Ti.UI.createImageView({
							image : Ti.Filesystem.applicationDataDirectory + history[0]['img'],
							width : 'auto',
							height : 'auto'
						});

						var h = 320 * temp.toImage().height / temp.toImage().width;
						scannerPicPlaceholder.setHeight(h);
						scannerPicPlaceholder.setImage(temp.toImage());

						temp = null;
					} else {
						var temp = Ti.UI.createImageView({
							image : SCANNER_PIC_PLACEHOLDER_URL,
							width : 'auto',
							height : 'auto'
						});

						var h = 320 * temp.toImage().height / temp.toImage().width;
						scannerPicPlaceholder.setHeight(h);
						scannerPicPlaceholder.setImage(temp.toImage());

						temp = null;
					}

				} else {
					//TODO:will always delete the row on table. Keep it! Or recover it
					//cancel action
					refreshTable(segmenterIndex);
					db.close();
					return;
				}
			});
		} else {
			Ti.API.info('Deleting row at '+itemId);
			//Delete local db and img
			Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + img_url).deleteFile();
			
			Ti.API.info('22 Deleting row at '+itemId);

			db.execute('DELETE FROM history WHERE id=?', itemId);
			db.execute('INSERT INTO _deleted (deleted_key) VALUES (?)', sync_key);

			// Find deleting index by historyIds instead of historyRows
			//var deleted_row_index = historyRows.indexOf(row);
			var deleted_row_index = historyIds.indexOf(itemId);

			if (deleted_row_index > -1) {
				Ti.API.info('deleted row is at ' + deleted_row_index);
				historyRows.splice(deleted_row_index, 1);
				history.splice(deleted_row_index, 1);
				historyIds.splice(deleted_row_index,1);
				history_amount = historyRows.length;
			} else {
				//not found in history row. something wrong
				Ti.API.info('Something wrong! Can\'t found match in historyRows');
			}

			/*var history_result = db.execute('SELECT * FROM history ORDER BY id DESC');
			 history = db2array(history_result);
			 history_amount = history.length;*/
			db.close();

			refreshTable(segmenterIndex);

			//refine extraspace
			/*segmenterHeader = table.sections[1];

			if (hasExtraSpace) {

			segmenterHeader.remove(segmenterHeader.rows[segmenterHeader.rows.length - 1]);
			}

			var extraSpaceHeight = Ti.Platform.displayCaps.platformHeight - billboardHeight - 44 * (history_amount + 1);
			// +1 for segmenter

			if (extraSpaceHeight > 0) {
			hasExtraSpace = true;

			var extraSpace = Ti.UI.createTableViewRow({
			backgroundColor : '#ffffff',
			height : extraSpaceHeight < 0 ? 0 : extraSpaceHeight,
			title : (history_amount == 0) ? L('Let QR enlight your LIFE!') : ' ',
			editable : false,
			moveable : false,
			selectedBackgroundColor : '#ffffff'
			});

			segmenterHeader.add(extraSpace);
			//table.appendRow(extraSpace);
			} else {
			hasExtraSpace = false;
			}

			table.updateSection(segmenterHeader, 1);*/

			//reassign scanner pic placeholder
			if (history_amount > 0) {
				var temp = Ti.UI.createImageView({
					image : Ti.Filesystem.applicationDataDirectory + history[0]['img'],
					width : 'auto',
					height : 'auto'
				});

				var h = 320 * temp.toImage().height / temp.toImage().width;
				scannerPicPlaceholder.setHeight(h);
				scannerPicPlaceholder.setImage(temp.toImage());

				temp = null;
			} else {
				var temp = Ti.UI.createImageView({
					image : SCANNER_PIC_PLACEHOLDER_URL,
					width : 'auto',
					height : 'auto'
				});

				var h = 320 * temp.toImage().height / temp.toImage().width;
				scannerPicPlaceholder.setHeight(h);
				scannerPicPlaceholder.setImage(temp.toImage());

				temp = null;
			}
		}

	}

	function updateTable(newData) {
		// TODO: Bug!! Can't add new row after sync(downloaded N QR from dropbox)

		//Add new scanned row into table
		var row = new QRRow(newData);

		//Add click row event
		row.addEventListener('click', function(e) {
			if (e.source.toString() == '[object TiUIButton]') {
				return;
			}

			var result = new ResultWindow(e.rowData['itemData'], e.row);
			self.openWindow(result);
		});

		table.insertRowBefore(0, row);

		//segmenterHeader = table.sections[1];

		if (hasExtraSpace) {
			segmenterHeader.remove(segmenterHeader.rows[segmenterHeader.rows.length - 1]);
		}

		var extraSpaceHeight = Ti.Platform.displayCaps.platformHeight - billboardHeight - 44 * (history_amount + 1);
		// +1 for segmenter

		if (extraSpaceHeight > 0) {
			hasExtraSpace = true;

			var extraSpace = Ti.UI.createTableViewRow({
				backgroundColor : '#ffffff',
				height : extraSpaceHeight < 0 ? 0 : extraSpaceHeight,
				title : (history_amount == 0) ? L('no_item_title_history') : ' ',
				editable : false,
				moveable : false,
				selectedBackgroundColor : '#ffffff'
			});

			segmenterHeader.add(extraSpace);
			//table.appendRow(extraSpace);
		} else {
			hasExtraSpace = false;
		}

		table.updateSection(1, segmenterHeader);

		return row;

	}

	return self;

};

function db2array(rows) {
	var returnArray = [];
	var ids = [];

	var fieldCount;
	
	fieldCount = rows.fieldCount;
	
	// After Ti 3.3.0, fieldCount had been removed from SDK
	//fieldCount is property in Android
	/*if (Ti.Platform.name === 'android') {
		fieldCount = rows.fieldCount;
	} else {
		fieldCount = rows.fieldCount();
	}*/

	var obj = {};

	while (rows.isValidRow()) {
		obj = new Object();
		for (var i = 0; i < fieldCount; i++) {
			obj[rows.fieldName(i)] = rows.field(i);
		}
		console.log(obj);
		returnArray.push(obj);
		ids.push(obj.id);
		rows.next();
	}
	//console.log(returnArray);
	return [returnArray, ids];
}

function dbRow2Array(row) {
	var fieldCount;
	
	fieldCount = row.fieldCount;
	
	// After Ti 3.3.0, fieldCount() had been removed from SDK
	/*if (Ti.Platform.name === 'android') {
		fieldCount = row.fieldCount;
	} else {
		fieldCount = row.fieldCount();
	}*/

	var obj = {};
	for (var i = 0; i < fieldCount; i++) {
		obj[row.fieldName(i)] = row.field(i);
	}
	return obj;
}

function aspectFill(src, cw, ch) {

	var img = Ti.UI.createImageView({
		width : 'auto',
		height : 'auto',
		image : src
	});

	var w = img.toImage().width;
	var h = img.toImage().height;
	var shall_w, shall_h;
	//firstly try scale down w=container_size[x]
	shall_w = cw;
	shall_h = Math.round(shall_w * h / w);

	if (ch > shall_h) {
		//not match, try h = container_size[y]
		shall_h = ch;
		shall_w = Math.round(shall_h * w / h);
	}

	//construct container
	var ctn = Ti.UI.createView({
		borderRadius : 0, //key attr to make the view as mask
		backgroundColor : '#000000',
		width : cw,
		height : ch
	});

	img.setHeight(shall_h);
	img.setWidth(shall_w);

	ctn.add(img);
	return ctn;
}

function getUniqueFileName() {
	var now = new Date();
	var str = '' + now.getFullYear() + now.getMonth() + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds() + '';
	return str;
}

module.exports = MainWindow;
