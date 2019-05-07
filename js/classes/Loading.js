class Loading {
    constructor(_x, _y, _r, _color) {
        this.position = {
            x: _x,
            y: _y
        };

        this.radius = _r;
        this.color = _color;
        this.angle = 0;
    }

    run() {
    	noFill();

		stroke(0, 50);
    	ellipse(this.position.x, this.position.y, this.radius * 2);

    	strokeWeight(10);
    	stroke(this.color);
    	arc(this.position.x, this.position.y, this.radius * 2, this.radius * 2, this.angle - HALF_PI, this.angle);

    	this.angle += .1;
    }
}