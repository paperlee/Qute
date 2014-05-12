/*
 * A tabbed application, consisting of multiple stacks of windows associated with tabs in a tab group.  
 * A starting point for tab-based application with multiple top-level windows. 
 * Requires Titanium Mobile SDK 1.8.0+.
 * 
 * In app.js, we generally take care of a few things:
 * - Bootstrap the application with any data we need
 * - Check for dependencies like device type, platform version or network connection
 * - Require and open our top-level UI component
 *  
 */

//bootstrap and check dependencies
if (Ti.version < 1.8 ) {
	alert('Sorry - this application template requires Titanium Mobile SDK 1.8 or later');
}

var DB_VERSION = 0.3;

var locale = require('com.shareourideas.locale');
var dropbox = require('dropbox');
var Keys = require('keys');
var keys = new Keys();

var client = dropbox.createClient({
	app_key:keys.dropbox_appkey,
	app_secret:keys.dropbox_appskey,
	root:'dropbox'
});

// This is a single context application with mutliple windows in a stack
(function() {
	
	//determine platform and form factor and render approproate components
	var osname = Ti.Platform.osname,
		version = Ti.Platform.version,
		height = Ti.Platform.displayCaps.platformHeight,
		width = Ti.Platform.displayCaps.platformWidth;
	
	//considering tablet to have one dimension over 900px - this is imperfect, so you should feel free to decide
	//yourself what you consider a tablet form factor for android
	var isTablet = osname === 'ipad' || (osname === 'android' && (width > 899 || height > 899));
	
	//init properties
	//didCopy(Bool): determine whether the user did copy action. Did: don't show tap twice hint
	if (!Ti.App.Properties.hasProperty('didCopy')){
		//Not exist(init.) create one
		Ti.App.Properties.setBool('didCopy',false);
	}
	
	if (!Ti.App.Properties.hasProperty('loggedin')){
		Ti.App.Properties.setBool('loggedin',false);
	}
	
	if (!Ti.App.Properties.hasProperty('syncing')){
		Ti.App.Properties.setBool('syncing',false);
	}
	
	//TODO:Set uo language! Below code not work!
	//store current local
	if (!Ti.App.Properties.hasProperty('locale')){
		var lang = Ti.Platform.locale;
		Ti.App.Properties.setString('locale',lang);
		Ti.App.Properties.setBool('customLocal',false);
	} else {
		//set up app language
		if (Ti.App.Properties.getBool('customLocal')){
			var currentLocale = Ti.App.Properties.getString('locale');
			if (currentLocale == 'zh-Hans'){
				//china
				locale.setLocale("zh_CN");
			} else if (currentLocale.indexOf('zh') > -1){
				//Broad chinese env
				locale.setLocale("zh_TW");
			} else {
				//other lang
				locale.setLocale("en");
			}
		}
	}
	
	Ti.API.info('The locale is '+Ti.Platform.locale);
	Ti.API.info('Current locale is '+Ti.App.Properties.getString('locale'));
	Ti.API.info('Custom? '+Ti.App.Properties.getBool('customLocal'));
	
	//init db
	var db = Ti.Database.open('qute');
	db.execute('CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY, title, date, qrtype INTEGER, content, raw, img, loved INTEGER, post_id, qute_link, last_update, last_sync, from_me INTEGER DEFAULT 0)');
	//db.execute('ALTER TABLE history ADD COLUMN from_me INTEGER DEFAULT 0');
	db.execute('CREATE TABLE IF NOT EXISTS _system (version)');
	
	var versionSet = db.execute('SELECT * FROM _system');
	if (versionSet.rowCount == 0){
		db.execute('INSERT INTO _system VALUES(?)',DB_VERSION);
	}
	
	if (versionSet.isValidRow() && versionSet.fieldByName('version') < DB_VERSION){
		var current_db_version = versionSet.fieldByName('version');
		db.close();
		db = null;
		Ti.API.info('version changed!');
		
		//need to update db
		db = Ti.Database.open('qute');
		db.execute('BEGIN TRANSACTION');
		db.execute('ALTER TABLE history RENAME TO temp_history');
		db.execute('CREATE TABLE history(id INTEGER PRIMARY KEY, title, date, qrtype INTEGER, content, raw, img, loved INTEGER, post_id, qute_link, last_update, last_sync, from_me INTEGER DEFAULT 0)');
		
		if (current_db_version==0.2){
			//have to migrate id as well to prevent bad image naming in future release
			db.execute('INSERT INTO history (id, title, date, qrtype, content, raw, img, loved, post_id, last_update, last_sync, from_me) SELECT id, title, date, qrtype, content, raw, img, loved, post_id, last_update, last_sync, from_me FROM temp_history');
		}
		
		db.execute('DROP TABLE temp_history');
		db.execute('COMMIT');
		//Update db version
		db.execute('UPDATE _system SET version=? WHERE rowid=1',DB_VERSION);
	}
	
	db.close();
	
	var Window = require('ui/handheld/MainWindow');
	
	var self = new Window();
	self.open();
	
	// Tab structure
	/*var Window;
	if (isTablet) {
		Window = require('ui/tablet/ApplicationWindow');
	}
	else {
		Window = require('ui/handheld/ApplicationWindow');
	}

	var ApplicationTabGroup = require('ui/common/ApplicationTabGroup');
	new ApplicationTabGroup(Window).open();*/
})();
