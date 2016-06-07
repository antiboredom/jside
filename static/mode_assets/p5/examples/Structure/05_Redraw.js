/*
 *@name Redraw
 *@description The redraw() function makes draw() execute once. In this example,
 *draw() is executed once every time the mouse is clicked.
*/

var y;

// The statements in the setup() function 
// execute once when the program begins
function setup() {
  createCanvas(720, 400);
  stroke(255);
  noLoop();
  y = height * 0.5;
}

// The statements in draw() are executed until the 
// program is stopped. Each statement is executed in 
// sequence and after the last line is read, the first 
// line is executed again.
function draw() {
  background(0);
  y = y - 4;
  if (y < 0) {
    y = height;
  }
  line(0, y, width, y);
}

function mousePressed() {
  redraw(); 
}