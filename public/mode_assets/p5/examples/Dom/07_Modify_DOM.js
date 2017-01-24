/*
 * @name Modifying the DOM
 * @frame 710,300
 * @description <p>Create DOM elements and modify their properties every time
 * draw() is called. You will need to include the 
 * <a href="http://p5js.org/reference/#/libraries/p5.dom">p5.dom library</a>
 * for this example to work in your own project.</p>
 */
var dancingWords = [];

function DanceSpan(element, x, y) {
  element.position(x, y);
  
  this.brownian = function() {
    x += random(-6, 6);
    y += random(-6, 6);
    element.position(x, y);
  };
};

function setup() {
  // This paragraph is created aside of the main block of code.
  // It's to differentiate the creation of an element from its 
  // selection. Selected elements doesn't need to be created by 
  // p5js, they can be just plain HTML.
  createP('I learne in this Letter, that Don Peter of Arragon, '
    + ' comes this night to Messina').addClass('text');

  // This line grabs the paragraph just created, but it would 
  // also grab any other elements with class 'text' in the HTML
  // page.
  var texts = selectAll('.text');

  for (var i=0; i<texts.length; i++) {
    var paragraph = texts[i].html();
    var words = paragraph.split(' ');
    for (var j=0; j<words.length; j++) {   
      var spannedWord = createSpan(words[j]);
      var dw = new DanceSpan(spannedWord, random(600), random(200));
      dancingWords.push(dw);
    };   
  };
}

function draw() {
  for (var i=0; i<dancingWords.length; i++) {
    dancingWords[i].brownian();
  };
}

