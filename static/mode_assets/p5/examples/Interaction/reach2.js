/*
 * @name Reach 2
 * @frame 710,400
 * @description The arm follows the position of the mouse by calculating the
 * angles with atan2(). Based on code from Keith Peters.
 */
var numSegments = 10,
  x = [],
  y = [],
  angle = [],
  segLength = 26,
  targetX, targetY;

for (var i = 0; i < numSegments; i++) {
  x[i] = 0;
  y[i] = 0;
  angle[i] = 0;
}

function setup() {
  createCanvas(710, 400);
  strokeWeight(20);
  stroke(255, 100);

  x[x.length-1] = width/2; // Set base x-coordinate
  y[x.length-1] = height;  // Set base y-coordinate
}

function draw() {
  background(0);

  reachSegment(0, mouseX, mouseY);
  for(var i=1; i<numSegments; i++) {
    reachSegment(i, targetX, targetY);
  }
  for(var j=x.length-1; j>=1; j--) {
    positionSegment(j, j-1);
  }
  for(var k=0; k<x.length; k++) {
    segment(x[k], y[k], angle[k], (k+1)*2);
  }
}

function positionSegment(a, b) {
  x[b] = x[a] + cos(angle[a]) * segLength;
  y[b] = y[a] + sin(angle[a]) * segLength;
}

function reachSegment(i, xin, yin) {
  var dx = xin - x[i];
  var dy = yin - y[i];
  angle[i] = atan2(dy, dx);
  targetX = xin - cos(angle[i]) * segLength;
  targetY = yin - sin(angle[i]) * segLength;
}

function segment(x, y, a, sw) {
  strokeWeight(sw);
  push();
  translate(x, y);
  rotate(a);
  line(0, 0, segLength, 0);
  pop();
}
