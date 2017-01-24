/**
 * @name Amplitude Modulation
 * @description <p>Amplitude Modulation involves two oscillators, referred
 * to as the carrier and the modulator, where the modulator controls
 * the carrier's amplitude.</p>
 *
 * <p>The carrier is typically set at an audible frequency (i.e. 440 Hz)
 * and connected to master output by default. The carrier.amp is
 * set to zero because we will have the modulator control its amplitude.</p>
 *
 * <p>The modulator is disconnected from master output. Instead, it is connected
 * to the amplitude of the Carrier, like this: carrier.amp(modulator).</p>
 *
 * <p>In this example...</p>
 * <p>- MouseX controls the amplitude of the modulator
 * from 0 to 1. When the modulator's amplitude is set to 0, the
 * amplitude modulation has no effect.</p>
 *
 * <p>- MouseY controls the frequency of the modulator from 0 to 20hz.
 * This range is lower frequencies than humans can hear, and we perceive the
 * modulation as a rhythm. This range can simulate effects such as Tremolo.
 * Ring Modulation is a type of Amplitude Modulation where the original
 * carrier signal is not present, and often involves modulation at a faster
 * frequency. </p>
 *
 * <p><em><span class="small">You will need to include the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * for this example to work in your own project.</em></span></p>
 */
var carrier; // this is the oscillator we will hear
var modulator; // this oscillator will modulate the amplitude of the carrier
var fft; // we'll visualize the waveform

function setup() {
  createCanvas(800,400);
  noFill();
  background(30); // alpha


  carrier = new p5.Oscillator(); // connects to master output by default
  carrier.freq(340);
  carrier.amp(0);
  // carrier's amp is 0 by default, giving our modulator total control

  carrier.start();

  modulator = new p5.Oscillator('triangle');
  modulator.disconnect();  // disconnect the modulator from master output
  modulator.freq(5);
  modulator.amp(1);
  modulator.start();

  // Modulate the carrier's amplitude with the modulator
  // Optionally, we can scale the signal.
  carrier.amp(modulator.scale(-1,1,1,-1));

  // create an fft to analyze the audio
  fft = new p5.FFT();
}

function draw() {
  background(30,30,30,100); // alpha

  // map mouseY to moodulator freq between 0 and 20hz
  var modFreq = map(mouseY, 0, height, 20, 0);
  modulator.freq(modFreq);

  var modAmp = map(mouseX, 0, width, 0, 1);
  modulator.amp(modAmp, 0.01); // fade time of 0.1 for smooth fading

  // analyze the waveform
  waveform = fft.waveform();

  // draw the shape of the waveform
  drawWaveform();

  drawText(modFreq, modAmp);
}

function drawWaveform() {
  stroke(240);
  strokeWeight(4);
  beginShape();
  for (var i = 0; i<waveform.length; i++){
    var x = map(i, 0, waveform.length, 0, width);
    var y = map(waveform[i], -1, 1, -height/2, height/2);
    vertex(x, y + height/2);
  }
  endShape();
}

function drawText(modFreq, modAmp) {
  strokeWeight(1);
  text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
  text('Modulator Amplitude: ' + modAmp.toFixed(3), 20, 40);
}
