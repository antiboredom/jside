/*
 * @name Array Objects
 * @description Demonstrates the syntax for creating an array of custom objects.
 */
var unit = 40;
var count;
var mods = [];

function setup() {
  createCanvas(720, 360);
  noStroke();
  var wideCount = width / unit;
  var highCount = height / unit;
  count = wideCount * highCount;

  var index = 0;
  for (var y = 0; y < highCount; y++) {
    for (var x = 0; x < wideCount; x++) {
      mods[index++] = new Module(x*unit, y*unit, unit/2, unit/2, 
        random(0.05, 0.8), unit);
    }
  }
}

function draw() {
  background(0);
  for (var i = 0; i < count; i++) {
    mods[i].update();
    mods[i].draw();
  }
}


function Module(_xOff, _yOff, _x, _y, _speed, _unit) {
  this.xOff = _xOff;
  this.yOff = _yOff;
  this.x = _x;
  this.y = _y;
  this.speed = _speed;
  this.unit = _unit;
  this.xDir = 1;
  this.yDir = 1;
}

// Custom method for updating the variables
Module.prototype.update = function() {
  this.x = this.x + (this.speed * this.xDir);
  if (this.x >= this.unit || this.x <= 0) {
    this.xDir *= -1;
    this.x = this.x + (1 * this.xDir);
    this.y = this.y + (1 * this.yDir);
  }
  if (this.y >= this.unit || this.y <= 0) {
    this.yDir *= -1;
    this.y = this.y + (1 * this.yDir);
  }
}

// Custom method for drawing the object
Module.prototype.draw = function() {
  fill(255);
  ellipse(this.xOff + this.x, this.yOff + this.y, 6, 6);
}