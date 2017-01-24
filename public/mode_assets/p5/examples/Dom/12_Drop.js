/*
 * @name Drop
 * @description You will need to include the 
 * <a href="http://p5js.org/reference/#/libraries/p5.dom">p5.dom library</a>
 * for this example to work in your own project.<br><br>
 * Drag an image file onto the canvas to see it displayed.
 */

function setup() {
  // create canvas
  var c = createCanvas(710, 400);
  background(100);
  // Add an event for when a file is dropped onto the canvas
  c.drop(gotFile);
}

function draw() {
  fill(255);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text('Drag an image file onto the canvas.', width/2, height/2);
  noLoop();
}

function gotFile(file) {
  // If it's an image file
  if (file.type === 'image') {
    // Create an image DOM element but don't show it
    var img = createImg(file.data).hide();
    // Draw the image onto the canvas
    image(img, 0, 0, width, height);
  } else {
    println('Not an image file!');
  }
}