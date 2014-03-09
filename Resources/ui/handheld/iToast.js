var COLOR_PURPLE = '#E69857a7';
var COLOR_GREY = '#aaaaaa';

function iToast(msg,interval) {
	
	var self = Ti.UI.createView({
		backgroundColor:COLOR_PURPLE,
		opacity:0.9,
		borderRadius:10,
		width:250,
		height:Ti.UI.SIZE,
		bottom:40
	});
	
	var msg = msg && typeof(msg!==undefined)?msg:L('toast placeholder');
	
	var msgText = Ti.UI.createLabel({
		width:230,
		left:10,
		top:10,
		bottom:10,
		wordWrap:true,
		height:'auto',
		color:'#fff',
		textAlign:'center',
		text:msg
	});
	
	self.add(msgText);
	
	self.show();
	
	var fadeOut = Ti.UI.createAnimation();
	fadeOut.opacity = 0;
	fadeOut.delay = 1000;
	fadeOut.duration = interval ? interval : 1000;
	
	//interval = interval ? interval : 1000; //default 1 second to disappear
	self.animate(fadeOut,function(){
		self.hide();
		self = null;
	});
	
	return self;
};

module.exports = iToast;
