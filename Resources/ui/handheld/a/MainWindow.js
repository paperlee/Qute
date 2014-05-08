var ICON_LOVED = '/images/icon_loved.png';
var ICON_UNLOVED = '/images/icon_unloved.png';
var ICON_STATUS_COMMENT = '/images/icon_status_comment.png';
var ICON_STATUS_OFFLINE = '/images/icon_status_offline.png';
var ICON_STATUS_ONLINE = '/images/icon_status_online.png';

var COLOR_PURPLE = '#9857a7';
var COLOR_GREY = '#dddddd';
var COLOR_GUIDE_TEXT = '#1B2326';

var need_refresh = false;
//set to true if something changed in Result page
var loveds = [];
var history = [];
var historyRows = [];
var lovedRows = [];
var billboardHeight = 160;
var history_amount;
var table;
var blankSpaceHeader;
var segmenterHeader;
var segmenterIndex = 0;
var scannerPicOverlayHeader;
var scannerPicPlaceholder;
var ResultWindow = require('ui/handheld/Result');
var LoginWidget = require('ui/handheld/LoginWidget');
var hasExtraSpace = true;
var self;
var SCANNER_PIC_PLACEHOLDER_URL = '/images/pic_placeholder.png';
var TABLE_CELL_HEIGHT = 60;
var patt_http = /^(http|https)/gi;
var fb = require('facebook');
var Toast = require('ui/handheld/iToast');
var Loading = require('ui/handheld/iLoading');
var SettingsWindow = require('ui/handheld/SettingsWindow');
//var Login = require('ui/handheld/Login');

var QRRow = require('ui/handheld/QRRow');

var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function MainWindow() {
	var table = Ti.UI.createTableView({
		
	});
}

module.exports = MainWindow;
