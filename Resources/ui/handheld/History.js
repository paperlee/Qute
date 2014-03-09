function History(title) {
	var self = Ti.UI.createWindow({
		title:title,
		backgroundColor:'white',
		barColor:'#9857a7'
	});
	
	var button = Ti.UI.createButton({
		height:44,
		width:200,
		title:L('HERE IS HISTORY LIST'),
		top:20
	});
	self.add(button);
	
	button.addEventListener('click', function() {
		//containingTab attribute must be set by parent tab group on
		//the window for this work
		self.containingTab.open(Ti.UI.createWindow({
			title: L('newWindow'),
			backgroundColor: 'white'
		}));
	});
	
	return self;
};

module.exports = History;
