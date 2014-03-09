var COLOR_PURPLE = '#E69857a7';
var COLOR_GREY = '#e6aaaaaa';

function iLoading(_center,interval,moving,moving_margin) {
	
	//prepare loading view
	var loadingIcon = Ti.UI.createActivityIndicator({
		style : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
		color : 'white'
	});
	
	if (moving == null || moving === undefined){
		moving = true;
	}
	
	//loadingIcon.show();

	var self = Ti.UI.createView({
		backgroundColor : COLOR_GREY,
		borderRadius : 40,
		width : 80,
		height : 80
	});
	
	self.center = _center?_center:{x:Ti.Platform.displayCaps.platformWidth/2,y:Ti.Platform.displayCaps.platformHeight/2};
	
	self.add(loadingIcon);
	loadingIcon.show();
	self.show();
	
	var fadeIn = Ti.UI.createAnimation();
	fadeIn.opacity = 1;
	fadeIn.duration = interval ? interval : 500;
	if (moving){
		var margin = moving_margin ? moving_margin : 100;
		fadeIn.center = self.center; //default margin 100
		Ti.API.info('the fadeIn top is '+fadeIn.top);
		self.center = {x:self.center.x,y:self.center.y+margin};
	}
	fadeIn.curve = Ti.UI.ANIMATION_CURVE_EASE_OUT;
	
	self.opacity = 0;
	
	var fadeOut = Ti.UI.createAnimation();
	fadeOut.opacity = 0;
	fadeOut.duration = interval ? interval : 500;
	if (moving){
		var margin = moving_margin ? moving_margin : 100;
		//fadeOut.top = self.top - margin;
		fadeOut.center = {x:self.center.x,y:self.center.y};
	}
	fadeOut.curve = Ti.UI.ANIMATION_CURVE_EASE_IN;
	
	self.animate(fadeIn);
	
	self.addEventListener('done',function(e){
		Ti.API.info('Ok the action is done');
		self.animate(fadeOut,function(){
			self.hide();
			self = null;
		});
	});
	
	return self;
};

module.exports = iLoading;
