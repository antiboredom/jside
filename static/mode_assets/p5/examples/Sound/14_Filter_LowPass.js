/**
 *  @name  Filter LowPass
 *  @description Apply a p5.LowPass filter to a p5.SoundFile.
 *  Visualize the sound with FFT.
 *  Map mouseX to the the filter's cutoff frequency
 *  and mouseY to resonance/width of the a BandPass filter
 *
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
var soundFile;
var fft;

var filter, filterFreq, filterRes;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('assets/beat');
}

function setup() {
  createCanvas(710, 256);
  fill(255, 40, 255);

  // loop the sound file
  soundFile.loop();

  filter = new p5.LowPass();

  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  soundFile.disconnect();
  soundFile.connect(filter);

  fft = new p5.FFT();
}

function draw() {
  background(30);

  // Map mouseX to a the cutoff frequency from the lowest
  // frequency (10Hz) to the highest (22050Hz) that humans can hear
  filterFreq = map (mouseX, 0, width, 10, 22050);

  // Map mouseY to resonance (volume boost) at the cutoff frequency
  filterRes = map(mouseY, 0, height, 15, 5);

  // set filter parameters
  filter.set(filterFreq, filterRes);

  // Draw every value in the FFT spectrum analysis where
  // x = lowest (10Hz) to highest (22050Hz) frequencies,
  // h = energy (amplitude / volume) at that frequency
  var spectrum = fft.analyze();
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, h) ;
  }

}
