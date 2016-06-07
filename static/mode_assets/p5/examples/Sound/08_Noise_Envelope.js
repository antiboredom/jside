/**
 *  @name Noise Drum Envelope
 *  @description  <p>White Noise is a random audio signal with equal energy
 *  at every part of the frequency spectrum</p>
 *
 *  <p>An Envelope is a series of fades, defined
 *  as time / value pairs.</p>
 *
 *  <p>In this example, the p5.Env
 *  will be used to "play" the p5.Noise like a drum by controlling its output
 *  amplitude. A p5.Amplitude will get the level of all sound in the sketch, and
 *  we'll use this value to draw a green rectangle that shows the envelope
 *  in action.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a> and a
 * sound file.</span></em></p>
 */
var noise, env, analyzer;

function setup() {
  createCanvas(710, 200);
  noise = new p5.Noise(); // other types include 'brown' and 'pink'
  noise.start();

  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  env = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  env.setADSR(0.001, 0.1, 0.2, 0.1);
  // set attackLevel, releaseLevel
  env.setRange(1, 0);

  // p5.Amplitude will analyze all sound in the sketch
  // unless the setInput() method is used to specify an input.
  analyzer = new p5.Amplitude();
}

function draw() {
  background(0);

  // get volume reading from the p5.Amplitude analyzer
  var level = analyzer.getLevel();

  // use level to draw a green rectangle
  var levelHeight = map(level, 0, .4, 0, height);
  fill(100,250,100);
  rect(0, height, width, - levelHeight);
}

function mousePressed() {
  env.play(noise);
}