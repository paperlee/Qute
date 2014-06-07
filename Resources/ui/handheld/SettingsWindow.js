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

var Sync = require('sync');
var Toast = require('ui/handheld/iToast');

var URL_QUTE = 'https://www.facebook.com/pages/Qute/368537286624382';

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

function toFormatedDateString(datetime) {
	var yyyy = datetime.getFullYear();
	var mon = datetime.getMonth() + 1;
	var dd = datetime.getDate();
	var hh = datetime.getHours();
	var mm = datetime.getMinutes();
	mm = '0' + mm;
	mm = mm.slice(-2);
	var pmam = 'AM';
	if (hh > 12) {
		hh -= 12;
		pmam = 'PM';
	}
	var timeStr = yyyy + '/' + mon + '/' + dd + ' ' + hh + ':' + mm + ' ' + pmam;
	return timeStr;
}

function SettingsWindow() {
	var sync = new Sync();
	var adjustedSyncProgressPosition = false;
	
	var btnClose = Ti.UI.createButton({
		title : L('navibar_button_title_close'),
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
		layout : 'horizontal',
		top : 0
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

	var latestSyncView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : 30,
		layout : 'horizontal',
		top : 30
	});

	var latestSyncTitle = Ti.UI.createLabel({
		font : {
			fontSize : 12,
			fontStyle : 'italic'
		},
		color : '#999999',
		text : L('settings_latest_sync'),
		left : 64,
		top : 6
	});

	var latest_sync_date_string = Ti.App.Properties.getString('latestSync');
	// TODO: Check if not yet sync
	if (latest_sync_date_string != 'none') {
		latest_sync_date_string = toFormatedDateString(new Date(latest_sync_date_string));
		//latest_sync_date_string = (new Date(latest_sync_date_string)).toLocaleString();
	}

	var latestSyncDate = Ti.UI.createLabel({
		font : {
			fontSize : 12,
			fontWeight : 'bold',
			fontFamily : 'monospace'
		},
		color : '#999999',
		text : latest_sync_date_string,
		left : 2,
		top : 9
	});

	latestSyncView.add(latestSyncTitle);
	latestSyncView.add(latestSyncDate);

	var syncFooterView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : 30
	});

	syncFooterView.add(powerByDropboxView);
	syncFooterView.add(latestSyncView);

	//var transform_matrix = Ti.UI.create2DMatrix();
	//transform_matrix.translate(0,-30);

	function applyAnimation(view) {
		var moveUp = Ti.UI.createAnimation({
			top : view.top - 30,
			duration : 600,
			delay : 4000,
			autoreverse : false
		});

		var moveDown = Ti.UI.createAnimation({
			top : view.top,
			duration : 600,
			delay : 10000,
			autoreverse : false
		});

		view.animate(moveUp);

		moveUp.addEventListener('complete', function(e) {
			//console.log('[1]Applied view top: '+view.top);
			view.animate(moveDown);
		});

		moveDown.addEventListener('complete', function(e) {
			//console.log('[2]Applied view top: '+view.top);
			view.animate(moveUp);
		});
	}

	/*var sync_date_animation1 = Ti.UI.createAnimation({
	top:-30,
	duration:600,
	delay:2000,
	autoreverse:true,
	repeat:10
	});

	var sync_date_animation2 = Ti.UI.createAnimation({
	top:-30,
	duration:600,
	delay:2000,
	autoreverse:true,
	repeat:10
	});*/

	//powerByDropboxView.animate(sync_date_animation1);
	//latestSyncView.animate(sync_date_animation2);

	if (latest_sync_date_string != 'none') {
		// Apply animation only if the latest sync date exists
		applyAnimation(powerByDropboxView);
		applyAnimation(latestSyncView);
	}

	function reapplyLatestSyncDate() {
		var latest_sync_date = Ti.App.Properties.getString('latestSync');

		if (latestSyncDate.text == 'none') {
			// Need to apply animation
			applyAnimation(powerByDropboxView);
			applyAnimation(latestSyncView);
		}

		if (latest_sync_date != 'none') {
			latestSyncDate.text = toFormatedDateString(new Date(latest_sync_date));
		}

	}


	//Ti.App.addEventListener('end_syncing', reapplyLatestSyncDate);

	var settingsSection = Ti.UI.createTableViewSection({
		footerView : syncFooterView
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
	// Show sync progress bar instead of spinning
	var syncProgress = Ti.UI.createActivityIndicator({
		style : Ti.UI.iPhone.ActivityIndicatorStyle.DARK
	});
	
	var syncProgressBar = Ti.UI.createProgressBar({
		width:Ti.UI.FILL,
		bottom:0,
		min:0
	});
	
	var syncSwitch = Ti.UI.createSwitch({
		value : Ti.App.Properties.getBool('syncing'),
		color : COLOR_PURPLE,
		right : 12
	});

	syncRow.add(syncTitle);
	syncRow.add(syncProgress);
	syncRow.add(syncSwitch);
	if (isIOS7Plus()){
		syncRow.add(syncProgressBar);
	}
	
	syncRow.addEventListener('click', function(e) {
		//console.log('GoGoGo');
		if (Ti.App.Properties.getBool('syncing')) {
			sync.loginAndSync();
		}
	});

	settingsSection.add(syncRow);

	// Listen start_syncing and end_syncing event to show syncing status
	Ti.App.addEventListener('start_syncing', startSyncing);

	function showSyncProgress(e) {
		syncProgress.left = syncTitle.size.width + syncTitle.left + 10;
		syncProgress.show();
		try {
			syncTitle.removeEventListener('postlayout', showSyncProgress);
		} catch(err) {
			Ti.API.info('Error to detach syncTitle listener: ' + err);
		}
	}
	
	function adjustSyncProgress(e) {
		syncProgress.left = syncTitle.size.width + syncTitle.left + 10;
		//syncProgress.show();
		try {
			syncTitle.removeEventListener('postlayout', adjustSyncProgress);
		} catch(err) {
			Ti.API.info('Error to detach syncTitle listener: ' + err);
		}
	}
	
	function startSyncing(e) {
		// Syncing started
		syncTitle.text = L('settings_title_syncing');
		syncTitle.addEventListener('postlayout', showSyncProgress);
		
	}

	function changeSyncProgress(e) {
		// Sync progress changed
		syncTitle.text = L('settings_title_syncing_progress') + ' ' + e['now'] + '/' + e['all'] + ' ...';
		if (!adjustedSyncProgressPosition){
			syncTitle.addEventListener('postlayout', adjustSyncProgress);
		}
		adjustedSyncProgressPosition = true;
		syncProgressBar.show();
		syncProgressBar.max = e['all'];
		syncProgressBar.value = e['now'];
	}


	Ti.App.addEventListener('sync_progress_changed', changeSyncProgress);

	Ti.App.addEventListener('end_syncing', endSyncing);

	function endSyncing(e) {
		// End syncing
		syncTitle.text = L('settings_title_sync');
		syncProgress.hide();
		syncProgressBar.hide();
		
		reapplyLatestSyncDate();
	}
	
	function dropboxLoginFailHandler(e){
		Ti.API.info('!!fail to login!!');
		Ti.App.fireEvent('end_syncing',{changed_ids:[],insert_ids:[]});
		syncSwitch.value = false;
		Ti.App.removeEventListener('dropbox_login_fail',dropboxLoginFailHandler);
		var toast = new Toast(L('toast_dropbox_login_fail'),2000);
		main.add(toast);
	}

	syncSwitch.addEventListener('change', function(e) {
		if (e.value) {
			console.log('Start connecting to Dropbox');
			// Try modulized sync functions
			sync.loginAndSync();
			Ti.App.addEventListener('dropbox_login_fail',dropboxLoginFailHandler);
		} else {
			// do logout
			// Try modulized sync functions
			sync.logout();
			
			//logout();
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
		text : '@qute_scanner',
		color : COLOR_PURPLE,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		}
	});

	tweetMeRow.addEventListener('click', function(e) {
		if (!Ti.Platform.openURL('twitter://user?screen_name=qute_scanner')) {
			Ti.Platform.openURL('http://twitter.com/qute_scanner');
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
		text : 'paper.li+qute@gmail.com',
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
			toRecipients : ['paper.li+qute@gmail.com']
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

	main.addEventListener('close', function(e) {
		//Ti.API.info('close: From main');
		// Release memory
		Ti.App.removeEventListener('start_syncing', startSyncing);
		Ti.App.removeEventListener('end_syncing', endSyncing);
		//Ti.App.removeEventListener('end_syncing', reapplyLatestSyncDate);
		Ti.App.removeEventListener('sync_progress_changed', changeSyncProgress);
		Ti.App.removeEventListener('dropbox_login_fail',dropboxLoginFailHandler);
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
