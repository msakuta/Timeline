var Timeline = new (function(){
'use strict'
var body;
var canvas;
var container;
var canvasXAxis;
var width;
var height;
var xaxisHeight;
var tags;
var toolTip;

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
	{timeBegin: -500, timeEnd: -27, name: "Roman Republic", tag: "Europe",
		desc: "The Roman Republic was the era of classical Roman civilization beginning with the overthrow of the Roman Kingdom, traditionally dated to 509 BC, and ending in 27 BC with the establishment of the Roman Empire. It was during this period that Rome's control expanded from the city's immediate surroundings to hegemony over the entire Mediterranean world.<br><a href='https://en.wikipedia.org/wiki/Roman_Republic'><i>From Wikipedia</i></a>"},
	{timeBegin: -27, timeEnd: 395, name: "Roman Empire", tag: "Europe",
		desc: "The Roman Empire was the post-Roman Republic period of the ancient Roman civilization, with a government headed by emperors and large territorial holdings around the Mediterranean Sea in Europe, Africa and Asia. The city of Rome was the largest city in the world c. 100 BC – c. AD 400, with Constantinople (New Rome) becoming the largest around AD 500, and the Empire's population grew to an estimated 50 to 90 million inhabitants (roughly 20% of the world's population at the time). <br><a href='https://en.wikipedia.org/wiki/Roman_Empire'><i>From Wikipedia</i></a>"},
	{timeBegin: 395, timeEnd: 1453, name: "Western Roman Empire", tag: "Europe",
		desc: "The Western Roman Empire refers to the western provinces of the Roman Empire at any time during which they were administered by a separate independent Imperial court; in particular, this term is used to describe the period from 395 to 476, where there were separate coequal courts dividing the governance of the empire in the Western and the Eastern provinces, with a distinct imperial succession in the separate courts.<br><a href='https://en.wikipedia.org/wiki/Western_Roman_Empire'><i>From Wikipedia</i></a>"},
	{timeBegin: -570, timeEnd: -495, name: "Pythagoras", tag: "Philosophy",
		desc: "Pythagoras of Samos (c. 570 – c. 495 BC) was an Ionian Greek philosopher and the eponymous founder of the Pythagoreanism movement. His political and religious teachings were well known in Magna Graecia and influenced the philosophies of Plato, Aristotle, and, through them, Western philosophy. Knowledge of his life is clouded by legend, but he appears to have been the son of Mnesarchus, a seal engraver on the island of Samos.<br><a href='https://en.wikipedia.org/wiki/Pythagoras'><i>From Wikipedia</i></a>"},
	{timeBegin: -470, timeEnd: -399, name: "Socrates", tag: "Philosophy",
		desc: "Socrates was a classical Greek (Athenian) philosopher credited as one of the founders of Western philosophy, and as being the first moral philosopher, of the Western ethical tradition of thought. An enigmatic figure, he made no writings, and is known chiefly through the accounts of classical writers writing after his lifetime, particularly his students Plato and Xenophon.<br><a href='https://en.wikipedia.org/wiki/Socrates'><i>From Wikipedia</i></a>"},
	{timeBegin: -423, timeEnd: -348, name: "Plato", tag: "Philosophy",
		desc: "Plato (428/427 or 424/423 – 348/347 BC) was a philosopher in Classical Greece and the founder of the Academy in Athens, the first institution of higher learning in the Western world. He is widely considered the pivotal figure in the development of Western philosophy. Unlike nearly all of his philosophical contemporaries, Plato's entire work is believed to have survived intact for over 2,400 years.<br><a href='https://en.wikipedia.org/wiki/Plato'><i>From Wikipedia</i></a>"},
	{timeBegin: -384, timeEnd: -322, name: "Aristotle", tag: "Philosophy",
		desc: "Aristotle (384–322 BC) was an ancient Greek philosopher and scientist born in the city of Stagira, Chalkidiki, in the north of Classical Greece. Along with Plato, Aristotle is considered the \"Father of Western Philosophy\", which inherited almost its entire lexicon from his teachings, including problems and methods of inquiry, so influencing almost all forms of knowledge.<br><a href='https://en.wikipedia.org/wiki/Aristotle'><i>From Wikipedia</i></a>"},
	{timeBegin: -287, timeEnd: -212, name: "Archimedes", tag: "Philosophy",
		desc: "Archimedes of Syracuse (287 – c. 212 BC) was a Greek mathematician, physicist, engineer, inventor, and astronomer. Although few details of his life are known, he is regarded as one of the leading scientists in classical antiquity. Generally considered the greatest mathematician of antiquity and one of the greatest of all time, Archimedes anticipated modern calculus and analysis by applying concepts of infinitesimals and the method of exhaustion to derive and rigorously prove a range of geometrical theorems, including the area of a circle, the surface area and volume of a sphere, and the area under a parabola.<br><a href='https://en.wikipedia.org/wiki/Archimedes'><i>From Wikipedia</i></a>"},
	{timeBegin: 1596, timeEnd: 1650, name: "René Descartes", tag: "Philosophy",
		desc: "René Descartes (31 March 1596 – 11 February 1650) was a French philosopher, mathematician, and scientist. A native of the Kingdom of France, he spent about 20 years (1629–49) of his life in the Dutch Republic after serving for a while in the Dutch States Army of Maurice of Nassau, Prince of Orange and the Stadtholder of the United Provinces. He is generally considered one of the most notable intellectual representatives of the Dutch Golden Age.<br><a href='https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes'><i>From Wikipedia</i></a>"},
	{timeBegin: 1623, timeEnd: 1662, name: "Blaise Pascal", tag: "Philosophy",
		desc: "Blaise Pascal (19 June 1623 – 19 August 1662) was a French mathematician, physicist, inventor, writer and Catholic theologian. He was a child prodigy who was educated by his father, a tax collector in Rouen. Pascal's earliest work was in the natural and applied sciences where he made important contributions to the study of fluids, and clarified the concepts of pressure and vacuum by generalising the work of Evangelista Torricelli. Pascal also wrote in defence of the scientific method.<br><a href='https://en.wikipedia.org/wiki/Blaise_Pascal'><i>From Wikipedia</i></a>"},
	{timeBegin: 1844, timeEnd: 1900, name: "Friedrich Wilhelm Nietzsche", tag: "Philosophy",
		desc: "Friedrich Wilhelm Nietzsche (15 October 1844 – 25 August 1900) was a German philosopher, cultural critic, composer, poet, philologist, and a Latin and Greek scholar whose work has exerted a profound influence on Western philosophy and modern intellectual history. He began his career as a classical philologist before turning to philosophy. He became the youngest ever to hold the Chair of Classical Philology at the University of Basel in 1869 at the age of 24. Nietzsche resigned in 1879 due to health problems that plagued him most of his life; he completed much of his core writing in the following decade.<br><a href='https://en.wikipedia.org/wiki/Friedrich_Nietzsche'><i>From Wikipedia</i></a>"},
	{timeBegin: 1723, timeEnd: 1790, name: "Adam Smith", tag: "Economy",
		desc: "Adam Smith FRSA (16 June [O.S. 5 June] 1723[1] – 17 July 1790) was a Scottish economist, philosopher and author as well as a moral philosopher, a pioneer of political economy and a key figure during the Scottish Enlightenment. Smith is best known for two classic works, An Inquiry into the Nature and Causes of the Wealth of Nations (1776) and The Theory of Moral Sentiments (1759). The former, usually abbreviated as The Wealth of Nations, is considered his magnum opus and the first modern work of economics.<br><a href='https://en.wikipedia.org/wiki/Adam_Smith'><i>From Wikipedia</i></a>"},
	{timeBegin: 1818, timeEnd: 1883, name: "Karl Marx", tag: "Economy",
		desc: "Karl Marx (5 May 1818 – 14 March 1883) was a German philosopher, economist, historian, political theorist, sociologist, journalist and revolutionary socialist.<br><a href='https://en.wikipedia.org/wiki/Karl_Marx'><i>From Wikipedia</i></a>"},
	{timeBegin: 1820, timeEnd: 1895, name: "Friedrich Engels", tag: "Economy",
		desc: "Friedrich Engels (28 November 1820 – 5 August 1895) was a German philosopher, communist, social scientist, journalist and businessman. His father was an owner of a large textile factory in Salford, England.<br><a href='https://en.wikipedia.org/wiki/Friedrich_Engels'><i>From Wikipedia</i></a>"},
	{time: 1848, name: "The Communist Manifesto", tag: "Economy",
		desc: "The Communist Manifesto (originally Manifesto of the Communist Party) is an 1848 political pamphlet by the German philosophers Karl Marx and Friedrich Engels. Commissioned by the Communist League and originally published in London (in German as Manifest der Kommunistischen Partei) just as the revolutions of 1848 began to erupt, the Manifesto was later recognised as one of the world's most influential political documents. It presents an analytical approach to the class struggle (historical and then-present) and the conflicts of capitalism and the capitalist mode of production, rather than a prediction of communism's potential future forms.<br><a href='https://en.wikipedia.org/wiki/The_Communist_Manifesto'><i>From Wikipedia</i></a>"},
	{time: 1867, name: "Das Kapital", tag: "Economy",
		desc: "Das Kapital, also known as Capital. Critique of Political Economy (1867–1883) by Karl Marx is a foundational theoretical text in materialist philosophy, economics and politics. Marx aimed to reveal the economic patterns underpinning the capitalist mode of production, in contrast to classical political economists such as Adam Smith, Jean-Baptiste Say, David Ricardo and John Stuart Mill. Marx did not live to publish the planned second and third parts, but they were both completed from his notes and published after his death by his colleague Friedrich Engels. Das Kapital is the most cited book in the social sciences published before 1950.<br><a href='https://en.wikipedia.org/wiki/Das_Kapital'><i>From Wikipedia</i></a>"},
	{timeBegin: 1856, timeEnd: 1939, name: "Sigmund Freud", tag: "Psychology",
		desc: "Sigmund Freud (6 May 1856 – 23 September 1939) was an Austrian neurologist and the founder of psychoanalysis, a clinical method for treating psychopathology through dialogue between a patient and a psychoanalyst.<br><a href='https://en.wikipedia.org/wiki/Sigmund_Freud'><i>From Wikipedia</i></a>"},
	{timeBegin: 1875, timeEnd: 1961, name: "Carl Gustav Jung", tag: "Psychology",
		desc: "Carl Gustav Jung (26 July 1875 – 6 June 1961) was a Swiss psychiatrist and psychoanalyst who founded analytical psychology.	Jung’s work was influential in the fields of psychiatry, anthropology, archaeology, literature, philosophy, and religious studies. Jung worked as a research scientist at the famous Burghölzli hospital, under Eugen Bleuler. During this time, he came to the attention of the Viennese founder of psychoanalysis, Sigmund Freud. The two men conducted a lengthy correspondence and collaborated, for a while, on a joint vision of human psychology.<br><a href='https://en.wikipedia.org/wiki/Carl_Jung'><i>From Wikipedia</i></a>"},
	{timeBegin: 1564, timeEnd: 1642, name: "Galileo Galilei", tag: "Physics",
		desc: "Galileo Galilei (15 February 1564 – 8 January 1642) was an Italian polymath. Known for his work as astronomer, physicist, engineer, philosopher, and mathematician, Galileo has been called the \"father of observational astronomy\",the \"father of modern physics\", the \"father of the scientific method\", and even the \"father of science\".<br><a href='https://en.wikipedia.org/wiki/Galileo_Galilei'><i>From Wikipedia</i></a>"},
	{timeBegin: 1642, timeEnd: 1726, name: "Issac Newton", tag: "Physics",
		desc: "Sir Isaac Newton PRS FRS (25 December 1642 – 20 March 1726/27) was an English mathematician, astronomer, theologian, author and physicist (described in his own day as a \"natural philosopher\") who is widely recognised as one of the most influential scientists of all time, and a key figure in the scientific revolution. His book Philosophiæ Naturalis Principia Mathematica (\"Mathematical Principles of Natural Philosophy\"), first published in 1687, laid the foundations of classical mechanics. Newton also made seminal contributions to optics, and shares credit with Gottfried Wilhelm Leibniz for developing the infinitesimal calculus.<br><a href='https://en.wikipedia.org/wiki/Isaac_Newton'><i>From Wikipedia</i></a>"},
	{timeBegin: 1646, timeEnd: 1716, name: "Gottfried Wilhelm Leibniz", tag: "Physics",
		desc: "Gottfried Wilhelm (von) Leibniz (sometimes spelled Leibnitz) (1 July 1646 [O.S. 21 June] – 14 November 1716) was a prominent German polymath and philosopher in the history of mathematics and the history of philosophy. His most notable accomplishment was conceiving the ideas of differential and integral calculus, independently of Isaac Newton's contemporaneous developments.<br><a href='https://en.wikipedia.org/wiki/Gottfried_Wilhelm_Leibniz'><i>From Wikipedia</i></a>"},
	{time: 1905, name: "Special Relativity", tag: "Physics",
		desc: "In physics, special relativity (SR, also known as the special theory of relativity or STR) is the generally accepted and experimentally well-confirmed physical theory regarding the relationship between space and time. In Albert Einstein's original pedagogical treatment, it is based on two postulates:" +
			"<ul><li>The laws of physics are invariant (i.e., identical) in all inertial systems (i.e., non-accelerating frames of reference)." +
			"<li>The speed of light in a vacuum is the same for all observers, regardless of the motion of the light source.</ul>" +
			"<br><a href='https://en.wikipedia.org/wiki/Special_relativity'><i>From Wikipedia</i></a>"},
	{time: 1915, name: "General Relativity", tag: "Physics",
		desc: "General relativity (GR, also known as the general theory of relativity or GTR) is the geometric theory of gravitation published by Albert Einstein in 1915 and the current description of gravitation in modern physics. General relativity generalizes special relativity and Newton's law of universal gravitation, providing a unified description of gravity as a geometric property of space and time, or spacetime. In particular, the curvature of spacetime is directly related to the energy and momentum of whatever matter and radiation are present. The relation is specified by the Einstein field equations, a system of partial differential equations.<br><a href='https://en.wikipedia.org/wiki/General_relativity'><i>From Wikipedia</i></a>"},
	{timeBegin: 1831, timeEnd: 1871, name: "James Clerk Maxwell", tag: "Physics",
		desc: "James Clerk Maxwell FRS FRSE (13 June 1831 – 5 November 1879) was a Scottish scientist in the field of mathematical physics. His most notable achievement was to formulate the classical theory of electromagnetic radiation, bringing together for the first time electricity, magnetism, and light as different manifestations of the same phenomenon. Maxwell's equations for electromagnetism have been called the \"second great unification in physics\" after the first one realised by Isaac Newton.<br><a href='https://en.wikipedia.org/wiki/James_Clerk_Maxwell'><i>From Wikipedia</i></a>"},
	{timeBegin: 1879, timeEnd: 1955, name: "Albert Einstein", tag: "Physics",
		desc: "Albert Einstein (14 March 1879 – 18 April 1955) was a German-born theoretical physicist who developed the theory of relativity, one of the two pillars of modern physics (alongside quantum mechanics). His work is also known for its influence on the philosophy of science. He is best known to the general public for his mass–energy equivalence formula E = mc2, which has been dubbed \"the world's most famous equation\". He received the 1921 Nobel Prize in Physics \"for his services to theoretical physics, and especially for his discovery of the law of the photoelectric effect\", a pivotal step in the development of quantum theory.<br><a href='https://en.wikipedia.org/wiki/Albert_Einstein'><i>From Wikipedia</i></a>"},
	{timeBegin: 1898, timeEnd: 1964, name: "Leo Szilard", tag: "Physics",
		desc: "Leo Szilard (February 11, 1898 – May 30, 1964) was a Hungarian-German-American physicist and inventor. He conceived the nuclear chain reaction in 1933, patented the idea of a nuclear reactor with Enrico Fermi in 1934, and in late 1939 wrote the letter for Albert Einstein's signature that resulted in the Manhattan Project that built the atomic bomb.<br><a href='https://en.wikipedia.org/wiki/Leo_Szilard'><i>From Wikipedia</i></a>"},
	{time: 1939, name: "Einstein-Szilard letter", tag: "Physics",
		desc: "The Einstein–Szilárd letter was a letter written by Leó Szilárd and signed by Albert Einstein that was sent to the United States President Franklin D. Roosevelt on August 2, 1939. Written by Szilárd in consultation with fellow Hungarian physicists Edward Teller and Eugene Wigner, the letter warned that Germany might develop atomic bombs and suggested that the United States should start its own nuclear program. It prompted action by Roosevelt, which eventually resulted in the Manhattan Project developing the first atomic bombs.<br><a href='https://en.wikipedia.org/wiki/Einstein%E2%80%93Szil%C3%A1rd_letter'><i>From Wikipedia</i></a>"},
	{time: 1945, name: "Manhattan Project", tag: "Physics",
		desc: "The Manhattan Project was a research and development undertaking during World War II that produced the first nuclear weapons. It was led by the United States with the support of the United Kingdom and Canada. From 1942 to 1946, the project was under the direction of Major General Leslie Groves of the U.S. Army Corps of Engineers. Nuclear physicist Robert Oppenheimer was the director of the Los Alamos Laboratory that designed the actual bombs.<br><a href='https://en.wikipedia.org/wiki/Manhattan_Project'><i>From Wikipedia</i></a>"},
	{timeBegin: 1912, timeEnd: 1954, name: "Alan Mathieson Turing", tag: "Computer Science",
		desc: "Alan Mathison Turing OBE FRS (23 June 1912 – 7 June 1954) was an English computer scientist, mathematician, logician, cryptanalyst, philosopher, and theoretical biologist. Turing was highly influential in the development of theoretical computer science, providing a formalisation of the concepts of algorithm and computation with the Turing machine, which can be considered a model of a general purpose computer. Turing is widely considered to be the father of theoretical computer science and artificial intelligence. However, he was also a tragic figure: a hero who was never fully recognized in his home country during his lifetime due to his homosexuality (which was then considered a crime in the UK).<br><a href='https://en.wikipedia.org/wiki/Alan_Turing'><i>From Wikipedia</i></a>"},
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
		elem.addEventListener('mouseenter', function(e){
			var r = this.getBoundingClientRect();
			var cr = body.getBoundingClientRect();
			var left = r.left - cr.left;
			if(left < 0)
				left = 0;
			else if(width < left)
				left = width;
			toolTip.style.left = left + 'px';
			var top = r.bottom - cr.top - 1;
			if(top < 0)
				top = 0;
			toolTip.style.top = top + 'px';
			toolTip.style.display = 'block';
			var desc = data[this.index].desc || "";
			if(0 < desc.length)
				desc = '<br>' + desc;
			toolTip.innerHTML = '<b>' + data[this.index].name + '</b>' + desc;
		});
		elem.addEventListener('mouseleave', function(e){
			var r = toolTip.getBoundingClientRect();
			var x = e.clientX - r.left;
			var y = e.clientY - r.top;
			if(0 <= x && x < r.width && 0 <= y && y < r.height);
			else
				toolTip.style.display = 'none';
		})
		elem.index = i;
		data[i].elem = elem;
		var textElem = document.createElementNS('http://www.w3.org/2000/svg','text');
		textElem.setAttribute('class', 'noselect');
		textElem.setAttribute('pointer-events', 'none');
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
	var bodyElems = document.getElementsByTagName('body');
	if(!bodyElems || bodyElems.length === 0){
		return false;
	}
	body = bodyElems[0];
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

	toolTip = document.createElement('dim');
	toolTip.setAttribute('id', 'tooltip');
	//toolTip.setAttribute('class', 'noselect');
	toolTip.innerHTML = 'hello there';
	toolTip.style.zIndex = 100; // Usually comes on top of all the other elements
	toolTip.style.display = 'none'; // Initially invisible
	toolTip.addEventListener('mouseleave', function(e){
		toolTip.style.display = 'none';
	});
	body.appendChild(toolTip);

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
				elem.setAttribute('points', '0 10 7 18 -7 18');
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
