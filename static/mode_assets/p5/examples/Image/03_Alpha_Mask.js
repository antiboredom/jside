/*
 * @name Alpha Mask
 * @description Loads a "mask" for an image to specify the transparency in
 * different parts of the image. The two images are blended together using
 * the mask() method of p5.Image.
 * <p><em><span class="small"> To run this example locally, you will need two
 * image files, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">
 * local server</a>.</span></em></p>
 */
var img;
var imgMask;

function preload() {
  img = loadImage("assets/moonwalk.jpg");
  imgMask = loadImage("assets/mask.png");
}

function setup() {
  createCanvas(720, 400);
  img.mask(imgMask);
  imageMode(CENTER);
}

function draw() {
  background(0, 102, 153);
  image(img, width/2, height/2);
  image(img, mouseX, mouseY);
}
