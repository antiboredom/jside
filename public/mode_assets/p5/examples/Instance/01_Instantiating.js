/*
 * @name Instantiation
 * @description Create a p5 instance, which keeps all variables
 * out of the global scope of your page.
 */
var sketch = function( p ) {

  var x = 100; 
  var y = 100;

  p.setup = function() {
    p.createCanvas(700, 410);
  };

  p.draw = function() {
    p.background(0);
    p.fill(255);
    p.rect(x,y,50,50);
  };
};

var myp5 = new p5(sketch);

// Compare to "global mode"
// var x = 100;
// var y = 100;

// function setup() {
//   createCanvas(200,200);
// }

// function draw() {
//   background(0);
//   fill(255);
//   ellipse(x,y,50,50);
// }