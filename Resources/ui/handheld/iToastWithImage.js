var COLOR_PURPLE = '#E69857a7';
var COLOR_GREY = '#aaaaaa';

function iToastWithImage(msg,img,interval) {
	
	var self = Ti.UI.createView({
		backgroundColor:COLOR_PURPLE,
		borderRadius:10,
		width:280,
		height:Ti.UI.SIZE
	});
	
	var msg = msg && typeof(msg!==undefined)?msg:L('toast placeholder');
	
	var img = img && typeof(img!==undefined)?img:'/images/icon_hint_taptwice.png';
	
	//TODO:check origin img's size
	//TODO:set as backgroundImage instead of image (tintColor problem)
	var hintImg = Ti.UI.createImageView({
		width:40,
		height:40,
		image:img,
		tintColor:'white',
		left:18,
		top:6,
		bottom:6
	});
	
	self.add(hintImg);
	
	var msgText = Ti.UI.createLabel({
		width:'auto',
		left:hintImg.toImage().width + hintImg.left + 10,
		wordWrap:true,
		height:'auto',
		color:'#fff',
		textAlign:'left',
		text:msg,
		font:{
			fontSize:14
		}
	});
	
	self.add(msgText);
	
	self.show();
	
	var fadeOut = Ti.UI.createAnimation();
	fadeOut.opacity = 0;
	fadeOut.delay = 3000;
	fadeOut.duration = interval ? interval : 1000;
	
	//interval = interval ? interval : 1000; //default 1 second to disappear
	self.animate(fadeOut,function(){
		self.hide();
		self = null;
	});
	
	return self;
};

module.exports = iToastWithImage;
