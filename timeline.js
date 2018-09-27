var Timeline = new (function(){
'use strict'
var canvas;
var container;
var canvasXAxis;
var width;
var height;
var xaxisHeight;
var tags;

var gridContainer;
var chartContainer;

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

function clearElems(){
	while(chartContainer.firstChild){
		chartContainer.removeChild(chartContainer.firstChild);
	}

	// We need to forget about deleted children to re-add them
	for(var i in data){
		// Pre-allocate timeline chart and text even if it's out of range,
		// in order to make the z-order consistent, i.e. text should be always
		// on top of the chart.  Yes, I know it's ugly.
		var elem;
		if(("timeBegin" in data[i]) && ("timeEnd" in data[i])){
			elem = document.createElementNS('http://www.w3.org/2000/svg','rect');
		}
		else{
			elem = document.createElementNS('http://www.w3.org/2000/svg','polygon');
		}
		data[i].elem = elem;
		var textElem = document.createElementNS('http://www.w3.org/2000/svg','text');
		data[i].textElem = textElem;
		chartContainer.appendChild(elem);
		chartContainer.appendChild(textElem);

		// Past and future indicators are created on demand.
		delete data[i].pastElem;
		delete data[i].futureElem;
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
	if (!canvas) {
		return false;
	}
	container = document.getElementById("container");
	if(!container){
		return false;
	}
	canvasXAxis = document.getElementById("xaxis");
	if(!canvasXAxis || !canvasXAxis.getContext){
		return false;
	}
	canvas.style.height = itemHeight * data.length + 'px';
	canvas.setAttribute('height', itemHeight * data.length + 'px');

	gridContainer = document.createElementNS('http://www.w3.org/2000/svg','g');
	canvas.appendChild(gridContainer);
	chartContainer = document.createElementNS('http://www.w3.org/2000/svg','g');
	canvas.appendChild(chartContainer);

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
			clearElems();
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

	clearElems();
	draw();
};

function draw() {
	var ctx2 = canvasXAxis.getContext('2d');

	var drawCounts = {}, totalCounts = {};
	for(var i = 0; i < 2; i++){
		var counts = [drawCounts, totalCounts][i];
		counts.edge = counts.vertex = counts.vehicle = counts.signal = 0;
	}

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

	// Clear old vertical lines
	while(gridContainer.firstElementChild)
		gridContainer.removeChild(gridContainer.firstElementChild);

	// Draw vertical lines with equal spacing
	for(var i = 0; i < 100; i++){
		var x = (i * timeInterval + timeStart - timeOffset) * timeScale;
		var line = document.createElementNS('http://www.w3.org/2000/svg','line');
		line.x1.baseVal.value = x;
		line.y1.baseVal.value = 0;
		line.x2.baseVal.value = x;
		line.y2.baseVal.value = contentHeight;
		line.setAttribute('stroke', 'black');
		line.style.stroke = "#7f7f7f";
		line.style.strokeDasharray = i % 5 === 0 ? "" : "4";
		gridContainer.appendChild(line);
		if(i % 5 === 0){
			ctx2.fillText(timeStart + i * timeInterval, x, 0);
		}
	}

	function addText(i, x, y, align){
		var add = !data[i].textElem;
		var text = data[i].textElem || document.createElementNS('http://www.w3.org/2000/svg','text');
		align = align || 'middle';
		text.style.font = "bold 12px Helvetica";
		text.setAttribute('text-anchor', align);
		text.setAttribute('x', x);
		text.setAttribute('y', y + 12);
		text.innerHTML = data[i].name;
		if(add)
			chartContainer.appendChild(data[i].textElem = text);
	}

	function rangeOutPast(i, y){
		var add = !data[i].pastElem;
		var elem = data[i].pastElem || document.createElementNS('http://www.w3.org/2000/svg','polygon');
		elem.setAttribute('points', '0 10 7 5 7 15');
		elem.setAttribute('stroke', 'black');
		elem.setAttribute('fill', colorPalette[tagset[data[i].tag].colorIdx]);
		elem.setAttribute('transform', 'translate(0 ' + y + ')');
		elem.style.display = 'block';
		if(add){
			chartContainer.appendChild(data[i].pastElem = elem);
		}
		addText(i, 10, y, 'start');
		if(data[i].elem)
			data[i].elem.style.display = 'none';
		if(data[i].futureElem)
			data[i].futureElem.style.display = 'none';
	}

	function rangeOutFuture(i, y){
		var add = !data[i].futureElem;
		var elem = data[i].futureElem || document.createElementNS('http://www.w3.org/2000/svg','polygon');
		elem.setAttribute('points', '0 10 -7 5 -7 15');
		elem.setAttribute('stroke', 'black');
		elem.setAttribute('fill', colorPalette[tagset[data[i].tag].colorIdx]);
		elem.setAttribute('transform', 'translate(' + width + ' ' + y + ')');
		elem.style.display = 'block';
		if(add){
			chartContainer.appendChild(data[i].futureElem = elem);
		}
		addText(i, width - 10, y, 'end');
		if(data[i].elem)
			data[i].elem.style.display = 'none';
		if(data[i].pastElem)
			data[i].pastElem.style.display = 'none';
	}

	// Draw events and spans
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
				var add = !data[i].elem;
				var bar = data[i].elem || document.createElementNS('http://www.w3.org/2000/svg','rect');
				bar.x.baseVal.value = x0;
				bar.y.baseVal.value = y;
				bar.width.baseVal.value = x1 - x0;
				bar.height.baseVal.value = 18;
				bar.setAttribute('stroke', 'black');
				bar.setAttribute('fill', colorPalette[tagset[data[i].tag].colorIdx]);
				if(add){
					chartContainer.appendChild(data[i].elem = bar);
				}
				else{
					data[i].elem.style.display = 'block';
				}
				addText(i, (x0 + x1) / 2, y);
				if(data[i].pastElem)
					data[i].pastElem.style.display = 'none';
				if(data[i].futureElem)
					data[i].futureElem.style.display = 'none';
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
				var add = !data[i].elem;
				var elem = data[i].elem || document.createElementNS('http://www.w3.org/2000/svg','polygon');
				elem.setAttribute('points', '0 10 5 17 -5 17');
				elem.setAttribute('stroke', 'black');
				elem.setAttribute('fill', colorPalette[tagset[data[i].tag].colorIdx]);
				elem.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
				if(add){
					chartContainer.appendChild(data[i].elem = elem);
				}
				else{
					data[i].elem.style.display = 'block';
				}
				addText(i, x, y);
				if(data[i].pastElem)
					data[i].pastElem.style.display = 'none';
				if(data[i].futureElem)
					data[i].futureElem.style.display = 'none';
			}
		}
		iy++;
		drawCount++;
	}
	drawCountElement.innerHTML = drawCount;
}
})();
