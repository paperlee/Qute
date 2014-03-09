var ODD_BACKGROUND_COLOR = '#ffffff';
var EVEN_BACKGROUND_COLOR = '#e2e8e8';
var ME_BACKGROUND_COLOR = '#bdd982';

var BUTTON_GOOD_COLOR = '#466673';
var BUTTON_GOODED_COLOR = '#9857a7';

var fb = require('facebook');

function CommentRow(rowData) {

	//rowData: {
	//	id, name, talker_id, picture, text, likes, from_me?, time, cid //comment id
	//}
	var self = Ti.UI.createTableViewRow({
		data:rowData,
		selectionStyle:Ti.UI.iPhone.TableViewCellSelectionStyle.NONE
	});

	var commentView = Ti.UI.createView({
		width : '100%',
		height : Ti.UI.SIZE
	});

	if (rowData['from_me']) {
		commentView.backgroundColor = ME_BACKGROUND_COLOR;
		//self.moveable = true;
		//self.editable = true;
	} else if (parseInt(rowData['id'], 10) % 2 == 0) {
		//ODD from 0
		commentView.backgroundColor = ODD_BACKGROUND_COLOR;
	} else {
		commentView.backgroundColor = EVEN_BACKGROUND_COLOR;
	}

	var pictureView = MaskPic(rowData['picture']['url'], 15, 40, 40);
	pictureView.top = pictureView.left = 10;
	
	//TODO:loading not work
	var loading = Ti.UI.createActivityIndicator({
		color:'white',
		style:Ti.UI.iPhone.ActivityIndicatorStyle.DARK,
		height:Ti.UI.SIZE,
		width:Ti.UI.SIZE
	});
	
	loading.show();
	
	pictureView.add(loading);

	//fetch talker picture
	fb.requestWithGraphPath('' + rowData['talker_id'] + '?fields=picture.width(320).height(320)', {}, 'GET', function(e) {
		if (e.success) {
			var picResult = JSON.parse(e.result);
			rowData['picture'] = picResult['picture'].data;
			pictureView.children[0].image = rowData['picture'].url;
			pictureView.remove(loading);
			loading.hide();
			//alert(e.result);
		} else if (e.error) {
			loading.hide();
			alert(e.errow);
		} else {
			loading.hide();
			alert('Unknown response');
		}
	});

	var nameBlock = Ti.UI.createLabel({
		font : {
			fontSize : 10
		},
		color : 'black',
		width : 50,
		height : Ti.UI.SIZE,
		wordWrap : true,
		textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		verticalAlign:Ti.UI.TEXT_VERTICAL_ALIGNMENT_TOP,
		top : 55,
		left : 5,
		text : rowData['name'],
		bottom:10
	});

	var time = parseDate(rowData['time']);
	//alert(time.getHours());
	//var time = new Date(rowData['time']);
	//alert(time.getHours());
	var dateBlock = Ti.UI.createLabel({
		font : {
			fontSize : 10
		},
		color : '#999999',
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		top : 8,
		left : 60,
		text: String.formatDate(time)
		//text : time.getDate() + '.' + (time.getMonth() + 1) + ' ' + time.getFullYear()
	});

	var timeBlock = Ti.UI.createLabel({
		font : {
			fontSize : 10
		},
		color : '#999999',
		width : Ti.UI.SIZE,
		height : Ti.UI.SIZE,
		text : time.getHours() + ':' + time.getMinutes(),
		top : 8,
		left : 118,
		text: String.formatTime(time)
	});

	var msg = Ti.UI.createLabel({
		font : {
			fontSize : 14
		},
		color : 'black',
		width : 188,
		height : Ti.UI.SIZE,
		top : 25,
		left : 60,
		text : rowData['text'],
		bottom:10
	});

	var buttonGood = Ti.UI.createButton({
		backgroundImage : '/images/icon_good.png',
		width : 60,
		height : 60,
		title : rowData['likes'],
		tintColor : 'white',
		right : 4
	});

	commentView.add(pictureView);
	commentView.add(nameBlock);
	commentView.add(dateBlock);
	commentView.add(timeBlock);
	commentView.add(msg);
	commentView.add(buttonGood);

	//var height_msg = msg.top + msg.toImage().height + pictureView.top;
	//margin bottom and top equal to puctureView.top
	//var height_user = nameBlock.top + nameBlock.toImage().height + pictureView.top;
	//Ti.API.info("nameBlock height: "+ nameBlock.toImage().height);
	//commentView.height = height_msg > height_user ? height_msg : height_user;

	self.add(commentView);
	//Ti.API.info("nameBlock height: "+ nameBlock.toImage().height);
	
	//self.open();
	return self;
};

function MaskPic(url, r, w, h) {
	var ctn = Ti.UI.createView({
		borderRadius : r,
		width : w,
		height : h
	});

	var pic = Ti.UI.createImageView({
		image : url,
		width : w,
		height : h
	});

	ctn.add(pic);

	return ctn;
}

function parseDate(myDate) {
	var parts, date, time, dt, ms;

	parts = myDate.split(/[T ]/);
	// Split on `T` or a space to get date and time
	date = parts[0];
	time = parts[1];

	dt = new Date();

	parts = date.split(/[-\/]/);
	// Split date on - or /
	dt.setFullYear(parseInt(parts[0], 10));
	dt.setMonth(parseInt(parts[1], 10) - 1);
	// Months start at 0 in JS
	dt.setDate(parseInt(parts[2], 10));

	parts = time.split(/:/);
	// Split time on :
	dt.setHours(parseInt(parts[0], 10));
	dt.setMinutes(parseInt(parts[1], 10));
	dt.setSeconds(parseInt(parts[2], 10));

	//ms = dt.getTime();
	//return ms;

	return dt;
}

module.exports = CommentRow;
