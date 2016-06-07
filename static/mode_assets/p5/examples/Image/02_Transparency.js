/*
 * @name Transparency
 * @description Move the pointer left and right across the image to change its
 * position. This program overlays one image over another by modifying the
 * alpha value of the image with the tint() function.
 * <p><em><span class="small"> To run this example locally, you will need an
 * image file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">
 * local server</a>.</span></em></p>
 */
var img;
var offset = 0;
var easing = 0.05;

function setup() {
  createCanvas(720, 400);
  img = loadImage("assets/moonwalk.jpg");  // Load an image into the program
}

function draw() {
  image(img, 0, 0);  // Display at full opacity
  var dx = (mouseX-img.width/2) - offset;
  offset += dx * easing;
  tint(255, 127);  // Display at half opacity
  image(img, offset, 0);
}
