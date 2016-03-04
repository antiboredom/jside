/*
 * @name Mixture
 * @frame 710,400 (optional)
 * @description Display a box with three different kinds of lights.
 */
function setup() {
	createCanvas(710, 400, WEBGL);
	noStroke();
}

function draw() {
	background(0);

	// Orange point light on the right
	pointLight(150, 100, 0, 500, 0, 200);

	// Blue directional light from the left
	directionalLight(0, 102, 255, -1, 0, 0);

	// Yellow spotlight from the front
	pointLight(255, 255, 109, 0, 0, 300);

	rotateY(map(mouseX, 0, width, 0, PI));
	rotateX(map(mouseY, 0, height, 0, PI));
	box(200);
}