//COLORS
var COLOR_PURPLE = '#9857a7';

var COLOR_FB = '#3b5998';
//FB blue
var COLOR_WHY = '#16274c';
//dark blue
var COLOR_SKIP = '#99252c';
//red

var COLOR_SUBTITLE = '#E8D5DE';

var COLOR_FB_HIGHLIGHTED = '#7485a9';
//fb blue
var COLOR_WHY_HIGHLIGHTED = '#5a6e99';
//dark blue
var COLOR_SKIP_HIGHLIGHTED = '#aa5c61';
//red

var FACEBOOK_APP_ID = 614174031953325;

var history = [];

var fb = require('facebook');
var WhyWindow = require('ui/handheld/WhyWindow');

function LoginWidget() {
	//TODO:only appear Login page at first launch
	//alert("loged in: "+fb.loggedIn);

	/*if (fb.loggedIn||Ti.App.Properties.getBool('skipped')) {
	 //alert('not yet log in');
	 var mainWin = new MainWin();
	 //mainWin.open();
	 return mainWin;
	 }*/

	var self = Ti.UI.createView({
		tintColor : COLOR_PURPLE,
		backgroundColor : 'white',
		width : '100%',
		height : 50
	});

	var viewFb = Ti.UI.createButton({
		backgroundColor : COLOR_FB,
		width : 320 - 100,
		height : 50,
		bottom : 0,
		left : 0,
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	var globalIcon = Ti.UI.createImageView({
		width : 40,
		height : 40,
		image : '/images/icon_global.png',
		left : 4
	});

	var labelFB = Ti.UI.createLabel({
		color : 'white',
		text : L('button_title_login_fb'),
		top : 6,
		left : 50,
		font : {
			fontSize : 14
		}
	});

	var labelSubtitle = Ti.UI.createLabel({
		color : '#cccccc',
		text : L('button_subtitle_join_world'),
		top : 26,
		left : 50,
		font : {
			fontSize : 12
		}
	});

	viewFb.add(globalIcon);
	viewFb.add(labelFB);
	viewFb.add(labelSubtitle);

	var viewSkip = Ti.UI.createButton({
		bottom : 0,
		height : 50,
		right : 0,
		width : 50,
		backgroundColor : '#99252c',
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	var skipIcon = Ti.UI.createImageView({
		width : 30,
		height : 30,
		image : '/images/icon_cross.png',
		top : 4
	});

	var labelSkip = Ti.UI.createLabel({
		color : '#999999',
		text : L('button_title_not_now'),
		top : 33,
		font : {
			fontSize : 10
		}
	});

	viewSkip.add(skipIcon);
	viewSkip.add(labelSkip);

	var viewWhy = Ti.UI.createButton({
		width : 50,
		height : 50,
		right : 50,
		bottom : 0,
		backgroundColor : '#16274c',
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	var whyIcon = Ti.UI.createImageView({
		width : 30,
		height : 30,
		image : '/images/icon_question.png',
		top : 4
	});

	var labelWhy = Ti.UI.createLabel({
		color : '#999999',
		text : L('button_title_why'),
		top : 31,
		font : {
			fontSize : 12
		}
	});

	viewWhy.add(whyIcon);
	viewWhy.add(labelWhy);

	/*var learnMoreBox = Ti.UI.createView({
	 width : '100%',
	 height : 50,
	 backgroundColor : '#51265B',
	 top : 0,
	 left : 0
	 });

	 var globalIcon = Ti.UI.createImageView({
	 width:40,
	 height:40,
	 image:'/images/icon_global.png',
	 left:10
	 });

	 var labelSubtitle = Ti.UI.createLabel({
	 width:'auto',
	 text:L('To join the world'),
	 height:'auto',
	 font:{
	 fontSize:18
	 },
	 color:COLOR_SUBTITLE,
	 left:55
	 });

	 var labelWhy = Ti.UI.createLabel({
	 width:'auto',
	 text:L('WHY?'),
	 height:'auto',
	 font:{
	 fontSize:14
	 },
	 color:COLOR_SUBTITLE,
	 right:32
	 });

	 var arrow = Ti.UI.createImageView({
	 width:40,
	 height:40,
	 image:'/images/icon_arrow.png',
	 right:0
	 });

	 learnMoreBox.add(globalIcon);
	 learnMoreBox.add(labelSubtitle);
	 learnMoreBox.add(labelWhy);
	 learnMoreBox.add(arrow);

	 self.add(learnMoreBox);*/
	self.add(viewFb);
	self.add(viewSkip);
	self.add(viewWhy);

	/*learnMoreBox.addEventListener('click',function(e){
	 //TODO:The learn more page
	 Ti.API.info('Learn more box clicked');
	 });*/

	viewWhy.addEventListener('touchstart', function(e) {
		viewWhy.backgroundColor = COLOR_WHY_HIGHLIGHTED;
	});

	viewWhy.addEventListener('touchend', function(e) {
		viewWhy.backgroundColor = COLOR_WHY;
	});

	viewWhy.addEventListener('click', function(e) {
		Ti.API.info('Learn more box clicked');
		var winWhy = new WhyWindow();
	});

	viewSkip.addEventListener('touchstart', function(e) {
		viewSkip.backgroundColor = COLOR_SKIP_HIGHLIGHTED;
	});

	viewSkip.addEventListener('touchend', function(e) {
		viewSkip.backgroundColor = COLOR_SKIP;
	});

	viewSkip.addEventListener('click', function(e) {
		//alert('skipped');
		Ti.App.Properties.setBool('skipped', true);
		self.fireEvent('skip');
		//var mainWin = new MainWin();
		//mainWin.open();
	});

	viewFb.addEventListener('touchstart', function(e) {
		viewFb.backgroundColor = COLOR_FB_HIGHLIGHTED;
	});

	viewFb.addEventListener('touchend', function(e) {
		viewFb.backgroundColor = COLOR_FB;
	});

	viewFb.addEventListener('click', function(e) {
		//alert('log in fb');
		fb.appid = FACEBOOK_APP_ID;
		fb.permissions = ['publish_actions', 'publish_stream', 'read_stream'];

		fb.forceDialogAuth = true;
		fb.addEventListener('login', function(e) {
			if (e.success) {
				self.fireEvent('loggedIn');
				Ti.App.Properties.setBool('loggedin',true);
				//var mainWin = new MainWin();
				//mainWin.open();
			} else if (e.error) {
				alert(e.error);
			} else if (e.cancelled) {
				alert('Cancelled');
			}
		});
		fb.authorize();
	});

	return self;

};

module.exports = LoginWidget;
