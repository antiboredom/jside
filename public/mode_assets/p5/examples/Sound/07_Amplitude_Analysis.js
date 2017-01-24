/**
 * @name Measuring Amplitude
 * @description <p>Analyze the amplitude of sound with
 * p5.Amplitude.</p>
 *
 *  <p><b>Amplitude</b> is the magnitude of vibration. Sound is vibration,
 *  so its amplitude is is closely related to volume / loudness.</p>
 *
 * <p>The <code>getLevel()</code> method takes an array
 * of amplitude values collected over a small period of time (1024 samples).
 * Then it returns the <b>Root Mean Square (RMS)</b> of these values.</p>
 *
 * <p>The original amplitude values for digital audio are between -1.0 and 1.0.
 * But the RMS will always be positive, because it is squared.
 * And, rather than use instantanous amplitude readings that are sampled at a rate
 * of 44,100 times per second, the RMS is an average over time (1024 samples, in this case),
 * which better represents how we hear amplitude.
 * </p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
var song, analyzer;

function preload() {
  song = loadSound('assets/lucky_dragons_-_power_melody.mp3');
}

function setup() {
  createCanvas(710, 200);
  song.loop();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(song);
}

function draw() {
  background(255);

  // Get the average (root mean square) amplitude
  var rms = analyzer.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with size based on volume
  ellipse(width/2, height/2, 10+rms*200, 10+rms*200);
}
