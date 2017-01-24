/**
 * @name Convolution Reverb
 * @description <p>The p5.Convolver can recreate the sound of actual
 * spaces using convolution. Convolution takes an Impulse Response,
 * (the sound of a room reverberating), and uses that to
 * recreate the sound of that space.</p><p>Click to play a sound through
 * convolution. Every time you click, the sound is convolved with
 * a different Impulse Response. To hear the Impulse Response itself,
 * press any key.</p>
 *
 * <p><em><span class="small">To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.
 * These convolution samples are Creative Commons BY
 * <a href="https://www.freesound.org/people/recordinghopkins/">
 * recordinghopkins</a></em></span></p>
 */
var sound, env, cVerb, fft;
var currentIR = 0;
var rawImpulse;

function preload() {

  // we have included both MP3 and OGG versions of all the impulses/sounds
  soundFormats('ogg', 'mp3');

  // create a p5.Convolver
  cVerb = createConvolver('assets/bx-spring');

  // add Impulse Responses to cVerb.impulses array, in addition to bx-spring
  cVerb.addImpulse('assets/small-plate');
  cVerb.addImpulse('assets/drum');
  cVerb.addImpulse('assets/beatbox');
  cVerb.addImpulse('assets/concrete-tunnel');

  // load a sound that will be processed by the p5.ConvultionReverb
  sound = loadSound('assets/Damscray_DancingTiger');
}

function setup() {
  createCanvas(710, 400);
  rawImpulse = loadSound('assets/' + cVerb.impulses[currentIR].name);

  // disconnect from master output...
  sound.disconnect();
  // ... and process with cVerb
  // so that we only hear the reverb
  cVerb.process(sound);

  fft = new p5.FFT();
}

function draw() {
  background(30);
  fill(0,255,40);

  var spectrum = fft.analyze();

  // Draw every value in the frequencySpectrum array as a rectangle
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, h) ;
  }
}

function mousePressed() {

  // cycle through the array of cVerb.impulses
  currentIR++;
  if (currentIR >= cVerb.impulses.length) {
    currentIR = 0;
  }
  cVerb.toggleImpulse(currentIR);

  // play the sound through the impulse
  sound.play();

  // display the current Impulse Response name (the filepath)
  println('Convolution Impulse Response: ' + cVerb.impulses[currentIR].name);

  rawImpulse.setPath('assets/' + cVerb.impulses[currentIR].name);
}

// play the impulse (without convolution)
function keyPressed() {
  rawImpulse.play();
}
