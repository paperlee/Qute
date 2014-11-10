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

//COLORS
var COLOR_PURPLE = '#9857a7';
var COLOR_FB = '#3b5998';
var FACEBOOK_APP_ID;

var history = [];
var iOS7 = isIOS7Plus();
var theTop = iOS7 ? 20 : 0;
var MainWin = require('ui/handheld/MainWindow');
var Keys = require('keys');

var fb = require('facebook');

function Login() {
	var keys = new Keys();
	FACEBOOK_APP_ID = keys.facebook_appid;
	
	//TODO:only appear Login page at first launch
	//alert("loged in: "+fb.loggedIn);
	
	if (fb.loggedIn||Ti.App.Properties.getBool('skipped')) {
		//alert('not yet log in');
		var mainWin = new MainWin();
		//mainWin.open();
		return mainWin;
	}

	var self = Ti.UI.createWindow({
		navBarHidden : true,
		tintColor : COLOR_PURPLE,
		backgroundColor : 'white'
	});

	var buttonFb = Ti.UI.createButton({
		backgroundColor : COLOR_FB,
		width : 240,
		height : 44,
		bottom : '30%',
		borderRadius : 2,
		title : L('Log in Facebook'),
		tintColor : 'white'
	});

	var buttonSkip = Ti.UI.createButton({
		bottom : '15%',
		tintColor : COLOR_PURPLE,
		title : L('Stay local'),
		height : 44,
		width : 'auto'
	});

	self.add(buttonFb);
	self.add(buttonSkip);

	buttonSkip.addEventListener('click', function(e) {
		//alert('skipped');
		Ti.App.Properties.setBool('skipped',true);
		var mainWin = new MainWin();
		mainWin.open();
	});

	buttonFb.addEventListener('click', function(e) {
		//alert('log in fb');
		fb.appid = FACEBOOK_APP_ID;
		fb.permissions = ['read_stream'];
		
		fb.forceDialogAuth = true;
		fb.addEventListener('login', function(e) {
			if (e.success) {
				//alert('Logged in');
				var mainWin = new MainWin();
				mainWin.open();
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

module.exports = Login;
