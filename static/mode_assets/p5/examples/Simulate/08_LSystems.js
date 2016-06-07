/*
 * @name L-Systems
 * @description This sketch creates an automated drawing based on a Lindenmayer
 * or (L-) system. L-systems are often used in procedural graphics to make
 * natural, geometric, or interesting "fractal-style" patterns.<br>
 * Example created by <a href='http://lukedubois.com/' target='_blank'>R. Luke DuBois</a>.<br>
 * <a href='https://en.wikipedia.org/wiki/L-system'>https://en.wikipedia.org/wiki/L-system</a>
 */
// TURTLE STUFF:
var x, y; // the current position of the turtle
var currentangle = 0; // which way the turtle is pointing
var step = 20; // how much the turtle moves with each 'F'
var angle = 90; // how much the turtle turns with a '-' or '+'

// LINDENMAYER STUFF (L-SYSTEMS)
var thestring = 'A'; // "axiom" or start of the string
var numloops = 5; // how many iterations to pre-compute
var therules = []; // array for rules
therules[0] = ['A', '-BF+AFA+FB-']; // first rule
therules[1] = ['B', '+AF-BFB-FA+']; // second rule

var whereinstring = 0; // where in the L-system are we?

function setup() {
  createCanvas(710, 400);
  background(255);
  stroke(0, 0, 0, 255);
  
  // start the x and y position at lower-left corner
  x = 0;
  y = height-1;
  
  // COMPUTE THE L-SYSTEM
  for (var i = 0; i < numloops; i++) {
    thestring = lindenmayer(thestring);
  }
}

function draw() {
  
  // draw the current character in the string:
  drawIt(thestring[whereinstring]); 
  
  // increment the point for where we're reading the string.
  // wrap around at the end.
  whereinstring++;
  if (whereinstring > thestring.length-1) whereinstring = 0;

}

// interpret an L-system
function lindenmayer(s) {
  var outputstring = ''; // start a blank output string
  
  // iterate through 'therules' looking for symbol matches:
  for (var i = 0; i < s.length; i++) {
    var ismatch = 0; // by default, no match
    for (var j = 0; j < therules.length; j++) {
      if (s[i] == therules[j][0])  {
        outputstring += therules[j][1]; // write substitution
        ismatch = 1; // we have a match, so don't copy over symbol
        break; // get outta this for() loop
      }
    }
    // if nothing matches, just copy the symbol over.
    if (ismatch == 0) outputstring+= s[i]; 
  }
  
  return outputstring; // send out the modified string
}

// this is a custom function that draws turtle commands
function drawIt(k) {

  if (k=='F') { // draw forward
    // polar to cartesian based on step and currentangle:
    var x1 = x + step*cos(radians(currentangle));
    var y1 = y + step*sin(radians(currentangle));
    line(x, y, x1, y1); // connect the old and the new

    // update the turtle's position:
    x = x1;
    y = y1;
  } else if (k == '+') {
    currentangle += angle; // turn left
  } else if (k == '-') {
    currentangle -= angle; // turn right   
  }

  // give me some random color values:
  var r = random(128, 255);
  var g = random(0, 192);
  var b = random(0, 50);
  var a = random(50, 100);

  // pick a gaussian (D&D) distribution for the radius:
  var radius = 0;
  radius += random(0, 15);
  radius += random(0, 15);
  radius += random(0, 15);
  radius = radius/3;
  
  // draw the stuff:
  fill(r, g, b, a);
  ellipse(x, y, radius, radius);
}