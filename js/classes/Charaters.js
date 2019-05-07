class Character {
    constructor(_image, _x, _y, _r, _speed, _isEnermy) {
        this.image = _image;
        this.position = createVector(_x, _y); // tọa độ nhân vật
        this.radius = _r; // bán kính vẽ nhân vật
        this.health = 100; // lượng máu
        this.color = (_isEnermy ? "#f00c" : "#0f0c");// là kẻ địch thì màu đỏ, ngược lại là xanh

        this.speed = _speed; // vận tốc di chuyển
        this.targetMove = createVector(300, 400); // tọa độ cần tới (khi ấn chuột trên bản đồ)
        this.targetRadius = 25; // độ lớn khi hiển thị targetMove
    }

    run() { // hàm chạy chính (ở main chỉ gọi hàm này)
        this.showTargetMove();
        this.move();
        this.show();
    }

    show() { // hàm hiển thị
        image(this.image, this.position.x, this.position.y, this.radius * 2, this.radius * 2);

        push();
        translate(this.position.x, this.position.y); // di chuyển bút vẽ tới vị trí nhân vật
        rotate(this.getDirectionMouse()); // xoay 1 góc theo hướng nhìn của chuột

        noFill();
        stroke(this.color);
        strokeWeight(5);
        ellipse(0, 0, this.radius * 2); // vẽ thân
        strokeWeight(1); // reset strokeWeight

        fill(255);
        noStroke();
        rect(this.radius * .5, 0, this.radius, 3); // vẽ hướng

        pop(); // trả lại bút vẽ về như cũ
    }

    showTargetMove() { // hiển thị điểm cần tới
        if (this.targetMove) {
            if (this.targetRadius >= 5)
                this.targetRadius -= 1.5;

            fill(20, 200, 20);
            ellipse(this.targetMove.x, this.targetMove.y, this.targetRadius * 2);
        }
    }

    setTargetMove(x, y) {
        // hàm này dùng để set tọa độ cần tới cho nhân vật
        this.targetMove = createVector(x, y);
        this.targetRadius = 25; // reset độ lớn
    }

    move() {
        if (this.targetMove) {
            // khoảng cách so với điểm cần tới
            var distance = p5.Vector.dist(this.targetMove, this.position);
            if (distance > max(5, this.speed)) {
                // tạo vector chỉ theo hướng cần tới
                var sub = p5.Vector.sub(this.targetMove, this.position);
                // thu nhỏ vector trên lại với độ dài = speed
                var step = sub.setMag(this.speed);
                // di chuyển theo vector sau khi thu nhỏ
                this.position.add(step);

            } else {
                this.targetMove = null; // xóa dữ liệu tọa độ khi nhân vật đã tới nơi

                if (this.autoMove)
                    this.setTargetMove(random(width), random(height)); // test tự động di chuyển
            }
        }
    }

    getDirectionMouse() { // hàm lấy hướng nhìn của nhân vật dạng góc
        // dùng hàm heading để lấy giá trị góc radian
        return this.getDirectionMouse_Vector().heading();
    }

    getDirectionMouse_Vector() { // hàm lấy hướng nhìn của nhân vật dạng vector
        // tạo vector tọa độ chuột
        var mouse = createVector(mouseX, mouseY);
        // tạo vector chỉ hướng từ nhân vật tới chuột
        var vecToMouse = p5.Vector.sub(mouse, this.position);
        return vecToMouse;
    }

    getPosition() {
        return this.position.copy();
    }
}

class Yasuo extends Character {
    constructor(_x, _y, _isEnermy) {
        var image = images.yasuo;
        var radius = 30;
        var speed = 5;
        super(image, _x, _y, radius, speed, _isEnermy);
    }

    Q() {
        return new LocXoay_Yasuo(this.getPosition(), this.getDirectionMouse_Vector(), hacked);
    }
}

class AutoYasuo extends Yasuo {
    constructor(_x, _y) {
        super(_x, _y, true);
        this.autoMove = true;
    }
}