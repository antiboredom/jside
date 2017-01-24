/*
 * @name Acceleration Color
 * @description Use deviceMoved() to detect when the device is rotated. The background RGB color values are mapped to accelerationX, accelerationY, and accelerationZ values.  
 */

var r, g, b;

function setup() {
  createCanvas(displayWidth, displayHeight);
  r = random(50, 255);
  g = random(0, 200);
  b = random(50, 255);
}

function draw() {
  background(r, g, b);
  console.log('draw');
}

function deviceMoved() {   
    r = map(accelerationX, -90, 90, 100, 175);
    g = map(accelerationY, -90, 90, 100, 200);
    b = map(accelerationZ, -90, 90, 100, 200);   
}



