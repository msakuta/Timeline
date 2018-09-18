var Timeline = new (function(){
'use strict'
var canvas;
var container;
var canvasXAxis;
var width;
var height;
var xaxisHeight;
var tags;

var colorPalette = [
	"#afaf7f", "#7faf7f", "#af7f7f", "#7fafaf", "#7f7faf", "#afafaf",
]

var mouseCenter = [0,0];
var lastMouseCenter = [0,0];
var mouseDragging = false;
var trans = [1,0,0,1,0,0];

var zoomElement;
var transElement;
var mouseElement;
var drawCountElement;
var timeScale = 5.;
var timeOffset = 1800;
var vertOffset = 0;
var itemHeight = 20;

var data = [
	{timeBegin: -500, timeEnd: -27, name: "Roman Republic", tag: "Europe"},
	{timeBegin: -27, timeEnd: 395, name: "Roman Empire", tag: "Europe"},
	{timeBegin: 395, timeEnd: 1453, name: "Western Roman Empire", tag: "Europe"},
	{timeBegin: -570, timeEnd: -495, name: "Pythagoras", tag: "Philosophy"},
	{timeBegin: -470, timeEnd: -399, name: "Socrates", tag: "Philosophy"},
	{timeBegin: -423, timeEnd: -348, name: "Plato", tag: "Philosophy"},
	{timeBegin: -384, timeEnd: -322, name: "Aristotle", tag: "Philosophy"},
	{timeBegin: -287, timeEnd: -212, name: "Archimedes", tag: "Philosophy"},
	{timeBegin: 1596, timeEnd: 1650, name: "René Descartes", tag: "Philosophy"},
	{timeBegin: 1623, timeEnd: 1662, name: "Blaise Pascal", tag: "Philosophy"},
	{timeBegin: 1844, timeEnd: 1900, name: "Friedrich Wilhelm Nietzsche", tag: "Philosophy"},
	{timeBegin: 1723, timeEnd: 1790, name: "Adam Smith", tag: "Economy"},
	{timeBegin: 1818, timeEnd: 1883, name: "Karl Marx", tag: "Economy"},
	{timeBegin: 1820, timeEnd: 1895, name: "Friedrich Engels", tag: "Economy"},
	{time: 1848, name: "The Communist Manifesto", tag: "Economy"},
	{time: 1867, name: "Das Kapital", tag: "Economy"},
	{timeBegin: 1856, timeEnd: 1939, name: "Sigmund Freud", tag: "Psychology"},
	{timeBegin: 1875, timeEnd: 1961, name: "Carl Gustav Jung", tag: "Psychology"},
	{timeBegin: 1564, timeEnd: 1642, name: "Galileo Galilei", tag: "Physics"},
	{timeBegin: 1642, timeEnd: 1726, name: "Issac Newton", tag: "Physics"},
	{timeBegin: 1646, timeEnd: 1716, name: "Gottfried Wilhelm Leibniz", tag: "Physics"},
	{time: 1905, name: "Special Relativity", tag: "Physics"},
	{time: 1915, name: "General Relativity", tag: "Physics"},
	{timeBegin: 1831, timeEnd: 1871, name: "James Clerk Maxwell", tag: "Physics"},
	{timeBegin: 1879, timeEnd: 1955, name: "Albert Einstein", tag: "Physics"},
	{timeBegin: 1898, timeEnd: 1964, name: "Leo Szilard", tag: "Physics"},
	{time: 1939, name: "Einstein-Szilard letter", tag: "Physics"},
	{time: 1945, name: "Manhattan Project", tag: "Physics"},
	{timeBegin: 1912, timeEnd: 1954, name: "Alan Mathieson Turing", tag: "Computer Science"},
	{time: 1946, name: "ENIAC", tag: "Computer Science"},
	{time: 1965, name: "PDP-7", tag: "Computer Science"},
	{timeBegin: 1966, timeEnd: 1975, name: "Apollo Guidance Computer", tag: "Computer Science"},
	{time: 2001, name: "The Agile Manifesto", tag: "Computer Science"},
];

if(!Math.log10){
	Math.log10 = function(x){
		return Math.log(x) / Math.LN10;
	}
}

function magnify(f, screenX){
	timeOffset += (f - 1) * screenX / f / timeScale;
	timeScale *= f;
	zoomElement.innerHTML = timeScale.toString();
	transElement.innerHTML = timeOffset.toString();
	draw();
}

var magnifyKey = this.magnifyKey = function magnifyKey(e){
	magnify(1.2, width / 2);
	e.preventDefault();
}

var minifyKey = this.minifyKey = function minifyKey(e){
	magnify(1 / 1.2, width / 2);
	e.preventDefault();
}

var leftKey = this.leftKey = function leftKey(e){
	timeOffset -= 20 / timeScale;
	timeOffset = Math.round(timeOffset);
	draw();
	e.preventDefault();
}

var upKey = this.upKey = function upKey(e){
	//vertOffset -= 20;
	container.scrollTop -= 20;
	//draw();
	e.preventDefault();
}

var rightKey = this.rightKey = function rightKey(e){
	timeOffset += 20 / timeScale;
	timeOffset = Math.round(timeOffset);
	draw();
	e.preventDefault();
}

var downKey = this.downKey = function downKey(e){
	//vertOffset += 20;
	container.scrollTop += 20;
	//draw();
	e.preventDefault();
}

var tagset = {};

window.onload = function() {
	canvas = document.getElementById("scratch");
	if ( ! canvas || ! canvas.getContext ) {
		return false;
	}
	container = document.getElementById("container");
	if(!container){
		return false;
	}
	canvasXAxis = document.getElementById("xaxis");
	if(!canvasXAxis || !canvas.getContext){
		return false;
	}
	canvas.style.height = itemHeight * data.length + 'px';
	canvas.setAttribute('height', itemHeight * data.length + 'px');
	var canvasRect = canvas.getBoundingClientRect();
	width = canvasRect.width;
	height = canvasRect.height;
	var canvasXAxisRect = canvasXAxis.getBoundingClientRect();
	xaxisHeight = canvasXAxisRect.height;
	tags = document.getElementById("tags");

	for(var i = 0; i < data.length; i++){
		if("tag" in data[i])
			tagset[data[i].tag] = {visible: true};
	}

	var colori = 0;
	for(var i in tagset){
		var tagElem = document.createElement("span");
		tagElem.className = "tag";
		tagElem.innerHTML = i;
		var c = tagset[i].colorIdx = colori++ % colorPalette.length;
		tagElem.style.backgroundColor = colorPalette[c];
		tagElem.onclick = function(){
			var set = tagset[this.innerHTML];
			set.visible = !set.visible;
			this.style.color = set.visible ? "#000" : "#4f4f4f";
			draw();
		}
		tags.appendChild(tagElem);
	}

	zoomElement = document.getElementById("zoom");
	transElement = document.getElementById("trans");
	mouseElement = document.getElementById("mouse");
	drawCountElement = document.getElementById("drawcount");

	// For Google Chrome
	function MouseWheelListenerFunc(e){
		magnify(0 < e.wheelDelta ? 1.2 : 1. / 1.2, mouseCenter[0]);

		// Cancel scrolling by the mouse wheel
		e.preventDefault();
	}

	// For FireFox
	function MouseScrollFunc(e){
		magnify(e.detail < 0 ? 1.2 : 1. / 1.2, mouseCenter[0]);

		// Cancel scrolling by the mouse wheel
		e.preventDefault();
	}

	function keydown(e){
		if(e.key === '+'){
			magnifyKey(e);
		}
		else if(e.key === '-'){
			minifyKey(e);
		}
		else if(event.keyCode === 37){ // Left arrow
			leftKey(e);
		}
		else if(event.keyCode === 38){ // Up arrow
			upKey(e);
		}
		else if(event.keyCode === 39){ // Right arrow
			rightKey(e);
		}
		else if(event.keyCode === 40){ // Down arrow
			downKey(e);
		}
	}

	if(canvas.addEventListener){
		canvas.addEventListener("mousewheel" , MouseWheelListenerFunc);
		canvas.addEventListener("DOMMouseScroll" , MouseScrollFunc);
		window.addEventListener("keydown", keydown);
	}

	// It's tricky to obtain client coordinates of a HTML element.
	function getOffsetRect(elem){
		var box = elem.getBoundingClientRect();
		var body = document.body;
		var docElem = document.documentElement;
 
		var clientTop = docElem.clientTop || body.clientTop || 0
		var clientLeft = docElem.clientLeft || body.clientLeft || 0

		var top  = box.top - clientTop
		var left = box.left - clientLeft

		return { top: Math.round(top), left: Math.round(left) }
	}

	canvas.onmousemove = function (e){

		// For older InternetExplorerS
		if (!e)	e = window.event;

		var r = getOffsetRect(canvas);

		mouseCenter[0] = e.clientX - r.left;
		mouseCenter[1] = e.clientY - r.top;

		if(mouseDragging){
			var nextx = trans[4] + mouseCenter[0] - lastMouseCenter[0];
			var nexty = trans[5] + mouseCenter[1] - lastMouseCenter[1];
			if(0 <= -nextx && -nextx < width * (trans[0] - 1))
				trans[4] += mouseCenter[0] - lastMouseCenter[0];
			if(0 <= -nexty && -nexty < height * (trans[3] - 1))
				trans[5] += mouseCenter[1] - lastMouseCenter[1];

			lastMouseCenter[0] = mouseCenter[0];
			lastMouseCenter[1] = mouseCenter[1];
		}
		e.preventDefault();
	};

	canvas.onmousedown = function(e){
		mouseDragging = true;
		mouseElement.innerHTML = "true";

		var r = getOffsetRect(canvas);

		lastMouseCenter[0] = e.clientX - r.left;
		lastMouseCenter[1] = e.clientY - r.top;
	};

	canvas.onmouseup = function(e){
		mouseDragging = false;
		mouseElement.innerHTML = "false";
	};

	draw();
};

function draw() {
	var ctx = canvas.getContext('2d');
	ctx.setTransform(1,0,0,1,0,0);
	ctx.clearRect(0,0,width,height);

	var ctx2 = canvasXAxis.getContext('2d');

	var drawCounts = {}, totalCounts = {};
	for(var i = 0; i < 2; i++){
		var counts = [drawCounts, totalCounts][i];
		counts.edge = counts.vertex = counts.vehicle = counts.signal = 0;
	}

	ctx.font = "bold 16px Helvetica";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	ctx2.font = "bold 16px Helvetica";
	ctx2.textAlign = "center";
	ctx2.textBaseline = "top";
	ctx2.clearRect(0,0,width,xaxisHeight);

	var timeLog = 2 - Math.log10(timeScale);
	var timeInterval = Math.pow(10, Math.floor(timeLog));
	if(timeLog - Math.floor(timeLog) < 0.5)
		timeInterval /= 2.;
	var timeMajorInterval = timeInterval * 5;
	var timeStart = Math.floor(timeOffset / timeMajorInterval) * timeMajorInterval;
	var contentHeight = height;

	// Draw vertical lines with equal spacing
	ctx.strokeStyle = "#000";
	ctx.font = "bold 12px Helvetica";
	ctx.strokeStyle = "#7f7f7f";
	for(var i = 0; i < 100; i++){
		var x = (i * timeInterval + timeStart - timeOffset) * timeScale;
		if(i % 5 === 0){
			ctx.setLineDash([]);
			ctx.fillStyle = "#000";
			ctx2.fillText(timeStart + i * timeInterval, x, 0);
		}
		else
			ctx.setLineDash([5,5]);
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, contentHeight);
		ctx.stroke();
	}
	ctx.setLineDash([]);

	function rangeOutPast(i, y){
		ctx.beginPath();
		ctx.moveTo(0, y + 10);
		ctx.lineTo(7, y + 5);
		ctx.lineTo(7, y + 15);
		ctx.closePath();
		if(data[i].tag in tagset){
			ctx.fillStyle = colorPalette[tagset[data[i].tag].colorIdx];
			ctx.fill();
		}
		ctx.stroke();
		ctx.fillStyle = "#000";
		ctx.textAlign = "left";
		ctx.fillText(data[i].name, 10, y + 5);
	}

	function rangeOutFuture(i, y){
		ctx.beginPath();
		ctx.moveTo(width, y + 10);
		ctx.lineTo(width - 7, y + 5);
		ctx.lineTo(width - 7, y + 15);
		ctx.closePath();
		if(data[i].tag in tagset){
			ctx.fillStyle = colorPalette[tagset[data[i].tag].colorIdx];
			ctx.fill();
		}
		ctx.stroke();
		ctx.fillStyle = "#000";
		ctx.textAlign = "right";
		ctx.fillText(data[i].name, width - 10, y + 5);
	}

	// Draw events and spans
	ctx.strokeStyle = "#000";
	var iy = 0;
	var drawCount = 0;
	for(var i = 0; i < data.length; i++){
		if("tag" in data[i] && data[i].tag in tagset && !tagset[data[i].tag].visible)
			continue;
		var y = iy * 20 - vertOffset;
		if(y < 0){
			iy++;
			continue;
		}
		if(height <= y)
			break;
		if(("timeBegin" in data[i]) && ("timeEnd" in data[i])){
			var x0 = (data[i].timeBegin - timeOffset) * timeScale;
			var x1 = (data[i].timeEnd - timeOffset) * timeScale;
			if(x1 < 0){
				rangeOutPast(i, y);
			}
			else if(width < x0){
				rangeOutFuture(i, y);
			}
			else{
				if(data[i].tag in tagset){
					ctx.fillStyle = colorPalette[tagset[data[i].tag].colorIdx];
					ctx.beginPath();
					ctx.fillRect(x0, y + 10, x1 - x0, 8);
				}
				ctx.beginPath();
				ctx.moveTo(x0, y);
				ctx.lineTo(x0, y + 18);
				ctx.moveTo(x1, y);
				ctx.lineTo(x1, y + 18);
				ctx.moveTo(x0, y + 10);
				ctx.lineTo(x1, y + 10);
				ctx.stroke();
				ctx.fillStyle = "#000";
				ctx.textAlign = "center";
				ctx.fillText(data[i].name, (x0 + x1) / 2, y + 5);
			}
		}
		else{
			var x = (data[i].time - timeOffset) * timeScale;
			if(x < 0){
				rangeOutPast(i, y);
			}
			else if(width < x){
				rangeOutFuture(i, y);
			}
			else{
				ctx.beginPath();
				ctx.moveTo(x, y + 10);
				ctx.lineTo(x + 5, y + 17);
				ctx.lineTo(x - 5, y + 17);
				ctx.closePath();
				ctx.stroke();
				if(data[i].tag in tagset){
					ctx.fillStyle = colorPalette[tagset[data[i].tag].colorIdx];
					ctx.fill();
				}
				ctx.fillStyle = "#000";
				ctx.textAlign = "center";
				ctx.fillText(data[i].name, x, y + 5);
			}
		}
		iy++;
		drawCount++;
	}
	drawCountElement.innerHTML = drawCount;
}
})();
