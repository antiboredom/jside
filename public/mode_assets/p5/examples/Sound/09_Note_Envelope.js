/**
 *  @name Note Envelope
 *  @description  <p>An Envelope is a series of fades, defined
 *  as time / value pairs. In this example, the envelope
 *  will be used to "play" a note by controlling the output
 *  amplitude of an oscillator.<br/><br/>
 *  The p5.Oscillator sends its output through
 *  an internal Web Audio GainNode (p5.Oscillator.output).
 *  By default, that node has a constant value of 0.5. It can
 *  be reset with the osc.amp() method. Or, in this example, an
 *  Envelope takes control of that node, turning the amplitude
 *  up and down like a volume knob.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a> and a
 * sound file.</span></em></p>
 */
var osc, envelope, fft;

var scaleArray = [60, 62, 64, 65, 67, 69, 71, 72];
var note = 0;

function setup() {
  createCanvas(710, 200);
  osc = new p5.SinOsc();

  // Instantiate the envelope
  envelope = new p5.Env();

  // set attackTime, decayTime, sustainRatio, releaseTime
  envelope.setADSR(0.001, 0.5, 0.1, 0.5);

  // set attackLevel, releaseLevel
  envelope.setRange(1, 0);

  osc.start();

  fft = new p5.FFT();
  noStroke();
}

function draw() {
  background(20);

  if (frameCount % 60 == 0 || frameCount == 1) {
    var midiValue = scaleArray[note];
    var freqValue = midiToFreq(midiValue);
    osc.freq(freqValue);

    envelope.play(osc, 0, 0.1);
    note = (note + 1) % scaleArray.length;
  }

  // plot FFT.analyze() frequency analysis on the canvas
  var spectrum = fft.analyze();
  for (var i = 0; i < spectrum.length/20; i++) {
    fill(spectrum[i], spectrum[i]/10, 0);
    var x = map(i, 0, spectrum.length/20, 0, width);
    var h = map(spectrum[i], 0, 255, 0, height);
    rect(x, height, spectrum.length/20, -h);
  }
}
