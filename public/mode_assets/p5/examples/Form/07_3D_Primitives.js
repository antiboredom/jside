/*
 * @name 3D Primitives
 * @frame 720,400 (optional)
 * @description Placing mathematically 3D objects in synthetic space.
 * The box() and sphere() functions take at least one parameter to specify their
 * size. These shapes are positioned using the translate() function.
 */
function setup() {
	createCanvas(710, 400, WEBGL);
}

function draw() {
	background(100);
	noStroke();

	push();
	translate(-300, 200);
	rotateY(1.25);
	rotateX(-0.9);
	box(100);
	pop();

	noFill();
	stroke(255);
	push();
	translate(500, height*0.35, -200);
	sphere(300);
	pop();
}