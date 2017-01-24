/*
 * @name Textures
 * @description Images and videos are supported for texture.
 */
// video source: https://vimeo.com/90312869
var img;
var vid;
var theta = 0;

function setup(){
  createCanvas(710, 400, WEBGL);

  img = loadImage("assets/cat.jpg");
  vid = createVideo(["assets/360video_256crop_v2.mp4"]);
  vid.loop();
  vid.hide();
}

function draw(){
  background(250);
   translate(-220,0,0);
  push();
    rotateZ(theta * mouseX * 0.001);
    rotateX(theta * mouseX * 0.001);
    rotateY(theta * mouseX * 0.001);
    //pass image as texture
    texture(vid);
    sphere(150);
  pop();
    translate(440,0,0);
  push();
    rotateZ(theta * 0.1);
    rotateX(theta * 0.1);
    rotateY(theta * 0.1);
    texture(img);
    box(100, 100, 100);
  pop();
  theta += 0.05;
}