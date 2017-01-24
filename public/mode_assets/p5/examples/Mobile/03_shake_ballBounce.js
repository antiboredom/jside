/*
 * @name Shake Ball Bounce
 * @description Create a Ball class, instantiate multiple objects, move it around the screen, and bounce when touch the edge of the canvas.
 * Detect shake event based on total change in accelerationX and accelerationY and speed up or slow down objects based on detection. 
 */

var balls = []; 

var threshold = 30;
var accChangeX = 0; 
var accChangeY = 0;
var accChangeT = 0;

function setup() {
  createCanvas(displayWidth, displayHeight);
  
  for (var i=0; i<20; i++) {
    balls.push(new Ball());
  }
}

function draw() {
  background(0);
  
  for (var i=0; i<balls.length; i++) { 
    balls[i].move(); 
    balls[i].display();    
  }

  checkForShake();
 }

// Ball class
function Ball() {
  this.x = random(width);
  this.y = random(height);
  this.diameter = random(10, 30);
  this.xspeed = random(-2, 2);
  this.yspeed = random(-2, 2);
  this.oxspeed = this.xspeed;
  this.oyspeed = this.yspeed;
  this.direction = 0.7;

  this.move = function() {
    this.x += this.xspeed * this.direction;
    this.y += this.yspeed * this.direction;       
  };
  
  // Bounce when touch the edge of the canvas  
  this.turn = function() {
    if (this.x < 0) { 
      this.x = 0; 
      this.direction = -this.direction; 
    }
    else if (this.y < 0) { 
      this.y = 0; 
      this.direction = -this.direction;   
    }
    else if (this.x > width - 20) { 
      this.x = width - 20; 
      this.direction = -this.direction; 
    }
    else if (this.y > height - 20) { 
      this.y = height - 20; 
      this.direction = -this.direction;   
    } 
  };

  // Add to xspeed and yspeed based on 
  // the change in accelerationX value
  this.shake = function() {
    this.xspeed += random(5, accChangeX/3);
    this.yspeed += random(5, accChangeX/3);
  };

  // Gradually slows down 
  this.stopShake = function() {
    if (this.xspeed > this.oxspeed) {
      this.xspeed -= 0.6;
    } 
    else {
      this.xspeed = this.oxspeed;
    }
    if (this.yspeed > this.oyspeed) {
      this.yspeed -= 0.6;
    } 
    else {
      this.yspeed = this.oyspeed;
    }
  };

  this.display = function() {
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };
}

function checkForShake() {
  // Calculate total change in accelerationX and accelerationY
  accChangeX = abs(accelerationX - pAccelerationX);
  accChangeY = abs(accelerationY - pAccelerationY);
  accChangeT = accChangeX + accChangeY;
  // If shake
  if (accChangeT >= threshold) {
    for (var i=0; i<balls.length; i++) {
      balls[i].shake();
      balls[i].turn();
    }
  } 
  // If not shake
  else {
    for (var i=0; i<balls.length; i++) {
      balls[i].stopShake();
      balls[i].turn();
      balls[i].move(); 
    }
  }
}