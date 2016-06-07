/*
 * @name Tilted 3D Box
 * @description Use mobile to tilt a box
 */
function setup(){
  createCanvas(displayWidth, displayHeight, WEBGL);
}

function draw(){
  background(250);
  normalMaterial();
  rotateX(accelerationX * 0.01);
  rotateY(accelerationY * 0.01);
  box(100, 100, 100); 
}