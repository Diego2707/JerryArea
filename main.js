var stage;
var gameWorld;
var size = {width: 700, height: 300};
var viewPort = {x:0, y:0, width:32, height:32};
var viewWorld;
var background;
var map;
var character;
var grounded = true;
var verticalVelocity = 0;

var imageList = [];

var waterSheet;

function load(){	
	var manifest = [
		{src:"./Images/Dirt.png",       id:"dirt"},
		{src:"./Images/Grass.png",      id:"grass"},
		{src:"./Images/Stone.png",      id:"stone"},
		{src:"./Images/Sand.png",       id:"sand"},
		{src:"./Images/Gravel.png",     id:"gravel"},
		{src:"./Images/Coal.png",       id:"coal"},
		{src:"./Images/Iron.png",       id:"iron"},
		{src:"./Images/Gold.png",       id:"gold"},
		{src:"./Images/Diamond.png",    id:"diamond"},
		{src:"./Images/Water.png",      id:"water"},
		{src:"./Images/background.png", id:"background"},
		{src:"./Images/Character.png",  id:"character"},
	];
	
	var loader = new createjs.LoadQueue(false);
	loader.on("complete", init, this);
	loader.on("fileload", handleFileLoad, this)
	loader.loadManifest(manifest);
}

function handleFileLoad(f){
	if (f.item.type == "image"){
		imageList[f.item.id] = f.result;
	}
}

function init(){
    alert("loaded");
    gameWorld = new createjs.Container();
	viewWorld = new createjs.Container();
	background = new createjs.Container();
    stage = new createjs.Stage("canvas");
	
	waterSheet = new createjs.SpriteSheet(generateSpriteSheet([imageList["water"]], 16, 16, 4, {exist:[0,2]}));
    
	// Background image test
	var img = new createjs.Bitmap(imageList["background"]);
	background.addChild(img);
	
    generateWorld();
	alert("The world is built");
	
	var characterSheet = new createjs.SpriteSheet(generateSpriteSheet([imageList["character"]], 28, 42, 6, {exist:[0]}));
	character = new createjs.Container();
	character.addChild(new createjs.Sprite(characterSheet, "exist"));
	character.x += 242;
	character.y += 235;
	gameWorld.addChild(character);
	
	viewWorld.addChild(background);
	viewWorld.addChild(gameWorld);
    
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", function(event){tick(); stage.update(event)});
    
    stage.addChild(viewWorld);
	stage.update();
    
	var map = {};
	onkeydown = onkeyup = function(e){
		e = e || event;
		map[e.keyCode] = e.type == 'keydown';
		/* insert conditional here */
		if (map[32]){
			// Space
			grounded = false;
			verticalVelocity = -10;
		}
		if (map[65]){
			// A
			character.x -= 10;
			viewWorld.x += 10;
		} else if (map[68]){
			// D 
			character.x += 10;
			viewWorld.x -= 10;
		}
	}
    this.document.onkeydown = onkeydown;
	this.document.onkeyup = onkeyup;
}

function tick(){
	physicsCheck();
	updateCamera();
	draw();
}

function physicsCheck(){
	if (!grounded){
		verticalVelocity++;
	}
	if (verticalVelocity !== 0){
		character.y += verticalVelocity;
		viewWorld.y -= verticalVelocity;
	}
	
	if (verticalVelocity > 30){
		verticalVelocity = 30;
	} else if (verticalVelocity < -30){
		verticalVelocity = -30;
	}
}

function updateCamera(){
	viewPort.x = character.x + 14 - (viewPort.width * 16 / 2);
	viewPort.y = character.y + 21 - (viewPort.height * 16 / 2);
}

function draw(){
	var xstart = Math.floor(viewPort.x / 16) - 1;
	var ystart = Math.floor(viewPort.y / 16) - 1;
	var xend = viewPort.width + xstart + 5;
	var yend = viewPort.height + ystart + 5;
	if (xstart < 0){
		xstart = 0;
	}
	if (ystart < 0){
		ystart = 0;
	}
	if (xend > size.width){
		xend = size.width;
	}
	if (yend > size.height){
		yend = size.height;
	}
	
	for (var i = xstart; i < xend; i++){
		for (var j = ystart; j < yend; j++){
			if (map[i][j] != undefined){
				var block = map[i][j];
				
				if ((block.x + 16 > viewPort.x && block.x < viewPort.width * 16 + viewPort.x) && (block.y + 16 > viewPort.y && block.y < viewPort.height * 16 + viewPort.y)){
					if (block.numChildren > 0 && block.alpha === 0){
						if (block.getChildAt(0).spriteSheet === waterSheet){
							map[i][j].alpha = 0.75;
						} else{
							map[i][j].alpha = 1;
						}	
					}
				} else{
					map[i][j].alpha = 0;
				}
			}
		}
	}
}

function generateSpriteSheet(source, w, h, fps, animation){
    var data = {
        images: source,
        frames: {width:w, height:h},
        framerate: fps,
        animations: animation
    }
    return data;
}

function randomNumber(min, max){
	if (Array.isArray(min)){
		var a = min;
		min = a[0];
		max = a[1];
	}
	
	min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}