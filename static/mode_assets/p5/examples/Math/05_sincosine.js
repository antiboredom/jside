/*
 * @name Sine Cosine
 * @description Linear movement with sin() and cos(). 
 * Numbers between 0 and PI*2 (TWO_PI which angles roughly 6.28)
 * are put into these functions and numbers between -1 and 1 are returned.
 * These values are then scaled to produce larger movements.
 */
var angle1=0;
var angle2=0;
var scalar = 70;

function setup() {
  createCanvas(710, 400);
  noStroke();
  rectMode(CENTER);
}

function draw() {
  background(0);

  var ang1 = radians(angle1);
  var ang2 = radians(angle2);

  var x1 = width/2 + (scalar * cos(ang1));
  var x2 = width/2 + (scalar * cos(ang2));
  
  var y1 = height/2 + (scalar * sin(ang1));
  var y2 = height/2 + (scalar * sin(ang2));
  
  fill(255);
  rect(width*0.5, height*0.5, 140, 140);

  fill(0, 102, 153);
  ellipse(x1, height*0.5 - 120, scalar, scalar);
  ellipse(x2, height*0.5 + 120, scalar, scalar);
  
  fill(255, 204, 0);
  ellipse(width*0.5 - 120, y1, scalar, scalar);
  ellipse(width*0.5 + 120, y2, scalar, scalar);

  angle1 += 2;
  angle2 += 3; 
}
