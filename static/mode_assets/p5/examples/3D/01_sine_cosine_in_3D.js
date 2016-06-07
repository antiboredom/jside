/*
 * @name Sine Cosine in 3D
 * @description Sine, cosine and push / pop could be applied in 3D as well.
 */
function setup(){
  createCanvas(710, 400, WEBGL);
}

function draw(){
  background(250);
  rotateY(frameCount * 0.01);

  for(var j = 0; j < 5; j++){
    push();
    for(var i = 0; i < 80; i++){
      translate(sin(frameCount * 0.001 + j) * 100, sin(frameCount * 0.001 + j) * 100, i * 0.1);
      rotateZ(frameCount * 0.002);
      push();
      sphere(8, 6, 4); 
      pop();
    }
    pop();
  }
}