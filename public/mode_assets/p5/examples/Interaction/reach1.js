/*
 * @name Reach 1
 * @frame 710,400
 * @description The arm follows the position of the mouse by calculating the
 * angles with atan2(). Based on code from Keith Peters.
 */
var segLength = 80,
  x, y, x2, y2;

function setup() {
  createCanvas(710, 400);
  strokeWeight(20);
  stroke(255, 100);

  x = width/2;
  y = height/2;
  x2 = x;
  y2 = y;
}

function draw() {
  background(0);
  dragSegment(0, mouseX, mouseY);
  for( var i=0; i<x.length-1; i++) {
    dragSegment(i+1, x[i], y[i]);
  }
}

function dragSegment(i, xin, yin) {
  background(0);

  dx = mouseX - x;
  dy = mouseY - y;
  angle1 = atan2(dy, dx);

  tx = mouseX - cos(angle1) * segLength;
  ty = mouseY - sin(angle1) * segLength;
  dx = tx - x2;
  dy = ty - y2;
  angle2 = atan2(dy, dx);
  x = x2 + cos(angle2) * segLength;
  y = y2 + sin(angle2) * segLength;

  segment(x, y, angle1);
  segment(x2, y2, angle2);
}

function segment(x, y, a) {
  push();
  translate(x, y);
  rotate(a);
  line(0, 0, segLength, 0);
  pop();
}
