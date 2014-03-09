var COLOR_FB = '#3b5998';
var COLOR_PURPLE = '#9857a7';
var COLOR_PURPLE_90ALPHA = '#E69857a7';
var COLOR_LINK = '#149599';

var URL_QUTE = 'https://www.facebook.com/pages/Qute/368537286624382';

function WhyWindow() {

	var btnClose = Ti.UI.createButton({
		title : L('navibar_button_title_close'),
		style : Ti.UI.iPhone.SystemButtonStyle.BAR
	});

	var main = Ti.UI.createWindow({
		modal : true,
		navBarHidden : false,
		leftNavButton : btnClose,
		title : L('window_title_why_fb'),
		backgroundColor : 'white'
	});

	var navWin = Ti.UI.iOS.createNavigationWindow({
		tintColor : COLOR_PURPLE,
		backgroundColor : 'white',
		modal : true,
		window : main
	});
	
	var scrollView = Ti.UI.createScrollView({
		scrollType:'vertical',
		layout:'vertical'
	});
	
	var quteStr = L('para_title_qute');

	var quteAttrStr = Ti.UI.iOS.createAttributedString({
		text : quteStr,
		attributes : [{
			type : Ti.UI.iOS.ATTRIBUTE_UNDERLINES_STYLE,
			value : Ti.UI.iOS.ATTRIBUTE_UNDERLINE_STYLE_SINGLE,
			range : [0, quteStr.length]
		}, {
			type : Ti.UI.iOS.ATTRIBUTE_FOREGROUND_COLOR,
			value : COLOR_LINK,
			range : [0, quteStr.length]
		}]
	});

	var quteTitle = Ti.UI.createLabel({
		attributedString : quteAttrStr,
		font : {
			fontSize : 18,
			fontWeight : 'bold'
		},
		width : 280,
		height : 'auto',
		top : 16
	});

	scrollView.add(quteTitle);

	quteTitle.addEventListener('click', function(e) {
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

	var quteDes = Ti.UI.createLabel({
		width : 280,
		height : 'auto',
		font : {
			fontSize : 14
		},
		wordWrap : true,
		top : 10,
		color : 'black',
		text : L('para_text_qute')
	});

	scrollView.add(quteDes);

	var shareTipBox = Ti.UI.createView({
		width : 280,
		height : Ti.UI.SIZE,
		top : 4
	});

	var shareTipPic = Ti.UI.createView({
		width : 70,
		height : 70,
		backgroundImage : '/images/icon_why_bubbles.png',
		top : 0,
		left : 0
	});

	var shareTipText = Ti.UI.createLabel({
		left : 80,
		width : 200,
		text : L('para_tip_share'),
		font : {
			fontWeight : 'bold',
			fontSize : 16
		},
		color : 'black'
	});

	shareTipBox.add(shareTipPic);
	shareTipBox.add(shareTipText);

	scrollView.add(shareTipBox);

	var readCommentsBox = Ti.UI.createView({
		width : 280,
		height : Ti.UI.SIZE,
		top : 4
	});

	var readCommentsPic = Ti.UI.createView({
		width : 70,
		height : 70,
		backgroundImage : '/images/icon_why_global.png',
		top : 0,
		left : 210
	});

	var readCommentsText = Ti.UI.createLabel({
		left : 0,
		width : 200,
		text : L('para_tip_read_comment'),
		font : {
			fontWeight : 'bold',
			fontSize : 16
		},
		color : 'black'
	});

	readCommentsBox.add(readCommentsPic);
	readCommentsBox.add(readCommentsText);

	scrollView.add(readCommentsBox);

	var createPostBox = Ti.UI.createView({
		width : 280,
		height : Ti.UI.SIZE,
		top : 4
	});

	var createPostPic = Ti.UI.createView({
		width : 90,
		height : 120,
		backgroundImage : '/images/icon_why_alive.png',
		top : 0,
		left : 0
	});

	var createPostText = Ti.UI.createLabel({
		left : 95,
		width : 185,
		text : L('para_tip_post'),
		font : {
			fontWeight : 'bold',
			fontSize : 16
		},
		color : 'black'
	});

	createPostBox.add(createPostPic);
	createPostBox.add(createPostText);

	scrollView.add(createPostBox);

	var nothingMoreTitle = Ti.UI.createLabel({
		top : 10,
		width : 280,
		font : {
			fontSize : 16,
			fontWeight : 'bold'
		},
		text : L('para_title_more'),
		color : 'black'
	});

	scrollView.add(nothingMoreTitle);

	var nothingMoreDes = Ti.UI.createLabel({
		top : 6,
		width : 280,
		font : {
			fontSize : 14
		},
		color : 'black',
		text : L('para_text_more')
	});

	scrollView.add(nothingMoreDes);
	
	var blankSpace = Ti.UI.createView({
		width:Ti.UI.FILL,
		height:16
	});
	
	scrollView.add(blankSpace);
	
	main.add(scrollView);
	
	//close the window
	btnClose.addEventListener('click', function(e) {
		navWin.close({
			transition : Ti.UI.iPhone.AnimationStyle.CURL_DOWN
		});
	});

	navWin.open({
		modal : true,
		modalTransitionStyle : Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
		modalStyle : Ti.UI.iPhone.MODAL_PRESENTATION_CURRENT_CONTEXT
	});
	//navWin.window = main;
	
	return navWin;
};

module.exports = WhyWindow;
