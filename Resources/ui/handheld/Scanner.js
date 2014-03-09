function Scanner(title) {
	var self = Ti.UI.createWindow({
		title : title,
		backgroundColor : 'white'
	});

	var button = Ti.UI.createButton({
		height : 44,
		width : 200,
		title : L('HERE IS SCANNER'),
		top : 20
	});
	self.add(button);

	var TiBar = require('tibar');
	
	button.addEventListener('click', function() {
		//do something...
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
			},
			error : function() {
				Ti.API.info('TiBar error callback!');
			}
		});
	});

	return self;

};

module.exports = Scanner;
