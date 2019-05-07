class Loading {
    constructor(_r, _strkW, _color) {
        this.strW = _strkW;
        this.radius = _r;
        this.color = _color;
        this.angle = 0;
    }

    run() {
    	noFill();

    	// vòng xám
		stroke(0, 100);
    	ellipse(width * .5, height * .5, this.radius * 2);

    	// nửa vòng màu 
    	strokeWeight(this.strW);
    	stroke(this.color);
    	arc(width * .5, height * .5, this.radius * 2, this.radius * 2, this.angle - HALF_PI, this.angle);

    	// chữ
    	noStroke();
    	fill("#bbb9");
    	text("LOADING", width * .5, height * .5 + this.radius + 20)

    	this.angle += .1;
    }
}

class showAbilityInfo {
    constructor() {
        
    }
}