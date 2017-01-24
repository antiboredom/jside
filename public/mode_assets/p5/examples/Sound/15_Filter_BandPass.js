/**
 *  @name Filter BandPass
 *  @description Apply a p5.BandPass filter to white noise.
 *  Visualize the sound with FFT.
 *  Map mouseX to the bandpass frequency
 *  and mouseY to resonance/width of the a BandPass filter
 *
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
var noise;
var fft;
var filter, filterFreq, filterWidth;

function setup() {
  createCanvas(710, 256);
  fill(255, 40, 255);

  filter = new p5.BandPass();

  noise = new p5.Noise();

  noise.disconnect(); // Disconnect soundfile from master output...
  filter.process(noise); // ...and connect to filter so we'll only hear BandPass.
  noise.start();

  fft = new p5.FFT();
}

function draw() {
  background(30);

  // Map mouseX to a bandpass freq from the FFT spectrum range: 10Hz - 22050Hz
  filterFreq = map (mouseX, 0, width, 10, 22050);
  // Map mouseY to resonance/width
  filterWidth = map(mouseY, 0, height, 0, 90);
  // set filter parameters
  filter.set(filterFreq, filterWidth);

  // Draw every value in the FFT spectrum analysis where
  // x = lowest (10Hz) to highest (22050Hz) frequencies,
  // h = energy / amplitude at that frequency
  var spectrum = fft.analyze();
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, h) ;
  }
}
