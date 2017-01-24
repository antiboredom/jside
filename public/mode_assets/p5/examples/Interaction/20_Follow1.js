/*
 * @name Follow 1
 * @frame 710,400
 * @description A line segment is pushed and pulled by the cursor.
 * Based on code from Keith Peters.
 */
var x = 100,
  y = 100,
  angle1 = 0.0,
  segLength = 50;


function setup() {
  createCanvas(710, 400);
  strokeWeight(20.0);
  stroke(255, 100);
}

function draw() {
  background(0);

  dx = mouseX - x;
  dy = mouseY - y;
  angle1 = atan2(dy, dx);
  x = mouseX - (cos(angle1) * segLength);
  y = mouseY - (sin(angle1) * segLength);

  segment(x, y, angle1);
  ellipse(x, y, 20, 20);
}

function segment(x, y, a) {
  push();
  translate(x, y);
  rotate(a);
  line(0, 0, segLength, 0);
  pop();
}
