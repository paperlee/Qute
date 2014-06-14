var ICON_LOVED = '/images/icon_loved.png';
var ICON_UNLOVED = '/images/icon_unloved.png';
var ICON_STATUS_COMMENT = '/images/icon_status_comment.png';
var ICON_STATUS_OFFLINE = '/images/icon_status_offline.png';
var ICON_STATUS_ONLINE = '/images/icon_status_online.png';

var COLOR_PURPLE = '#9857a7';
var COLOR_GREY = '#dddddd';

var TABLE_CELL_HEIGHT = 60;

var ResultWindow = require('ui/handheld/Result');

function QRRow(rowData) {

	//rowData: {
	//	id INTEGER PRIMARY KEY, title, date, qrtype INTEGER, content, raw, img, loved INTEGER, post_id, last_update, last_sync, from_me INT
	//}
	var row = Ti.UI.createTableViewRow({
		className : 'qrrow',
		backgroundColor : '#ffffff',
		selectedBackgroundColor : '#9857a7',
		height : TABLE_CELL_HEIGHT,
		itemId : rowData['id'],
		itemData : rowData
	});

	var img_path = Ti.Filesystem.applicationDataDirectory + rowData['img'];
	var tempImg = aspectFill(img_path, TABLE_CELL_HEIGHT, TABLE_CELL_HEIGHT);
	tempImg.top = 0;
	tempImg.left = 0;

	var tempTitle = Ti.UI.createLabel({
		color : '#000000',
		minimumFontSize : 14,
		font : {
			fontSize : 18
		},
		width : 180,
		height : 20,
		text : rowData['title'],
		top : 18,
		left : 74
	});

	var datetime = new Date(rowData['date']);

	//Display time as small part of row
	var dateblock = Ti.UI.createLabel({
		text : String.formatDate(datetime) + ' ' + String.formatTime(datetime),
		font : {
			fontSize : 10
		},
		color : '#999999',
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 4,
		left : 74
	});

	//online offline status
	var statusBlock = Ti.UI.createView({
		bottom : 4,
		left : 74,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE
	});

	var statusOnline = Ti.UI.createImageView({
		left : 0,
		bottom : 0,
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		image : ICON_STATUS_ONLINE
	});

	var statusOffline = Ti.UI.createLabel({
		font : {
			fontSize : 10
		},
		color : '#999999',
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		text : L('row_title_offline'),
		bottom : 2,
		left : 0
	});

	statusBlock.add(statusOnline);
	statusBlock.add(statusOffline);

	if (rowData['post_id'] === null || rowData['post_id'] == "" || rowData['post_id'] == -1) {
		//offline
		statusOnline.visible = false;
		statusOffline.visible = true;
	} else {
		//online
		statusOnline.visible = true;
		statusOffline.visible = false;
	}

	//Loved button
	var btnLoved = Ti.UI.createButton({
		width : 50,
		height : 50,
		right : 0,
		top : 0,
		tintColor : COLOR_PURPLE,
		image : ICON_LOVED,
		style:Ti.UI.iPhone.SystemButtonStyle.PLAIN
	});

	btnLoved.image = (rowData['loved'] == 1) ? ICON_LOVED : ICON_UNLOVED;
	btnLoved.tintColor = (rowData['loved'] == 1) ? COLOR_PURPLE : COLOR_GREY;

	btnLoved.addEventListener('click', function(e) {
		/*if (element['loved'] === null||element['loved']==''){
		 element['loved'] = 0;
		 }*/

		if (rowData['loved'] == 0) {
			rowData['loved'] = 1;
			Ti.App.fireEvent('loved');
		} else {
			rowData['loved'] = 0;
		}
		var db = Ti.Database.open('qute');
		db.execute('UPDATE history SET loved=? WHERE id=?', rowData['loved'], rowData['id']);
		db.close();
		btnLoved.image = (rowData['loved'] == 1) ? ICON_LOVED : ICON_UNLOVED;
		btnLoved.tintColor = (rowData['loved'] == 1) ? COLOR_PURPLE : COLOR_GREY;
		row.itemData = rowData;
		Ti.App.fireEvent('data_updated');
	});

	row.add(tempImg);
	row.add(tempTitle);
	row.add(dateblock);
	row.add(btnLoved);
	row.add(statusBlock);

	//Add delete listner
	row.addEventListener('delete', function(e) {

		Ti.App.fireEvent('delete_row', {
			itemId : e.rowData['itemId']
		});
		//deleteRow(e.rowData['itemId']);

	});

	//Add status updated listener. For actions in Result page
	row.addEventListener('status_updated', function(e) {
		Ti.API.info('!!Status Updated!!');
		
		statusOnline.visible = true;
		statusOffline.visible = false;

		//refresh local data
		var db = Ti.Database.open('qute');
		var result = db.execute('SELECT * FROM history WHERE id=?', rowData['id']);
		var dataArray = dbRow2Array(result);
		row.itemData = dataArray;
		rowData = dataArray;

		//determine if loved
		btnLoved.image = (rowData['loved'] == 1) ? ICON_LOVED : ICON_UNLOVED;
		btnLoved.tintColor = (rowData['loved'] == 1) ? COLOR_PURPLE : COLOR_GREY;

		//determine if online
		if (rowData['post_id'] === null || rowData['post_id'] == "" || rowData['post_id'] == -1) {
			//offline
			statusOnline.visible = false;
			statusOffline.visible = true;
		} else {
			//online
			statusOnline.visible = true;
			statusOffline.visible = false;
		}
		
		//reassign title name
		tempTitle.text = rowData['title'];
		
		db.close();
		db = null;
		result = null;
		dataArray = null;
	});

	//self.open();
	return row;
};

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

function dbRow2Array(row){
	var fieldCount;
	if (Ti.Platform.name === 'android'){
		fieldCount = row.fieldCount;
	} else {
		fieldCount = row.fieldCount();
	}
	
	var obj = {};
	for (var i = 0; i < fieldCount; i++){
		obj[row.fieldName(i)] = row.field(i);
	}
	return obj;
}


module.exports = QRRow;
