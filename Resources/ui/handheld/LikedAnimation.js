function LikedAnimation() {

	var self = Ti.UI.createView({
		backgroundColor : '#00000000',
		width : Ti.Platform.displayCaps.plateformWidth,
		height : Ti.Platform.displayCaps.platformHeight,
		top:0,
		left:0
	});

	var temp;

	for (var i = 0; i < 4; i++) {
		temp = Ti.UI.createImageView({
			image : 'images/liked_unit.png',
			width : 160,
			height : 180
		});

		//temp.transform = Ti.UI.create2DMatrix().rotate(10);
		
		var temp_transform = Ti.UI.create2DMatrix();
		
		switch(i) {
			case 0:
				temp.top = -200-40*Math.random();
				temp.left = -200-40*Math.random();
				temp_transform.rotate(10);
				temp.transform = temp_transform;
				break;
			case 1:
				temp.top = -40-40*Math.random();
				temp.left = -240-40*Math.random();
				temp_transform.rotate(10);
				temp_transform.scale(0.9);
				temp.transform = temp_transform;
				break;
			case 2:
				temp.top = -202-40*Math.random();
				temp.left = -40-40*Math.random();
				temp_transform.rotate(10);
				temp_transform.scale(0.7);
				temp.transform = temp_transform;
				break;
			case 3:
				temp.top = -200-40*Math.random();
				temp.left = -100-40*Math.random();
				temp_transform.rotate(10);
				temp_transform.scale(0.8);
				temp.transform = temp_transform;
				break;
			default:
				break;
		}
		
		var temp_animation = Ti.UI.createAnimation({
			delay:300*i,
			top:500+200*Math.random(),
			left:260+200*Math.random(),
			duration:2000+400*Math.random(),
			curve:Ti.UI.ANIMATION_CURVE_EASE_IN
		});
		
		if (i == 3){
			// the latest animation and kill self when done
			
			var completeHandler = function(){
				temp_animation.removeEventListener('complete',completeHandler);
				self.removeAllChildren();
				self.fireEvent('animationDone');
			};
			
			temp_animation.addEventListener('complete',completeHandler);
		}
		
		temp.animate(temp_animation);
		
		
		
		self.add(temp);
	}
	
	temp = null;
	
	return self;

};

module.exports = LikedAnimation;
