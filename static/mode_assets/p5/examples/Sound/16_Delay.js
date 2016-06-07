/**
 *  @name  Delay
 *  @description
 *  Click the mouse to hear the p5.Delay process a SoundFile.
 *  MouseX controls the p5.Delay Filter Frequency.
 *  MouseY controls both the p5.Delay Time and Resonance.
 *  Visualize the resulting sound's volume with an Amplitude object.
 *
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */

var soundFile, analyzer, delay;

function preload() {
  soundFormats('ogg', 'mp3');
  soundFile = loadSound('assets/beatbox.mp3');
}

function setup() {
  createCanvas(710, 400);

  soundFile.disconnect(); // so we'll only hear delay

  delay = new p5.Delay();
  delay.process(soundFile, .12, .7, 2300);
  delay.setType('pingPong'); // a stereo effect

  analyzer = new p5.Amplitude();
}

function draw() {
  background(0);

  // get volume reading from the p5.Amplitude analyzer
  var level = analyzer.getLevel();

  // use level to draw a green rectangle
  var levelHeight = map(level, 0, .1, 0, height);
  fill(100,250,100);
  rect(0, height, width, - levelHeight);

  var filterFreq = map(mouseX, 0, width, 60, 15000);
  filterFreq = constrain(filterFreq, 60, 15000);
  var filterRes = map(mouseY, 0, height, 3, 0.01);
  filterRes = constrain(filterRes, 0.01, 3);
  delay.filter(filterFreq, filterRes);
  var delTime = map(mouseY, 0, width, .2, .01);
  delTime = constrain(delTime, .01, .2);
  delay.delayTime(delTime);
}

function mousePressed() {
  soundFile.play();
}
