/*
 * @name Directional
 * @frame 710,400
 * @description Move the mouse the change the direction of the light.
 * Directional light comes from one direction and is stronger when hitting a
 * surface squarely and weaker if it hits at a a gentle angle. After hitting a
 * surface, a directional lights scatters in all directions.
 */
var radius = 200;

function setup() {
	createCanvas(710, 400, WEBGL);
	noStroke();
	fill(200);
}

function draw() {
	noStroke();
	background(0);
	var dirY = (mouseY / height - 0.5) * 4;
	var dirX = (mouseX / width - 0.5) * 4;
	directionalLight(204, 204, 204, dirX, dirY, 1);
	translate(-1.5 * radius, 0, 0);
	sphere(radius);
	translate(3 * radius, 0, 0);
	sphere(radius);
}