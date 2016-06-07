/*
 * @name Video
 * @frame 710,250
 * @description <p>Load a video with multiple formats and toggle between playing
 * and paused with a button press. 
 * <p><em><span class="small"> To run this example locally, you will need at least
 * one video file, and the
 * <a href="http://p5js.org/reference/#/libraries/p5.dom">p5.dom library</a>.</span></em></p>
 */
var playing = false;
var fingers;
var button;


function setup() {
  // specify multiple formats for different browsers
  fingers = createVideo(['assets/fingers.mov',
                         'assets/fingers.webm']);
  button = createButton('play');
  button.mousePressed(toggleVid); // attach button listener
}

// plays or pauses the video depending on current state
function toggleVid() {
  if (playing) {
    fingers.pause();
    button.html('play');
  } else {
    fingers.loop();
    button.html('pause');
  }
  playing = !playing;
}
