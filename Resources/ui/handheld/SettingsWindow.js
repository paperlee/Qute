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

var URL_QUTE = 'https://www.facebook.com/pages/Qute/368537286624382';

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

	//TODO:Set uo language! Below code not work!
	var settingsSection = Ti.UI.createTableViewSection({

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
		
		if (lang_at != lang_origin){
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
		if (!Ti.Platform.openURL('twitter://user?screen_name=paperli')){
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
		bottom : 20,
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
