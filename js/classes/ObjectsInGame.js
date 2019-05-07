// Vật thể di chuyển được (đạn của jinx, lốc của ys, ..)
class Moveable_Ability_Object { 
	constructor(_image, _position, _direction, _speed, _damage, _radius, _range, _collapseWhenCollide) {
		this.position = _position; // tọa độ bắt đầu (dạng vector)
		this.speed = _speed; // vận tốc
		this.image = _image; // hình ảnh hiển thị

		// hướng di chuyển (dạng vector, không phải dạng góc)
		// setMag để đưa độ dài direction về đúng = độ lớn vận tốc
		this.direction = _direction.setMag(this.speed); 

		this.range = _range; // phạm vi chiêu thức - khoảng cách xa nhất có thể bay tới (tính bằng pixels)
		this.radius = _radius; // bán kính vùng ảnh hưởng sát thương (hình tròn)
		this.damage = _damage; // sát thương gây ra khi trúnh mục tiêu

		// biến true-false cho biết khi trúng mục tiêu có tự hủy không
		// do có chiêu thức đi xuyên mục tiêu (R ez, ...)
		this.collapseWhenCollide = _collapseWhenCollide;
		this.travelDistance = 0; // quãng đường đã đi được


		// phần hack (nhìn thấy đường đi)
		this.targetMove = this.position.copy().add(this.direction.copy().setMag(this.range));
		this.hack = false;
	}

	run() {
		this.move();
		this.show();

		if(this.hack) {
			this.showWay();
		}
	}

	move() {
		// di chuyển theo hướng direction với vận tốc speed
		this.position.add(this.direction);
		this.travelDistance += this.speed;
	}

	show() {
		push();
		translate(this.position.x, this.position.y); // đưa bút vẽ tới vị trí vật thể
		rotate(this.direction.heading()); // xoay theo hướng bay

		fill(200, 15, 15, 150);
        ellipse(0, 0, this.radius * 2); // vẽ thân
        fill(0);
        rect(this.radius * .5, 0, this.radius, 2); // vẽ hướng

		pop(); // trả bút vẽ về vị trí mặc định
	}

	showWay() { //hiển thị đường đi của vật thể (như hack lmht)
		stroke(this.range - this.travelDistance, 30);
		strokeWeight(this.radius * 2);
		line(this.position.x, this.position.y, this.targetMove.x, this.targetMove.y);
		strokeWeight(1);
	}

	isFinished() {
		return this.travelDistance >= this.range;
	}
}

class LocXoay_Yasuo extends Moveable_Ability_Object {

	constructor(_position, _direction, _hack) {
		var image = images.locxoay;
		var speed = 10;
		var damage = 10;
		var radius = 70;
		var range = 700;
		var collapseWhenCollide = false;
		super(image, _position, _direction, speed, damage, radius, range, collapseWhenCollide);

		this.hack = _hack;
	}

	show() {
		push();
		translate(this.position.x, this.position.y); // đưa bút vẽ tới vị trí vật thể
		rotate(millis() / 100); // xoáy

		// var tintValue = map(this.travelDistance, 0, this.range, 0, 255);
		// tint(255, 255 - tintValue);
		tint(this.range, this.range - this.travelDistance);
		image(this.image, 0, 0, this.radius * 2, this.radius * 2);

		pop(); // trả bút vẽ về vị trí mặc định
	}
}