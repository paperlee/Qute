var SCANNER_PIC_PLACEHOLDER_URL = '/images/pic_placeholder.jpg';

var HEIGHT_PIC_ALWAYS_SHOW = 160;
var MARGIN_HINT_BOTTOM = 20;
//bottom margin of tap twice hint from bottom edge

var URL_QUTE = 'https://www.facebook.com/pages/Qute/368537286624382';

var COLOR_FB = '#3b5998';
var COLOR_PURPLE = '#9857a7';
var COLOR_PURPLE_90ALPHA = '#E69857a7';
var COLOR_GRAY = '#c6c6c6';
var COLOR_LINK = '#149599';
var COLOR_GUIDE_TEXT = '#1B2326';

var description_min_height = 0;

var fadeOut = Ti.UI.createAnimation({
	opacity : 0,
	duration : 500
});

var fadeIn = Ti.UI.createAnimation({
	opacity : 1,
	duration : 500
});

var FACEBOOK_APP_ID;

var is_init_typing = true;

//load modules
var fb = require('facebook');
var Social = require('dk.napp.social');

var Toast = require('ui/handheld/iToast');
var ToastWithImage = require('ui/handheld/iToastWithImage');
var CommentRow = require('ui/handheld/CommentRow');
var Loading = require('ui/handheld/iLoading');
var WhyWindow = require('ui/handheld/WhyWindow');
var Keys = require('keys');

var patt_http = /^(http|https)/gi;

var sayIsFocused = false;

//var loggedIn = false;
var commentsData = {};

var ios7;

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

