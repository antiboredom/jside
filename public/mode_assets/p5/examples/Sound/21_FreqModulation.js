/**
 * @name Frequency Modulation
 * @description <p>Frequency Modulation is a powerful form of synthesis.
 * In its simplest form, FM involves two oscillators, referred
 * to as the carrier and the modulator. As the modulator's waveform oscillates
 * between some minimum and maximum amplitude value, that momentary value
 * is added to ("modulates") the frequency of the carrier.</p>
 * <p>The <b>carrier</b> is typically set to oscillate at an audible frequency
 * that we perceive as a pitch—in this case, it is a sine wave oscilaltor at 220Hz,
 * equivalent to an "A3" note. The carrier is connected to master output by default
 * (this is the case for all p5.Oscillators).</p>
 * <p>We will <code>disconnect</code> the <b>modulator</b> from master output,
 * and instead connect to the frequency of the carrier:
 * <code>carrier.freq(modulator)</code>. This adds the output amplitude of the
 * modulator to the frequency of the carrier.</p>
 * <p>
 * <b>Modulation Depth</b> describes how much the carrier frequency will modulate.
 * It is based on the amplitude of the modulator.
 * The modulator produces a continuous stream of amplitude values that we will add
 * to the carrier frequency. An amplitude of zero means silence, so the modulation will
 * have no effect. An amplitude of 1.0 scales the range of output values
 * between +1.0 and -1.0. That is the standard range for sound that gets sent to
 * your speakers, but in FM we are instead sending the modulator's output to the carrier frequency,
 * where we'd barely notice the +1Hz / -1Hz modulation.
 * So we will typically increase the amplitude ("depth") of the modulator to numbers much higher than what
 * we might send to our speakers.</p>
 * <p><b>Modulation Frequency</b> is the speed of modulation. When the modulation frequency is lower
 * than 20Hz, we stop hearing its frequency as pitch, and start to hear it as a beating rhythm.
 * For example, try 7.5Hz at a depth of 20 to mimic the "vibrato" effect of an operatic vocalist.
 * The term for this is Low Frequency Oscillator, or LFO. Modulators set to higher frequencies can
 * also produce interesting effects, especially when the frequency has a harmonic relationship
 * to the carrier signal. For example, listen to what happens when the modulator's frequency is
 * half or twice that of the carrier. This is the basis for FM Synthesis, developed by John Chowning
 * in the 1960s, which came to revolutionize synthesis in the 1980s and is often used to synthesize
 * brass and bell-like sounds.
 *
 * <p>In this example,</p><p>
 * - MouseX controls the modulation depth (the amplitude of the modulator) from -150 to 150.
 * When the modulator's amplitude is set to 0 (in the middle), notice how the modulation
 * has no effect. The greater (the absolute value of) the number, the greater the effect.
 * If the modulator waveform is symetrical like a square <code>[]</code>, sine <code>~</code>
 * or triangle <code>/\</code>, the negative amplitude will be the same as positive amplitude.
 * But in this example, the modulator is an asymetrical sawtooth wave, shaped like this /.
 * When we multiply it by a negative number, it goes backwards like this \. To best
 * observe the difference, try lowering the frequency.
 * </p>
 * <p>- MouseY controls the frequency of the modulator from 0 to 112 Hz.
 * Try comparing modulation frequencies below the audible range (which starts around 20hz),
 * and above it, especially in a harmonic relationship to the carrier frequency (which is 220hz, so
 * try half that, 1/3, 1/4 etc...).
 *
 * <p><em><span class="small">You will need to include the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * for this example to work in your own project.</em></span></p>
 */

var carrier; // this is the oscillator we will hear
var modulator; // this oscillator will modulate the frequency of the carrier

var analyzer; // we'll use this visualize the waveform

// the carrier frequency pre-modulation
var carrierBaseFreq = 220;

// min/max ranges for modulator
var modMaxFreq = 112;
var modMinFreq = 0;
var modMaxDepth = 150;
var modMinDepth = -150;

function setup() {
  var cnv = createCanvas(800,400);
  noFill();

  carrier = new p5.Oscillator('sine');
  carrier.amp(0); // set amplitude
  carrier.freq(carrierBaseFreq); // set frequency
  carrier.start(); // start oscillating

  // try changing the type to 'square', 'sine' or 'triangle'
  modulator = new p5.Oscillator('sawtooth');
  modulator.start();

  // add the modulator's output to modulate the carrier's frequency
  modulator.disconnect();
  carrier.freq( modulator );

  // create an FFT to analyze the audio
  analyzer = new p5.FFT();

  // fade carrier in/out on mouseover / touch start
  toggleAudio(cnv);
}

function draw() {
  background(30);

  // map mouseY to modulator freq between a maximum and minimum frequency
  var modFreq = map(mouseY, height, 0, modMinFreq, modMaxFreq);
  modulator.freq(modFreq);

  // change the amplitude of the modulator
  // negative amp reverses the sawtooth waveform, and sounds percussive
  //
  var modDepth = map(mouseX, 0, width, modMinDepth, modMaxDepth);
  modulator.amp(modDepth);

  // analyze the waveform
  waveform = analyzer.waveform();

  // draw the shape of the waveform
  stroke(255);
  strokeWeight(10);
  beginShape();
  for (var i = 0; i < waveform.length; i++){
    var x = map(i, 0, waveform.length, 0, width);
    var y = map(waveform[i], -1, 1, -height/2, height/2);
    vertex(x, y + height/2);
  }
  endShape();

  strokeWeight(1);
  // add a note about what's happening
  text('Modulator Frequency: ' + modFreq.toFixed(3) + ' Hz', 20, 20);
  text('Modulator Amplitude (Modulation Depth): ' + modDepth.toFixed(3), 20, 40);
  text('Carrier Frequency (pre-modulation): ' + carrierBaseFreq + ' Hz', width/2, 20);

}

// helper function to toggle sound
function toggleAudio(cnv) {
  cnv.mouseOver(function() {
    carrier.amp(1.0, 0.01);
  });
  cnv.touchStarted(function() {
    carrier.amp(1.0, 0.01);
  });
  cnv.mouseOut(function() {
    carrier.amp(0.0, 1.0);
  });
}
