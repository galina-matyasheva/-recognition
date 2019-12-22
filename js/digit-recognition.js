
// глобальные переменные

let model;

let canvasWidth           	= 150;
let canvasHeight 			= 150;
let canvasStrokeStyle		= "white";
let canvasLineJoin			= "round";
let canvasLineWidth       	= 10;
let canvasBackgroundColor 	= "black";
let canvasId              	= "canvas";

let clickX = [];
let clickY = [];
let clickD = [];
let drawing;

// Холст для рисования цифры

let canvasBox = document.getElementById('canvas_box');
let canvas    = document.createElement("canvas");

canvas.setAttribute("width", canvasWidth);
canvas.setAttribute("height", canvasHeight);
canvas.setAttribute("id", canvasId);
canvas.style.backgroundColor = canvasBackgroundColor;
canvasBox.appendChild(canvas);
if(typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas);
}

ctx = canvas.getContext("2d");


$("#canvas").mousedown(function(e) {
	let rect = canvas.getBoundingClientRect();
	let mouseX = e.clientX- rect.left;;
	let mouseY = e.clientY- rect.top;
	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});


canvas.addEventListener("touchstart", function (e) {
	if (e.target === canvas) {
    	e.preventDefault();
  	}

	let rect = canvas.getBoundingClientRect();
	let touch = e.touches[0];

	let mouseX = touch.clientX - rect.left;
	let mouseY = touch.clientY - rect.top;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();

}, false);


$("#canvas").mousemove(function(e) {
	if(drawing) {
		let rect = canvas.getBoundingClientRect();
		let mouseX = e.clientX- rect.left;;
		let mouseY = e.clientY- rect.top;
		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
});


canvas.addEventListener("touchmove", function (e) {
	if (e.target === canvas) {
    	e.preventDefault();
  	}
	if(drawing) {
		let rect = canvas.getBoundingClientRect();
		let touch = e.touches[0];

		let mouseX = touch.clientX - rect.left;
		let mouseY = touch.clientY - rect.top;

		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
}, false);


$("#canvas").mouseup(function(e) {
	drawing = false;
});


canvas.addEventListener("touchend", function (e) {
	if (e.target === canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);



$("#canvas").mouseleave(function(e) {
	drawing = false;
});


canvas.addEventListener("touchleave", function (e) {
	if (e.target === canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);


function addUserGesture(x, y, dragging) {
	clickX.push(x);
	clickY.push(y);
	clickD.push(dragging);
}


function drawOnCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = canvasStrokeStyle;
	ctx.lineJoin    = canvasLineJoin;
	ctx.lineWidth   = canvasLineWidth;

	for (let i = 0; i < clickX.length; i++) {
		ctx.beginPath();
		if(clickD[i] && i) {
			ctx.moveTo(clickX[i-1], clickY[i-1]);
		} else {
			ctx.moveTo(clickX[i]-1, clickY[i]);
		}
		ctx.lineTo(clickX[i], clickY[i]);
		ctx.closePath();
		ctx.stroke();
	}
}


$("#clear-button").click(async function () {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	clickX = [];
	clickY = [];
	clickD = [];
	$(".prediction-text").empty();
	$("#result_box").addClass('d-none');
});


// загрузчик для модели cnn

async function loadModel() {
  console.log("model loading..");

  // очистить переменную модели
  model = undefined;
  
  // загрузить модель, используя HTTPS-запрос (где сохранены файлы модели)
  model = await tf.loadLayersModel("models/model.json");
  
  console.log("model loaded..");
}

loadModel();


// предварительно обработать холст

function preprocessCanvas(image) {
	// изменить размер входящей картинки к (1, 28, 28)
	let tensor = tf.browser.fromPixels(image)
		.resizeNearestNeighbor([28, 28])
		.mean(2)
		.expandDims(2)
		.expandDims()
		.toFloat();
	console.log(tensor.shape);
	return tensor.div(255.0);
}


// функция predict

$("#predict-button").click(async function () {

	// холст предварительной обработки
	let tensor = preprocessCanvas(canvas);

	// делать прогнозы на предварительно обработанном тензоре изображения
	let predictions = await model.predict(tensor).data();

	// получить результаты прогнозирования модели
	let results = Array.from(predictions);

	// отобразить результаты
	$("#result_box").removeClass('d-none');
	displayLabel(results);

	console.log(results);
});



// отобразить результаты
function displayLabel(data) {
	let max = data[0];
    let maxIndex = 0;

    for (let i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
	$(".prediction-text").html("Оцениваем этот рисунок как <b>"+maxIndex+"</b> с вероятностью <b>"+Math.trunc( max*100 )+"%</b> ")
}