function Result(qrData, qrRow) {

	var keys = new Keys();

	FACEBOOK_APP_ID = keys.facebook_appid;

	//check if ios7+
	ios7 = isIOS7Plus();

	//No comments view
	var noCommentsBox = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		layout : 'vertical',
		top : 6,
		visible : false
	});

	var noCommentsPointer = Ti.UI.createView({
		width : 40,
		height : 40,
		backgroundImage : '/images/icon_pointer_no_comments.png'
	});

	var noCommentsText = Ti.UI.createLabel({
		top : 4,
		text : L('no_item_title_share_first_tip'),
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		font : {
			fontSize : 18
		},
		textAlign : 'center',
		color : COLOR_GUIDE_TEXT
	});

	var noCommentsPic = Ti.UI.createView({
		top : 6,
		width : 80,
		height : 80,
		backgroundImage : '/images/icon_guide_no_comments.png'
	});

	noCommentsBox.add(noCommentsPointer);
	noCommentsBox.add(noCommentsText);
	noCommentsBox.add(noCommentsPic);

	//Guide to switch online
	var onlineSwitchInstructionView = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : 'auto'
	});

	//Rich color image, apply in background
	var guideSwitch = Ti.UI.createView({
		backgroundImage : '/images/icon_guide_switch_online.png',
		width : 180,
		height : 40,
		top : 16
	});

	onlineSwitchInstructionView.add(guideSwitch);

	var guidePutOnlineBox = Ti.UI.createView({
		width : 'auto',
		top : 66,
		left : 20,
		height : 90
	});

	var guidePutOnlinePic = Ti.UI.createView({
		width : 90,
		height : 90,
		backgroundImage : '/images/icon_guide_global.png',
		left : 0,
		top : 0
	});

	guidePutOnlineBox.add(guidePutOnlinePic);

	var putOnlineStr = L('guide_text_putonline');

	var putOnlineAttrStr = Ti.UI.iOS.createAttributedString({
		text : putOnlineStr,
		attributes : [{
			type : Ti.UI.iOS.ATTRIBUTE_UNDERLINES_STYLE,
			value : Ti.UI.iOS.ATTRIBUTE_UNDERLINE_STYLE_SINGLE,
			range : [putOnlineStr.indexOf('Qute'), ('Qute').length]
		}, {
			type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
			value : 'black',
			range : [0, putOnlineStr.length]
		}, {
			type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
			value : COLOR_LINK,
			range : [putOnlineStr.indexOf('Qute'), ('Qute').length]
		}]
	});

	var guidePutOnlineHeader = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		text : L('guide_title_putonline'),
		font : {
			fontSize : 18,
			fontWeight : 'bold'
		},
		color : '#000000',
		top : 12,
		left : 98
	});

	var guidePutOnlineText = Ti.UI.createLabel({
		width : 150,
		height : 'auto',
		wordWrap : true,
		left : 98,
		top : 36,
		font : {
			fontSize : 14
		},
		attributedString : putOnlineAttrStr
	});

	guidePutOnlineText.addEventListener('click', function(e) {
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
	});

	guidePutOnlineBox.add(guidePutOnlineHeader);
	guidePutOnlineBox.add(guidePutOnlineText);

	onlineSwitchInstructionView.add(guidePutOnlineBox);

	var guideShareTipBox = Ti.UI.createView({
		width : 'auto',
		top : 150,
		height : 90,
		left : 22
	});

	var guideShareTipPic = Ti.UI.createView({
		width : 90,
		height : 90,
		backgroundImage : '/images/icon_guide_bubbles.png',
		left : 200,
		top : 0,
		bottom : 20
	});

	guideShareTipBox.add(guideShareTipPic);

	var shareTipStr = L('guide_text_sharetip');

	var guideShareTipHeader = Ti.UI.createLabel({
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		text : L('guide_title_sharetip'),
		font : {
			fontSize : 18,
			fontWeight : 'bold'
		},
		color : '#000000',
		top : 16,
		left : 10
	});

	var guideShareTipText = Ti.UI.createLabel({
		width : 180,
		height : 'auto',
		wordWrap : true,
		left : 10,
		top : 40,
		text : shareTipStr,
		color : 'black',
		font : {
			fontSize : 14
		}
	});

	guideShareTipBox.add(guideShareTipHeader);
	guideShareTipBox.add(guideShareTipText);

	onlineSwitchInstructionView.add(guideShareTipBox);

	//pull down instruction
	var pullDownInstructionView = Ti.UI.createView({
		width : 320,
		height : 44
	});

	var guideTopBg = Ti.UI.createView({
		bottom : 44,
		width : Ti.UI.FILL,
		height : 100,
		backgroundColor : '9a000000'
	});

	var guideBottomBg = Ti.UI.createView({
		bottom : 0,
		width : Ti.UI.FILL,
		height : 44,
		backgroundGradient : {
			type : 'linear',
			startPoint : {
				x : '0%',
				y : '100%'
			},
			endPoint : {
				x : '0%',
				y : '0%'
			},
			colors : [{
				color : '#00000000',
				offset : 0.0
			}, {
				color : '#1a000000',
				offset : 0.23
			}, {
				color : '#9a000000',
				offset : 1.0
			}]
		}
	});

	pullDownInstructionView.add(guideBottomBg);
	pullDownInstructionView.add(guideTopBg);

	var guideSafariPoint = Ti.UI.createImageView({
		image : '/images/icon_point_to.png',
		width : 30,
		height : 30,
		tintColor : 'white',
		right : 25,
		bottom : 16
	});

	var guideSafariLabel = Ti.UI.createLabel({
		text : L('guide_text_open_in_safari'),
		width : 70,
		height : 60,
		right : 53,
		color : 'white',
		textAlign : 'right',
		font : {
			fontSize : 12
		},
		bottom : 0
	});

	var guideQutePoint = Ti.UI.createImageView({
		image : '/images/icon_point_to2.png',
		width : 30,
		height : 30,
		tintColor : 'white',
		right : 130,
		bottom : 16
	});

	var guideQuteLabel = Ti.UI.createLabel({
		text : L('guide_text_check_post'),
		width : 90,
		height : 60,
		right : 158,
		color : 'white',
		textAlign : 'right',
		font : {
			fontSize : 12
		},
		bottom : 0
	});

	pullDownInstructionView.add(guideQuteLabel);
	pullDownInstructionView.add(guideQutePoint);
	pullDownInstructionView.add(guideSafariLabel);
	pullDownInstructionView.add(guideSafariPoint);

	//prepare loading view
	var loadingIcon = Ti.UI.createActivityIndicator({
		style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
		color : 'white'
	});

	//loadingIcon.show();

	var loadingView = Ti.UI.createView({
		backgroundColor : COLOR_PURPLE_90ALPHA,
		opacity : 0.9,
		borderRadius : 40,
		width : 80,
		height : 80,
		visible : false
	});

	var loading = new Loading();

	var buttonOpenInSafari = Ti.UI.createButton({
		image : '/images/icon_safari.png',
		right : 0,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	//check if there is value in result
	if (!qrData || typeof (qrData) === 'undefined') {
		Ti.API.info('There is no result');
		qrData = {
			raw : L('placeholder_invalid_qr'),
			date : new Date().toISOString(),
			id : -1,
			img : SCANNER_PIC_PLACEHOLDER_URL,
			title : L('placeholder_qr_title'),
			qrtype : -1,
			post_id : 0
		};
		//result = 'Well...You shall take a valid QR code';
		buttonOpenInSafari.enabled = false;
	}

	//TODO: bad behaviour
	var switchOnFb = Ti.UI.createSwitch({
		tintColor : COLOR_PURPLE,
		title : L('switch_title_putonline'),
		value : false,
		color : COLOR_PURPLE
	});
	switchOnFb.switching = false;
	//Add switching to detemine whether programatic changing or not

	var onlineView = Ti.UI.createView();
	var qute_link = 'Not Online';
	if (qrData['post_id'] !== null && qrData['post_id'] != undefined && qrData['post_id'] != -1 && qrData['post_id'] != 0) {
		//TODO:better determination way for checking of post_id
		Ti.API.info('there is post_id');
		qute_link = buildFBLink(qrData['post_id']);
	}

	var dialogQuteUrl = Ti.UI.createOptionDialog({
		title : qute_link,
		options : [L('confirm_option_visit_post_fb'), L('confirm_option_copy'), L('confirm_option_cancel')],
		cancel : 2
	});

	dialogQuteUrl.addEventListener('click', function(e) {
		Ti.API.info('the link is ' + e.source.title);
		switch(e.index) {
			case 0:
				//Open in Safari
				Ti.Platform.openURL(e.source.title);
				break;
			case 1:
				//Copy
				Ti.UI.Clipboard.setText(e.source.title);

				var toast = new Toast(L('copied'));
				self.add(toast);

				break;
			default:
				//Cancel
				break;
		}
	});

	var buttonSeeOnFb = Ti.UI.createButton({
		title : L('button_title_offline'),
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		},
		enabled : false
	});

	if (!ios7) {
		buttonSeeOnFb.style = Ti.UI.iPhone.SystemButtonStyle.PLAIN;
		buttonSeeOnFb.color = buttonSeeOnFb.enabled ? COLOR_PURPLE : COLOR_GRAY;
	}

	buttonSeeOnFb.addEventListener('click', function(e) {
		dialogQuteUrl.show();
	});

	onlineView.add(buttonOpenInSafari);
	switchOnFb.right = buttonOpenInSafari.toImage().width + 4;
	onlineView.add(switchOnFb);
	buttonSeeOnFb.right = switchOnFb.right + switchOnFb.toImage().width + 4;
	onlineView.add(buttonSeeOnFb);

	var buttonReload = Ti.UI.createButton({
		systemButton : Ti.UI.iPhone.SystemButtonStyle.PLAIN,
		image : '/images/icon_reload.png',
		tintColor : COLOR_PURPLE,
		visible : false,
		right : switchOnFb.right,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	onlineView.add(buttonReload);

	//Drop Down Menu to show url link
	/*var dropDownMenu = Ti.UI.createView({
	width:Ti.UI.FILL,
	height:44,
	backgroundColor:'#CDFFFFFF'
	});

	var quteUrlLabel = Ti.UI.createLabel({
	text:qrData.post_id,
	font:{
	fontSize:12
	},
	color:'#4a4a4a',
	wordWrap:true,
	width:260,
	left:8
	});

	var buttonOpenQuteUrl = Ti.UI.createButton({
	title:L('Open'),
	tintColor:COLOR_PURPLE,
	right:4
	});

	buttonOpenQuteUrl.addEventListener('click',function(e){
	Ti.Platform.openURL(e.source.title);
	});

	dropDownMenu.add(quteUrlLabel);
	dropDownMenu.add(buttonOpenQuteUrl);*/

	//alert(qrData['post_id']);
	//alert(parseInt(qrData['post_id'],10));

	if (qrData['from_me'] == 1) {
		switchOnFb.enabled = true;
	} else {
		switchOnFb.enabled = false;
	}

	/*if (fb.loggedIn && qrData['post_id'] != 0) {
	 //fetch comments
	 fb.requestWithGraphPath('' + post_id + '?fields=comments', {}, 'GET', function(e) {
	 if (e.success) {
	 alert(e.result);
	 } else if (e.error) {
	 alert(e.errow);
	 } else {
	 alert('Unknown response');
	 }
	 });
	 }*/

	if (qrData.qrtype === 0) {
		//HTTP type
		buttonOpenInSafari.enabled = true;
		
		//console.log('title = raw?:'+(qrData['title'] == qrData['raw'])+'::'+qrData['title'] + '::'+qrData['raw']);
		// Try to get website title
		if (qrData['title'] == qrData['raw']) {
			var httpRequest = Ti.Network.createHTTPClient({
				onload : function(e) {
					//console.log('response text:'+this.responseText);
					// TODO:better match pattern
					var matches = this.responseText.match(/<title>(.*?)<\/title>/gi);
					if (matches != null) {
						//console.log('found title:'+matches[0]);
						var title_string = matches[0].substring(7,matches[0].length-8);
						// Assign back title to db
						qrData['title'] = title_string;
						var db = Ti.Database.open('qute');
						var datetime = new Date().toISOString();
						db.execute('UPDATE history SET title=?,last_update=? WHERE id=?', qrData['title'], datetime, qrData['id']);
						db.close();

						//Assign in UI title field
						//resultText.text = qrData['title'];
						resultText.visible = false;
						readableTitle.text = qrData['title'];
						readableTitle.visible = true;
						rawLabel.text = qrData['raw'];
						rawLabel.visible = true;

						//call row to update self data
						Ti.API.info('Staus shall updated!!');
						qrRow.fireEvent('status_updated');
					}
				},
				onerror : function(e) {
					// handle error
					console.log('Error happened while getting title: ' + e.error);
				},
				timeout : 5000
			});
			
			//TODO:shorten url may fail
			
			var url;
			if (qrData['raw'].search(patt_http) < 0){
				// need to add http at beginning
				url = 'http://'+qrData['raw'];
			} else {
				url = qrData['raw'];
			}
			
			console.log('request url '+url);
			
			httpRequest.open('GET',url);
			httpRequest.send();
		}

	} else {
		//disable, QR is other types
		//TODO: other type of link, ex. contacts
		buttonOpenInSafari.enabled = false;
	}

	var self = Ti.UI.createWindow({
		backButtonTitle : L('window_title_scanner'),
		navBarHidden : false,
		rightNavButton : onlineView,
		statusBarStyle : Ti.UI.iPhone.StatusBar.GRAY,
		//titleControl:onlineView,
		tintColor : COLOR_PURPLE //purple color
	});

	if (ios7) {
		self.backButtonTitle = L('window_title_scanner');
	} else {
		self.barColor = 'white';

		//set up status bar style to black
		self.statusBarStyle = Ti.UI.iPhone.StatusBar.OPAQUE_BLACK;

		self.backButtonTitleImage = '/images/icon_back.png';

	}

	/*var scrollView = Ti.UI.createScrollView({
	 contentHeight:'auto',
	 contentWidth:'auto'
	 });*/

	var wholeView = Ti.UI.createView({
		top : 0,
		left : 0,
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});

	//add toolbar as talking bar
	var say = Ti.UI.createTextArea({
		width : 236,
		height : 'auto',
		hintText : L('placeholder_say_textfield'),
		color : '#333',
		font : {
			fontSize : 16
		},
		returnKeyType : Ti.UI.RETURNKEY_SEND,
		scrollable : true,
		left : 0,
		visible : false
	});

	//Set up placeholder
	say.color = '#BAAFBD';
	say.value = L('placeholder_say_textfield');
	say._hintText = say.value;

	var sayRef = Ti.UI.createLabel({
		width : 236,
		left : 0,
		bottom : 0,
		font : {
			fontSize : 16
		},
		height : Ti.UI.SIZE,
		visible : true,
		opacity : 0
	});

	var sendButton = Ti.UI.createButton({
		backgroundImage : '/images/icon_send.png',
		backgroundSelectedImage : '/images/icon_send_highlighted.png',
		width : 30,
		height : 30,
		right : 10,
		visible : false,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	sendButton.enabled = false;

	sendButton.addEventListener('click', function() {
		say.fireEvent('return');
		say.blur();
	});

	var dividerUp = Ti.UI.createView({
		backgroundColor : '#9857a7',
		height : 1,
		top : 0,
		width : Ti.UI.FILL
	});

	var dividerBottom = Ti.UI.createView({
		backgroundColor : '#9857a7',
		height : 1,
		bottom : 0,
		width : Ti.UI.FILL
	});

	var cantSay = Ti.UI.createLabel({
		text : L('quote_not_online'),
		font : {
			fontStyle : 'italic',
			fontSize : 16
		},
		color : '#aaaaaa',
		visible : true
	});

	//TODO:handle the saypanel when not loggedin
	var sayPanel = Ti.UI.createView({
		bottom : 0,
		backgroundColor : 'white',
		width : '100%',
		height : 44
	});

	sayPanel.add(say);
	sayPanel.add(sendButton);
	self.add(sayRef);
	//sayPanel.add(dividerUp);
	sayPanel.add(dividerBottom);

	sayPanel.add(cantSay);

	say.addEventListener('blur', function(e) {
		sayIsFocused = false;
		if (e.source.value == "") {
			e.source.value = e.source._hintText;
			e.source.color = '#BAAFBD';
		}
	});

	say.addEventListener('focus', function(e) {
		sayIsFocused = true;
		if (e.source.value == e.source._hintText) {
			e.source.value = "";
			say.color = 'black';
		}
		/*if (is_init_typing) {
		 say.value = '';
		 say.color = 'black';
		 is_init_typing = false;
		 }*/

		sayPanel.height = say.height = 60;
		sayPanelHeader.headerView = sayPanel;
		table.updateSection(sayPanelHeader, 1);
	});

	say.addEventListener('change', function(e) {
		//console.log("height diff is "+(sayRef.rect.height-say.rect.height));
		//sayRef.text = say.value;
		//console.log("text is "+e.source.vale+"::"+e.source+"::"+e);
		//console.log("1height become "+sayRef.size.height);
		//console.log("2height become "+sayRef.rect.height);
		//console.log("3height become "+sayRef.height);

		//diff between TextArea and Label is 16

		//say.height = sayRef.rect.height + 16;
		//say.height = say.height < 30 ? 35 : say.height;
		//sayPanel.height = sayRef.rect.height + 24;
		//sayPanel.height = (sayPanel.height < 30) ? 44 : sayPanel.height;
		//sayPanelHeader.headerView = sayPanel;
		//table.updateSection(sayPanelHeader,1);
		//table.bottom = sayPanel.height;
		//console.log("saypanel height is "+sayPanel.height);

		//enable/disable send button
		if (say.value != "" && say.value.length != 0) {
			//enable send button
			sendButton.enabled = true;
		} else {
			sendButton.enabled = false;
		}
	});

	say.addEventListener('return', function(e) {
		var commentData = {
			message : say.value
		};
		//alert(sayRef.size.height + ":"+sayPanel.rect.height + ":" +sayRef.text);
		//say.value = '';

		if (fb.loggedIn || Ti.App.Properties.getBool('loggedin')) {
			//attach loading activity
			loadingView.visible = true;
			loadingIcon.show();

			//attachLoaing();
			/*var loadingIcon = Ti.UI.createActivityIndicator({
			 style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
			 color : 'white'
			 });

			 loadingIcon.show();

			 var loadingView = Ti.UI.createView({
			 backgroundColor : '#aaaaaa',
			 opacity : 0.9,
			 borderRadius : 10,
			 width : 80,
			 height : 80
			 });

			 loadingView.add(loadingIcon);
			 self.add(loadingView);*/

			Ti.API.info('!!post_id: ' + qrData['post_id']);
			fb.requestWithGraphPath('' + qrData['post_id'] + '/comments', {
				message : commentData['message']
			}, 'POST', function(e) {
				if (e.success) {
					//Ti.API.info('Create success! result:' + e.result);
					var result = JSON.parse(e.result);
					Ti.API.info('Created comments id: ' + result.id);

					//Hide keyboard and go back to init set of say layout
					say.value = "";
					say.blur();
					//say.color = '#BAAFBD';
					//say.value = L('say something...');
					//is_init_typing = true;
					//say.fireEvent('change');
					//sayRef.text = say.value;
					//say.height = 'auto';
					//sayPanel.height = 60;

					//table.bottom = sayPanel.height;
					sendButton.enabled = false;

					//go back to init status
					sayPanel.height = 44;
					say.height = 'auto';
					sayPanelHeader.headerView = sayPanel;
					table.updateSection(sayPanelHeader, 1);

					fb.requestWithGraphPath('' + qrData['post_id'] + '?fields=comments', {}, 'GET', function(e) {
						if (e.success) {
							//remove loading activity
							//self.remove(loadingView);
							loadingView.visible = false;
							loadingIcon.hide();

							//loading.fireEvent('done');

							commentsData = JSON.parse(e.result);
							if (commentsData.comments === undefined) {
								//no comments
								//TODO: show No Cooment yet view
								Ti.API.info('No comments yet');
								noCommentsBox.visible = true;
							} else {
								//there are some comments
								Ti.API.info('Some comments existed');
								updateComments(commentsData.comments);
							}

							//alert(e.result);
						} else if (e.error) {
							loadingView.visible = false;
							loadingIcon.hide();

							//appear reload button
							buttonReload.visible = true;
							switchOnFb.visible = false;
							buttonSeeOnFb.visible = false;
							//loading.fireEvent('done');

							alert(e.error);
						} else {
							loadingView.visible = false;
							loadingIcon.hide();

							//appear reload button
							buttonReload.visible = true;
							switchOnFb.visible = false;
							buttonSeeOnFb.visible = false;
							//loading.fireEvent('done');

							alert('Unknown response');
						}
					});

					//TODO:Update comments table in low effort. Only sync unread comments. use comments_data to update comments table
					//post_id = result.id;
					//var db = Ti.Database.open('qute');
					//db.execute('UPDATE history SET post_id=? WHERE id=?', post_id, qrData['id']);
					//db.close();
				} else {
					if (e.error) {
						loadingView.visible = false;
						loadingIcon.hide();

						//loading.fireEvent('done');

						alert(e.error);
					} else {
						loadingView.visible = false;
						loadingIcon.hide();

						//loading.fireEvent('done');

						alert('Unknown result');
					}
				}
			});
		}

		//re-setup headerview
		//sayPanelHeader.headerView = sayPanel;
		//table.updateSection(sayPanelHeader,1);

	});

	var sayPanelHeader = Ti.UI.createTableViewSection({
		headerView : sayPanel
	});

	var picFrame = Ti.UI.createImageView({
		width : 'auto',
		height : 'auto',
		backgroundColor : '#ac4103',
		image : Ti.Filesystem.applicationDataDirectory + qrData['img'],
		top : 0
	});

	var picFrameOverlay = Ti.UI.createView({
		backgroundColor : '#66000000',
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		opacity : 0
	});

	var shall_h = Math.round(320 * picFrame.toImage().height / picFrame.toImage().width);
	picFrame.setWidth(320);
	picFrame.setHeight(shall_h);

	wholeView.add(picFrame);
	wholeView.add(picFrameOverlay);

	var network_change_listener = function(e) {
		if (e.online) {
			Ti.API.info('Now device is online');
			Ti.API.info('FB? ' + fb.loggedIn);
			/*fb.reauthorize([], 'me', function(e) {
			 if (e.sucess) {
			 Ti.App.Properties.setBool('loggedin', true);
			 Ti.API.info('NOW FB ONLINE? ' + fb.loggedIn);

			 } else {
			 if (e.error) {
			 alert(e.error);
			 } else {
			 alert("Unknown result");
			 }
			 }
			 });*/

			checkThreadExist(false, true);

			Ti.Network.removeEventListener('change', network_change_listener);
		}
	};

	//check if thread existed or not. and decide to create or follow thread
	if (fb.loggedIn || Ti.App.Properties.getBool('loggedin')) {
		//var query_url = 'https://graph.facebook.com/' + 'fql?q=SELECT+id,time,text,likes+FROM+comment+WHERE+post_id+in+('
		//				+'SELECT+post_id+FROM+stream+WHERE+source_id=368537286624382'
		//				+'+AND+strpos(message,\''+encodeURIComponent(data.barcode)+'\')=0)' + '&access_token=' + fb.accessToken;
		Ti.API.info('Checked loggedin status');
		if (Ti.Network.online) {
			checkThreadExist(false, true);
		} else {
			//Network is down
			Ti.API.info('network is down');
			//TODO: Don't know why below toast won't work. conflict Toast object?
			self.addEventListener('postlayout', function(e) {
				var networkDownToast = new Toast(L('network_down'));
				networkDownToast.top = 50;
				self.add(networkDownToast);
			});

			//show reload button
			buttonReload.visible = true;
			switchOnFb.visible = false;
			buttonSeeOnFb.visible = false;

			//Ti.Network.addEventListener('change',network_change_listener);
		}

		//TODO:Bug: Log in FB -> log out(don't know reason). At the time the table won't be updated(locked in local db)
	} else {
		//offline
		switchOnFb.enabled = false;

		Ti.API.info('loggedin status false');
		/*if (!Ti.Network.online) {
		Ti.Network.addEventListener('change', network_change_listener);
		}*/

		//Attach tap twice hint
		if (!Ti.App.Properties.getBool('didCopy')) {
			var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));

			self.add(tapTwiceHint);
			tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
		}
	}

	//self.add(resultText);
	var blank_height = shall_h - HEIGHT_PIC_ALWAYS_SHOW;
	blank_height = blank_height < 0 ? 0 : blank_height;

	var blankSpaceView = Ti.UI.createView({
		height : shall_h,
		width : '100%'
	});

	var blankSpaceBottom = Ti.UI.createView({
		width : '100%',
		height : 'auto',
		bottom : 0,
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
				offset : 0.1
			}, {
				color : '#66000000',
				offset : 0.4
			}, {
				color : '#E4000000',
				offset : 1.0
			}]
		}
	});

	//TODO: Adjust the resultText width to leave space for buttonShare
	var resultText = Ti.UI.createLabel({
		width : 280,
		left : 20,
		bottom : 30,
		color : 'white',
		font : {
			fontSize : 16
		},
		height : 'auto',
		text : qrData['raw']
	});

	var readableTitle = Ti.UI.createLabel({
		width : 280,
		height : Ti.UI.SIZE,
		left : 20,
		bottom : 46,
		color : 'white',
		font : {
			fontSize : 16
		},
		text : qrData['title']
	});

	var rawLabel = Ti.UI.createLabel({
		width : 246,
		wordWrap : false,
		bottom : 30,
		left : 20,
		color : '#aaaaaa',
		font : {
			fontSize : 12
		},
		text : qrData['raw'],
		height : 16
	});

	var datetime = new Date(qrData['date']);

	var dateBlock = Ti.UI.createLabel({
		text : datetime.getDate() + '.' + (datetime.getMonth() + 1) + '.' + datetime.getFullYear(),
		color : '#838383',
		font : {
			fontSize : 14
		},
		bottom : 10,
		left : 20
	});

	var timeBlock = Ti.UI.createLabel({
		text : datetime.getHours() + ':' + datetime.getMinutes(),
		color : '#838383',
		font : {
			fontSize : 14
		},
		bottom : 10,
		left : 100
	});

	blankSpaceBottom.add(resultText);
	blankSpaceBottom.add(dateBlock);
	blankSpaceBottom.add(timeBlock);
	blankSpaceBottom.add(readableTitle);
	blankSpaceBottom.add(rawLabel);
	//blankSpaceBottom.add(buttonShare);

	//top margin: 36, bottom margin:30
	var title_area_height = 44;
	if (qrData['title'] != qrData['raw']) {
		//hide resultText and show readableTitle and rawLabel
		resultText.visible = false;
		readableTitle.visible = true;
		rawLabel.visible = true;

		title_area_height = readableTitle.toImage().height + rawLabel.toImage().height + 36 + 30;
		Ti.API.info('show readable title and the height: ' + title_area_height);
	} else {
		resultText.visible = true;
		readableTitle.visible = false;
		rawLabel.visible = false;

		title_area_height = resultText.toImage().height + 36 + 30;
		Ti.API.info('NOT show readable title and the height: ' + title_area_height);
	};

	//var title_area_height = resultText.toImage().height + 36 + 30;

	blankSpaceBottom.height = title_area_height;
	//alert(title_area_height);
	var blankSpaceTop = Ti.UI.createView({
		backgroundColor : '#00000000',
		width : '100%',
		height : shall_h - title_area_height,
		top : 0
	});

	var buttonShare = Ti.UI.createButton({
		width : 44,
		height : 44,
		image : '/images/icon_share.png',
		tintColor : 'white',
		right : 14,
		bottom : 6,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	//blankSpaceTop.add(buttonShare);
	blankSpaceBottom.add(buttonShare);

	buttonShare.addEventListener('click', function(e) {
		var share_string;
		var activitySettings = {};
		if (qrData['title'] == qrData['raw']) {
			share_string = qrData['raw'];
		} else {
			share_string = qrData['raw'] + ' ' + qrData['title'];
		}

		if (qrData['type'] == 0) {
			activitySettings = {
				text : share_string,
				url : qrData['raw'],
				image : Ti.Filesystem.applicationDataDirectory + qrData['img'],
				removeIcons : 'contact'
			};
		} else {
			//Not link
			activitySettings = {
				text : share_string,
				image : Ti.Filesystem.applicationDataDirectory + qrData['img'],
				removeIcons : 'contact'
			};
		}

		if (Social.isActivityViewSupported()) {//min iOS6 required
			Social.activityView(activitySettings);
		} else {
			//implement fallback sharing..
			Ti.API.info('iPhone version is below 6');
		}
	});

	blankSpaceView.add(blankSpaceTop);
	blankSpaceView.add(blankSpaceBottom);

	//TODO:bad calling momment
	resultText.addEventListener('postlayout', function() {
		//alert(resultText.size.height);
		if (resultText.visible) {
			title_area_height = resultText.size.height + 36 + 30;
			blankSpaceBottom.height = title_area_height;
			blankSpaceTop.height = shall_h - title_area_height;
		} else {
			title_area_height = readableTitle.size.height + rawLabel.toImage().height + 36 + 30;
			blankSpaceBottom.height = title_area_height;
			blankSpaceTop.height = shall_h - title_area_height;
		}

		//alert(say.size.height);
	});

	readableTitle.addEventListener('postlayout', function() {
		//alert(resultText.size.height);
		if (resultText.visible) {
			title_area_height = resultText.size.height + 36 + 30;
			blankSpaceBottom.height = title_area_height;
			blankSpaceTop.height = shall_h - title_area_height;
		} else {
			title_area_height = readableTitle.size.height + rawLabel.toImage().height + 36 + 30;
			blankSpaceBottom.height = title_area_height;
			blankSpaceTop.height = shall_h - title_area_height;
		}

		//alert(say.size.height);
	});

	var blankSpaceHeader = Ti.UI.createTableViewSection({
		headerView : blankSpaceView
	});

	//Segmenter view
	/*var View = Ti.UI.createView({
	 width : '100%',
	 height : 44,
	 backgroundColor : 'white'
	 });

	 var segmenter = Ti.UI.iOS.createTabbedBar({
	 labels : [L('description'), L('talk')],
	 width : '90%',
	 index : 0
	 });

	 segmenterView.add(segmenter);

	 var segmenterHeader = Ti.UI.createTableViewSection({
	 headerView : segmenterView
	 });*/

	description_min_height = Ti.Platform.displayCaps.platformHeight - HEIGHT_PIC_ALWAYS_SHOW - sayPanel.height - 44;

	var descriptionRow = Ti.UI.createTableViewRow({
		backgroundColor : 'white',
		selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	var descriptionView = Ti.UI.createView({
		width : '100%',
		height : description_min_height
	});

	descriptionView.add(onlineSwitchInstructionView);
	descriptionView.add(noCommentsBox);

	if (onlineSwitchInstructionView.toImage().height > description_min_height) {
		descriptionView.height = onlineSwitchInstructionView.toImage().height;
	}

	var buttonFb = Ti.UI.createButton({
		backgroundColor : COLOR_FB,
		width : 210,
		height : 44,
		borderRadius : 2,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		},
		title : L('button_title_login_fb_result'),
		tintColor : 'white',
		top : 17,
		style : Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	var imgGlobal = Ti.UI.createImageView({
		image : '/images/global.png',
		width : 150,
		height : 150,
		top : 75
	});

	var labelSubtitle = Ti.UI.createLabel({
		top : 230,
		text : L('login_fb_subtitle'),
		font : {
			fontSize : 14
		},
		color : '#513626'
	});

	var whyStr = L('button_title_why');
	var whyAttrStr = Ti.UI.iOS.createAttributedString({
		text : whyStr,
		attributes : [{
			type : Ti.UI.iOS.ATTRIBUTE_UNDERLINES_STYLE,
			value : Ti.UI.iOS.ATTRIBUTE_UNDERLINE_STYLE_SINGLE,
			range : [0, whyStr.length]
		}, {
			type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
			value : COLOR_LINK,
			range : [0, whyStr.length]
		}]
	});

	var whyLabel = Ti.UI.createLabel({
		attributedString : whyAttrStr,
		font : {
			fontSize : 14
		},
		top : 260
	});

	whyLabel.addEventListener('click', function(e) {
		var whyWin = new WhyWindow();
	});

	buttonFb.addEventListener('click', function(e) {
		//login in fb
		fb.appid = FACEBOOK_APP_ID;
		fb.permissions = ['publish_actions', 'publish_stream', 'read_stream'];

		fb.forceDialogAuth = true;
		fb.addEventListener('login', function(e) {
			if (e.success) {
				descriptionView.remove(hintToLogInBox);
				checkThreadExist(false);
				//TODO:hide login widget in MainWindow
				Ti.App.fireEvent('loggedin');
			} else if (e.error) {
				alert(e.error);
			} else if (e.cancelled) {
				alert('Cancelled');
			}
		});
		fb.authorize();
	});

	var hintToLogInBox = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.SIZE,
		top : 0
	});

	hintToLogInBox.add(buttonFb);
	hintToLogInBox.add(imgGlobal);
	hintToLogInBox.add(labelSubtitle);
	hintToLogInBox.add(whyLabel);

	if (!Ti.App.Properties.getBool('loggedin')) {
		descriptionView.add(hintToLogInBox);
		var unloginViewHeight = hintToLogInBox.toImage().height + 20;
		descriptionView.height = descriptionView.height > unloginViewHeight ? descriptionView.height : unloginViewHeight;

		onlineSwitchInstructionView.visible = false;
	}

	//Show comments list

	//descriptionView.add(resultText);

	descriptionRow.add(descriptionView);

	sayPanelHeader.add(descriptionRow);
	//segmenterHeader.add(descriptionRow);

	var table = Ti.UI.createTableView({
		top : 0,
		bottom : 0,
		sections : [blankSpaceHeader, sayPanelHeader],
		backgroundColor : '#00ffffff',
		scrollsToTop : true,
		separatorStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
		headerPullView : pullDownInstructionView
	});

	//Scroll tableview to make sure the result text visible
	var display_height = Ti.Platform.displayCaps.platformHeight - 44 - 20;
	//The max height of one-page on device
	//Ti.API.info('[1]pic height is '+picFrame.height);
	//Ti.API.info('[1]display height is '+display_height);
	if (picFrame.height > display_height) {
		//Ti.API.info('[2]Shall top to '+(picFrame.height-display_height));
		table.scrollToTop(picFrame.height - display_height);
	}

	//wholeView.add(sayPanel);
	wholeView.add(table);

	//scrollView.add(wholeView);

	self.add(wholeView);
	//self.add(table);
	//self.add(sayPanel);
	//table.scrollToIndex(0);

	//add loading activity in view
	loadingView.add(loadingIcon);
	self.add(loadingView);

	table.addEventListener('scroll', function(e) {
		if (e.contentOffset.y < 40) {
			picFrameOverlay.animate(fadeOut);
		} else {
			picFrameOverlay.animate(fadeIn);
		}

		//hide keyboard when scroll the table
		if (sayIsFocused) {
			say.blur();
		}
	});

	blankSpaceBottom.addEventListener('longpress', function(e) {

		if (qrData['title'] == qrData['raw']) {
			//title didn't assigned
			Ti.UI.Clipboard.setText(qrData['raw']);
		} else {
			Ti.UI.Clipboard.setText(qrData['raw'] + ' ' + qrData['title']);
		}

		var toast = new Toast(L('toast_copied'));
		self.add(toast);

		Ti.App.Properties.setBool('didCopy', true);
	});

	blankSpaceBottom.addEventListener('dblclick', function(e) {
		if (qrData['title'] == qrData['raw']) {
			//title didn't assigned
			Ti.UI.Clipboard.setText(qrData['raw']);
		} else {
			Ti.UI.Clipboard.setText(qrData['raw'] + ' ' + qrData['title']);
		}

		var toast = new Toast(L('toast_copied'));
		self.add(toast);

		Ti.App.Properties.setBool('didCopy', true);
	});

	buttonOpenInSafari.addEventListener('click', function() {
		Ti.Platform.openURL(qrData['raw']);
	});

	//control switch
	switchOnFb.addEventListener('change', function(e) {
		//TODO:bug! Put online -> put offline
		Ti.API.info('[1]Switching?: ' + switchOnFb.switching);
		if (e.source.switching) {
			Ti.API.info('Switch action done. Reset switching property to false');
			e.source.switching = false;
			return;
		}
		e.source.switching = true;
		var delConfirm = Ti.UI.createOptionDialog({
			cancel : 1,
			options : [L('confirm_option_delete_post'), L('confirm_option_cancel')],
			destructive : 0,
			title : L('confirm_title_delete_post')
		});

		delConfirm.addEventListener('click', function(e) {
			if (e.index == 0) {
				if (fb.loggedIn && qrData['post_id'] !== null && qrData['post_id'] != -1) {
					dropFromFb(qrData['post_id']);
				} else {
					switchOnFb.value = true;

					alert(L('confirm_result_cant_delete'));
				}
			} else {
				switchOnFb.value = true;

				return;
			}
		});

		if (!e.value) {
			//ON->OFF
			delConfirm.show();

		} else {
			//OFF->ON
			//check and post new thread
			qrData['post_id'] = 0;
			checkThreadExist(true);
		}

	});

	buttonReload.addEventListener('click', function(e) {
		if (Ti.App.Properties.getBool('loggedin')) {
			checkThreadExist(false);
		}
	});

	//Call loading icon to run
	function attachLoaing() {
		Ti.API.info('attching loading!');
		loading = new Loading();
		wholeView.add(loading);
	}

	function dropFromFb(pid) {
		//attach loading activity
		loadingView.visible = true;
		loadingIcon.show();
		fb.requestWithGraphPath('' + pid + '', {}, 'DELETE', function(e) {
			if (e.success) {
				buttonSeeOnFb.title = L('button_title_offline');
				buttonSeeOnFb.enabled = false;
				if (!ios7) {
					buttonSeeOnFb.color = COLOR_GRAY;
				}

				var toast = new Toast(L('toast_deleted_post'));
				self.add(toast);
				//alert(L('The QR code is now off the world.'));
				qrData['post_id'] = -1;
				var db = Ti.Database.open('qute');
				var datetime = new Date().toISOString();
				db.execute('UPDATE history SET post_id=?,last_update=? WHERE id=?', -1, datetime, qrData['id']);
				db.close();

				//clean comments
				updateComments();

				//Make onlineSwitchInstruction visable
				onlineSwitchInstructionView.visible = true;

				//hide no comments box
				noCommentsBox.visible = false;

				//disable commnet feature
				say.visible = false;
				sendButton.visible = false;
				cantSay.visible = true;

				//call row to update self data
				Ti.API.info('Staus shall updated!!');
				qrRow.fireEvent('status_updated');

				//work done! hide loading activity
				loadingView.visible = false;
				loadingIcon.hide();

				//reset switching to false
				switchOnFb.switching = false;
			} else {
				if (e.error) {
					switchOnFb.value = true;
					alert(e.error);
				} else {
					switchOnFb.value = true;
					alert(L('alert_cant_delete_post'));
				}

				//Make onlineSwitchInstruction visable
				onlineSwitchInstructionView.visible = false;

				//work done! hide loading activity
				loadingView.visible = false;
				loadingIcon.hide();

				//reset switching to false
				switchOnFb.switching = false;

				//enable comment feature
				say.visible = true;
				sendButton.visible = true;
				cantSay.visible = false;
			}
		});
	}

	//TODO: require twice when go into Result
	function checkThreadExist(fromSwitch, justIn) {
		if (fromSwitch === null || fromSwitch === undefined) {
			//default fromSwitch value
			fromSwitch = false;
		}

		if (justIn === null || justIn === undefined) {
			//default fromSwitch value
			justIn = false;
		}

		//attach loading activity
		loadingView.visible = true;
		loadingIcon.show();

		/*var loadingIcon = Ti.UI.createActivityIndicator({
		style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
		color : 'white'
		});

		loadingIcon.show();

		var loadingView = Ti.UI.createView({
		backgroundColor : '#aaaaaa',
		opacity : 0.9,
		borderRadius : 10,
		width : 80,
		height : 80
		});

		loadingView.add(loadingIcon);
		self.add(loadingView);*/

		// note: fql have to be in unicode encode and > is %3E
		var query_url = 'https://graph.facebook.com/' + 'fql?q=' + 'SELECT+post_id+FROM+stream+WHERE+source_id=368537286624382' + '+AND+strpos(message,%27' + encodeURIComponent(qrData['raw']) + '%27)%3E=0' + '&access_token=' + fb.accessToken;
		//alert(query_url);
		//Ti.UI.Clipboard.setText(query_url);
		//TODO: request timeout may cause duplicated http request. Didn't clean client?
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {

				//hide reload button
				buttonReload.visible = false;
				switchOnFb.visible = true;
				buttonSeeOnFb.visible = true;

				var result = JSON.parse(this.responseText);
				var count = result.data.length;
				//alert(count);
				var post_id;
				//alert('success\n' + count);
				//TODO:What if a thread has been remove(exited)? Exist->Other removed->NOT Exist?
				if (count == 0) {

					//thread not exist, create one
					post_id = 0;

					if (!fromSwitch) {
						//hide loading icon
						loadingView.visible = false;
						loadingIcon.hide();

						//Attach tap twice hint
						if (justIn && !Ti.App.Properties.getBool('didCopy')) {
							var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
							self.add(tapTwiceHint);
							tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
						}

						//loading.fireEvent('done');

						//set switch off and enable it
						switchOnFb.value = false;
						switchOnFb.enabled = true;

						//Make onlineSwitchInstruction visable
						onlineSwitchInstructionView.visible = true;

						//hide no comments box
						noCommentsBox.visible = false;

						//disable commnet feature
						say.visible = false;
						sendButton.visible = false;
						cantSay.visible = true;

						var db = Ti.Database.open('qute');
						//Update post_id and from_me?
						var datetime = new Date().toISOString();
						db.execute('UPDATE history SET post_id=?,last_update=? WHERE id=?', post_id, datetime, qrData['id']);
						db.close();

						qrData['post_id'] = 0;
						//call row to update self data
						Ti.API.info('Staus shall updated!!');
						qrRow.fireEvent('status_updated');

						return;
					}

					//below code force upload a new thread if it didn't exist
					if (parseInt(qrData['post_id']) == -1) {
						//post_id = -1 means user had pull it down once and then ignore the creation procedure
						//remove loading activity
						//self.remove(loadingView);
						loadingView.visible = false;
						loadingIcon.hide();

						//Attach tap twice hint
						if (justIn && !Ti.App.Properties.getBool('didCopy')) {
							var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
							self.add(tapTwiceHint);
							tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
						}

						//Make onlineSwitchInstruction visable
						onlineSwitchInstructionView.visible = true;

						//hide no comments box
						noCommentsBox.visible = false;

						//enable commnet feature
						say.visible = true;
						sendButton.visible = true;
						cantSay.visible = false;

						//loading.fireEvent('done');

						return;
					}

					if (qrData.qrtype == 0) {
						fb.requestWithGraphPath('368537286624382/feed', {
							message : qrData['raw'],
							link : qrData['raw']
						}, 'POST', function(e) {
							if (e.success) {
								//Ti.API.info('Create success! result:' + e.result);
								var result = JSON.parse(e.result);
								Ti.API.info('Created post id: ' + result.id);
								post_id = result.id;
								var db = Ti.Database.open('qute');
								//update post_id and from_me?
								var datetime = new Date().toISOString();
								db.execute('UPDATE history SET post_id=?,from_me=?,last_update=? WHERE id=?', post_id, 1, datetime, qrData['id']);
								db.close();

								//assign back the local data
								qrData['post_id'] = post_id;

								//Update optionDialog's link
								dialogQuteUrl.title = buildFBLink(post_id);

								//Turn on the switch on fb
								switchOnFb.value = true;
								switchOnFb.enabled = true;
								buttonSeeOnFb.title = L('button_title_online');
								buttonSeeOnFb.enabled = true;
								if (!ios7) {
									buttonSeeOnFb.color = COLOR_PURPLE;
								}

								//Make onlineSwitchInstruction visable
								onlineSwitchInstructionView.visible = false;

								//show no comments box
								//TODO:zero-day error?
								noCommentsBox.visible = true;

								//enable commnet feature
								say.visible = true;
								sendButton.visible = true;
								cantSay.visible = false;

								//reset switch's property switching to false
								switchOnFb.switching = false;

								//call row to update self data
								Ti.API.info('Staus shall updated!!');
								qrRow.fireEvent('status_updated');

								//remove loading activity
								//self.remove(loadingView);
								loadingView.visible = false;
								loadingIcon.hide();

								//loading.fireEvent('done');

								//Update the title with readable name
								if (qrData['title'] == qrData['raw']) {
									fb.requestWithGraphPath(qrData['post_id'] + '?fields=name', {}, 'GET', function(e) {
										if (e.success) {
											//check if name exist and assign back to qrData['title]

											nameResult = JSON.parse(e.result);
											Ti.API.info('the result is\n' + nameResult);

											if (nameResult['name'] == null || nameResult['name'] === undefined) {
												//name is not existed. do nothing
												Ti.API.info('Name not found!');
											} else {
												//name is existed. Update db
												qrData['title'] = nameResult['name'];

												var db = Ti.Database.open('qute');
												var datetime = new Date().toISOString();
												db.execute('UPDATE history SET title=?,last_update=? WHERE id=?', qrData['title'], datetime, qrData['id']);
												db.close();

												//Assign in UI title field
												//resultText.text = qrData['title'];
												resultText.visible = false;
												readableTitle.text = qrData['title'];
												readableTitle.visible = true;
												rawLabel.text = qrData['raw'];
												rawLabel.visible = true;

												//call row to update self data
												Ti.API.info('Staus shall updated!!');
												qrRow.fireEvent('status_updated');
											}
										} else {
											if (e.error) {
												Ti.API.info('Error:\n' + e.error);
												//alert(e.error);
											} else {
												Ti.API.info('Unknown error');
												//alert('Unknown result');
											}
										}
									});
								}

							} else {
								if (e.error) {
									alert(e.error);
									switchOnFb.value = false;
									switchOnFb.enabled = true;
								} else {
									alert('Unknown result');
									switchOnFb.value = false;
									switchOnFb.enabled = true;
								}

								//remove loading activity
								//self.remove(loadingView);
								loadingView.visible = false;
								loadingIcon.hide();

								//loading.fireEvent('done');

							}
						});
					} else {
						//The QR code is not simple URL link. Appear an alert window to confirm uploading
						var dialog = Ti.UI.createAlertDialog({
							cancel : 1,
							buttonNames : [L('confirm_option_create'), L('confirm_option_no')],
							title : L('confirm_title_create_post'),
							message : L('confirm_msg_create_post')
						});
						dialog.show();
						dialog.addEventListener('click', function(e) {
							if (e.index == 0) {
								//still create a thread
								fb.requestWithGraphPath('368537286624382/feed', {
									message : qrData['title']
								}, 'POST', function(e) {
									if (e.success) {
										//Ti.API.info('Create success! result:' + e.result);
										var result = JSON.parse(e.result);
										Ti.API.info('Created post id: ' + result.id);
										post_id = result.id;
										var db = Ti.Database.open('qute');
										//Update post_id and from_me?
										var datetime = new Date().toISOString();
										db.execute('UPDATE history SET post_id=?,from_me=?,last_update=? WHERE id=?', post_id, 1, datetime, qrData['id']);
										db.close();

										//assign back the local data
										qrData['post_id'] = buildFBLink(post_id);

										//Update optionDialog's link
										dialogQuteUrl.title = post_id;

										//Turn on the switch on fb
										switchOnFb.value = true;
										switchOnFb.enabled = true;
										buttonSeeOnFb.title = L('button_title_online');
										buttonSeeOnFb.enabled = true;
										if (!ios7) {
											buttonSeeOnFb.color = COLOR_PURPLE;
										}

										//Make onlineSwitchInstruction visable
										onlineSwitchInstructionView.visible = false;

										//show no comments box
										//TODO:zero day error?
										noCommentsBox.visible = true;

										//enable comment feature
										say.visible = true;
										sendButton.visible = true;
										cantSay.visible = false;

										//reset switch's property switching to false
										switchOnFb.switching = false;

										//call row to update self data
										Ti.API.info('Staus shall updated!!');
										qrRow.fireEvent('status_updated');

										//remove loading activity
										//self.remove(loadingView);
										loadingView.visible = false;
										loadingIcon.hide();

										//loading.fireEvent('done');

									} else {
										if (e.error) {
											alert(e.error);
										} else {
											alert('Unknown result');
										}

										//set switch off and enable it
										switchOnFb.value = false;
										switchOnFb.enabled = true;

										//remove loading activity
										//self.remove(loadingView);
										loadingView.visible = false;
										loadingIcon.hide();

										//loading.fireEvent('done');

									}
								});
							} else {
								//skip, don't create thread
								//post_id = -1 means skip creating action
								Ti.API.info('User canceled the creating action');
								post_id = -1;
								var db = Ti.Database.open('qute');
								var datetime = new Date().toISOString();
								db.execute('UPDATE history SET post_id=?,last_update=? WHERE id=?', post_id, datetime, qrData['id']);
								db.close();

								//assign back the local data
								qrData['post_id'] = post_id;

								//set switch off and enable it
								switchOnFb.value = false;
								switchOnFb.enabled = true;

								//Make onlineSwitchInstruction visable
								onlineSwitchInstructionView.visible = true;

								//hide no comments box
								noCommentsBox.visible = false;

								//disable comment feature
								say.visible = false;
								sendButton.visible = false;
								cantSay.visible = true;

								//remove loading activity
								//self.remove(loadingView);
								loadingView.visible = false;
								loadingIcon.hide();

								//loading.fireEvent('done');

							}
						});
					}

				} else {
					//thread exist, get post id
					post_id = result.data[0]["post_id"];

					var need_update = false;
					if (qrData['post_id'] != post_id) {
						need_update = true;
						qrData['post_id'] = post_id;
					}

					//get comments
					fb.requestWithGraphPath('' + post_id + '?fields=comments,from,name', {}, 'GET', function(e) {
						if (e.success) {
							commentsData = JSON.parse(e.result);
							if (commentsData.comments === undefined) {
								//no comments
								Ti.API.info('No comments yet');
								noCommentsBox.visible = true;
							} else {
								//there are some comments
								Ti.API.info('Some comments existed');
								//noCommentsBox.visible = false;
								updateComments(commentsData.comments);
							}

							//TODO:update table as well.
							//TODO:Bad usability while copy/appearance of title area
							//check if there is different name field(which means readable title)
							if (commentsData['name'] == null && commentsData['name'] === undefined) {
								//name didn't exist
								Ti.API.info('Name isn\'t found');
							} else {
								//name exist. check if different
								Ti.API.info('Name is ' + commentsData['name']);
								if (qrData['title'] != commentsData['name']) {
									//different, need update!
									Ti.API.info('Different! need update title field');
									qrData['title'] = commentsData['name'];
									/*var db = Ti.Database.open('qute');
									db.execute('UPDATE history SET title=? WHERE id=?', qrData['title'], qrData['id']);
									db.close();*/

									//Assign in UI title field
									//resultText.text = qrData['title'];
									resultText.visible = false;
									readableTitle.text = qrData['title'];
									readableTitle.visible = true;
									rawLabel.text = qrData['raw'];
									rawLabel.visible = true;

									need_update = true;
								}
							}

							//check if from_me
							Ti.API.info("post from id is " + commentsData.from.id);
							Ti.API.info("user id is " + fb.uid);
							from_me = (commentsData.from.id == fb.uid);
							if (qrData['from_me'] != from_me || need_update) {
								//shall update from_me status
								qrData['from_me'] = from_me;
								var db = Ti.Database.open('qute');
								var datetime = new Date().toISOString();
								db.execute('UPDATE history SET title=?, post_id=?, from_me=?, last_update=? WHERE id=?', qrData['title'], qrData['post_id'], qrData['from_me'], datetime, qrData['id']);
								db.close();

								//Update dialog qute link
								var qutelink = buildFBLink();
								if (qutelink != false) {
									dialogQuteUrl.title = qutelink;
								} else {
									dialogQuteUrl.title = qrData['post_id'];
								}

								//call row to update self data
								Ti.API.info('Staus shall updated!!');
								qrRow.fireEvent('status_updated');

							}

							//remove loading activity
							loadingView.visible = false;
							loadingIcon.hide();

							//Attach tap twice hint
							if (justIn && !Ti.App.Properties.getBool('didCopy')) {
								var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
								self.add(tapTwiceHint);
								tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
							}

							//loading.fireEvent('done');

							//Turn on the switch on fb
							switchOnFb.enabled = from_me ? true : false;
							switchOnFb.value = true;
							switchOnFb.switching = true;

							//Make onlineSwitchInstruction visable
							onlineSwitchInstructionView.visible = false;

							//enable comment feature
							say.visible = true;
							sendButton.visible = true;
							cantSay.visible = false;

							/*//call row to update self data
							Ti.API.info('Staus shall updated!!');
							qrRow.fireEvent('status_updated');*/

							//To avoid doubling check
							buttonSeeOnFb.title = L('button_title_online');
							buttonSeeOnFb.enabled = true;
							if (!ios7) {
								buttonSeeOnFb.color = COLOR_PURPLE;
							}

							//alert(e.result);
						} else if (e.error) {
							//remove loading activity
							loadingView.visible = false;
							loadingIcon.hide();

							//appear reload button when error. Hide switch as well
							switchOnFb.visible = false;
							buttonSeeOnFb.visible = false;
							buttonReload.visible = true;

							//Make onlineSwitchInstruction visable
							onlineSwitchInstructionView.visible = false;

							//disable comment feature
							say.visible = false;
							sendButton.visible = false;
							cantSay.visible = true;

							//loading.fireEvent('done');

							alert(e.error);

							//Attach tap twice hint
							if (justIn && !Ti.App.Properties.getBool('didCopy')) {
								var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
								self.add(tapTwiceHint);
								tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
							}

						} else {
							//remove loading activity
							loadingView.visible = false;
							loadingIcon.hide();

							switchOnFb.visible = false;
							buttonSeeOnFb.visible = false;
							buttonReload.visible = true;

							//Make onlineSwitchInstruction visable
							onlineSwitchInstructionView.visible = false;

							//disable comment feature
							say.visible = false;
							sendButton.visible = false;
							cantSay.visible = true;

							//loading.fireEvent('done');

							alert('Unknown response');

							//Attach tap twice hint
							if (justIn && !Ti.App.Properties.getBool('didCopy')) {
								var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
								self.add(tapTwiceHint);
								tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
							}
						}
					});
				}
				/*//update post_id in local db
				 qrData['post_id'] = post_id;
				 var db = Ti.Database.open('qute');
				 db.execute('UPDATE history SET post_id=? WHERE id=?', post_id, qrData['id']);
				 db.close();

				 //call row to update self data
				 Ti.API.info('Staus shall updated!!');
				 qrRow.fireEvent('status_updated');*/
			},
			onerror : function(e) {
				//remove loading activity
				loadingView.visible = false;
				loadingIcon.hide();

				//appear reload button when error. Hide switch as well
				switchOnFb.visible = false;
				buttonSeeOnFb.visible = false;
				buttonReload.visible = true;

				//disable comment feature
				say.visible = false;
				sendButton.visible = false;
				cantSay.visible = true;

				//loading.fireEvent('done');

				alert(e.error);

				//Attach tap twice hint
				if (justIn && !Ti.App.Properties.getBool('didCopy')) {
					var tapTwiceHint = new ToastWithImage(L('hint_tap_twice'));
					self.add(tapTwiceHint);
					tapTwiceHint.top = picFrame.toImage().height - tapTwiceHint.toImage().height - MARGIN_HINT_BOTTOM;
				}
			},
			timeout : 5000
		});
		client.open('GET', query_url);
		client.send();
	}

	function updateComments(comments) {
		//rowData: {
		//	name, talker_id, picture, text, likes, from_me?, time, cid
		//}

		var temp_row;
		var comment_data = {};

		sayPanelHeader.rows.forEach(function(element, index, array) {
			this.remove(element);
		}, sayPanelHeader);

		if (comments == null || comments == undefined) {
			/*temp_row = Ti.UI.createTableViewRow({
			backgroundColor : 'white',
			selectionStyle : Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
			});

			var extraSpaceView = Ti.UI.createView({
			width : '100%',
			height : description_min_height
			});

			temp_row.add(extraSpaceView);*/
			//pass no comments data. May from dropFromFb()
			temp_row = descriptionRow;
			sayPanelHeader.add(temp_row);
		} else {
			//hide noCommentsBox
			noCommentsBox.visible = false;

			for (var i = 0; i < comments.data.length; i++) {
				var pic = {
					url : '/images/user_default.png',
					width : 320,
					height : 320
				};

				comment_data = {
					id : i,
					name : comments.data[i]['from']['name'],
					talker_id : comments.data[i]['from']['id'],
					picture : pic,
					text : comments.data[i]['message'],
					likes : comments.data[i]['like_count'],
					from_me : comments.data[i]['can_remove'], //TODO: real check if it's from me
					time : comments.data[i]['created_time'],
					cid : comments.data[i]['id'],
					user_likes : comments.data[i]['user_likes']
				};

				temp_row = new CommentRow(comment_data);
				sayPanelHeader.add(temp_row);

			}
		}

		temp_row = null;
		table.updateSection(sayPanelHeader, 1);

	}

	//self.open();
	return self;
};

function buildFBLink(postid) {
	if (postid === null || postid == undefined) {
		return false;
	}

	postid = postid.toString();
	if (postid.search('_') < 0) {
		//didn't leagle post_id
		return false;
	}

	var ids = postid.split('_');
	Ti.API.info('the link is ' + 'http://www.facebook.com/' + ids[0] + '/posts/' + ids[1]);
	return 'http://www.facebook.com/' + ids[0] + '/posts/' + ids[1];
}

module.exports = Result;
