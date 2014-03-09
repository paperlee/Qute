function ApplicationTabGroup(Window) {
	//create module instance
	var self = Ti.UI.createTabGroup({
		tabsBackgroundColor:'#9857a7',
		tintColor:'#80f4f3'
	});
	
	//create app tabs
	var win1 = new Window(L('history')),
		win2 = new Window(L('scanner')),
		win3 = new Window(L('favorite'));
	
	var tab1 = Ti.UI.createTab({
		title: L('history'),
		icon: '/images/icon_tab_history.png',
		window: win1
	});
	win1.containingTab = tab1;
	
	var tab2 = Ti.UI.createTab({
		title: L('scanner'),
		icon: '/images/icon_tab_scanner.png',
		window: win2
	});
	win2.containingTab = tab2;
	
	var TiBar = require("tibar");
	
	win2.addEventListener("focus",function(){
		Ti.API.info("!!Clicked tab2");
		TiBar.scan({
			// simple configuration for iPhone simulator
			configure : {
				classType : "ZBarReaderViewController",
				sourceType : "Camera",
				cameraMode : "Sampling",
				config : {
					"showsCameraControls" : true,
					"showsHelpOnFail" : true,
					"takesPicture" : true,
					"tracksSymbols" : true,
					"showsZBarControls" : true,
					"enableCache" : true
				},
				symbol : {
					"QR-Code" : true,
				}
			},
			success : function(data) {
				Ti.API.info('TiBar success callback!');
				if (data && data.barcode) {
					Ti.UI.createAlertDialog({
						title : "Scan result",
						message : "Barcode: " + data.barcode + " Symbology:" + data.symbology
					}).show();
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
	
	var tab3 = Ti.UI.createTab({
		title: L('favorite'),
		icon: '/images/icon_tab_favorite.png',
		window: win3
	});
	win3.containingTab = tab3;
	
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);
	
	return self;
};

module.exports = ApplicationTabGroup;
