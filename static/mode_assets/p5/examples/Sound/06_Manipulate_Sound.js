/*
 * @name Playback Rate
 * @description <p>Load a SoundFile and map its playback rate to
 * mouseY, volume to mouseX. Playback rate is the speed with
 * which the web audio context processings the sound file information.
 * Slower rates not only increase the duration of the sound, but also
 * decrease the pitch because it is being played back at a slower frequency.</p>
 * <p><em><span class="small"> To run this example locally, you will need the
 * <a href="http://p5js.org/reference/#/libraries/p5.sound">p5.sound library</a>
 * a sound file, and a running <a href="https://github.com/processing/p5.js/wiki/Local-server">local server</a>.</span></em></p>
 */
// A sound file object
var song;

function preload() {
  // Load a sound file
  song = loadSound('assets/Damscray_DancingTiger.mp3');
}

function setup() {
  createCanvas(710, 400);

  // Loop the sound forever
  // (well, at least until stop() is called)
  song.loop();
}

function draw() {
  background(200);

  // Set the volume to a range between 0 and 1.0
  var volume = map(mouseX, 0, width, 0, 1);
  volume = constrain(volume, 0, 1);
  song.amp(volume);

  // Set the rate to a range between 0.1 and 4
  // Changing the rate alters the pitch
  var speed = map(mouseY, 0.1, height, 0, 2);
  speed = constrain(speed, 0.01, 4);
  song.rate(speed);

  // Draw some circles to show what is going on
  stroke(0);
  fill(51, 100);
  ellipse(mouseX, 100, 48, 48);
  stroke(0);
  fill(51, 100);
  ellipse(100, mouseY, 48, 48);
}
