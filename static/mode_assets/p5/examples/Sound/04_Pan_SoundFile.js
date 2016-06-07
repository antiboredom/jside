/*
 * @name Pan Sound
 * @description <p>Click mouse to play the sound.
 * Ball position follows mouse and correlates to panning of sound.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 *
 */
var ball = {};
var soundFile;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('assets/beatbox.ogg');
}

function setup() {
  createCanvas(710, 100);
}

function draw() {
  background(0);
  ball.x = constrain(mouseX, 0, width);
  ellipse(ball.x, height/2, 100, 100)
}

function mousePressed(){
  // map the ball's x location to a panning degree
  // between -1.0 (left) and 1.0 (right)
  var panning = map(ball.x, 0., width,-1.0, 1.0);
  soundFile.pan(panning);
  soundFile.play();
}
