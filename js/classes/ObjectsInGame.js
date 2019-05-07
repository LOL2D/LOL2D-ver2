// Vật thể di chuyển được (đạn của jinx, lốc của ys, ..)
class Moveable_Ability_Object {
    constructor(_owner, _image, _position, _direction, _speed, _damage, _radius, _range) {
        this.owner = _owner; // chủ nhân của vật thể này (character)
        this.position = _position; // tọa độ bắt đầu (dạng vector)
        this.speed = _speed; // vận tốc
        this.image = _image; // hình ảnh hiển thị

        // hướng di chuyển (dạng vector, không phải dạng góc)
        // setMag để đưa độ dài direction về đúng = độ lớn vận tốc
        this.direction = _direction.setMag(this.speed);
        this.travelDistance = 0; // quãng đường đã đi được

        this.range = _range; // phạm vi chiêu thức - khoảng cách xa nhất có thể bay tới (tính bằng pixels)
        this.radius = _radius; // bán kính vùng ảnh hưởng sát thương (hình tròn)
        this.damage = _damage; // sát thương gây ra khi trúnh mục tiêu

        // phần hack (nhìn thấy đường đi)
        this.targetMove = this.position.copy().add(this.direction.copy().setMag(this.range));
    }

    run() {
        this.move();
        this.show();

        if (hacked) {
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

        image(this.image, 0, 0, this.radius * 2, this.radius * 2);

        pop(); // trả bút vẽ về vị trí mặc định
    }

    showWay() { //hiển thị đường đi của vật thể (như hack lmht)
        stroke(this.range - this.travelDistance, 10);
        strokeWeight(this.radius * 2);
        line(this.position.x, this.position.y, this.targetMove.x, this.targetMove.y);
        strokeWeight(1);
    }

    isFinished() {
        return this.travelDistance >= this.range;
    }

    checkCharacter(c) {
        return !c.died && c != this.owner;
    }
}

class BaoKiem_Yasuo extends Moveable_Ability_Object {

    constructor(_owner, _position, _direction, _damage, _range) {
        var image = images.locxoay;
        var speed = 10;
        var radius = 40;
        super(_owner, image, _position, _direction, speed, _damage, radius, _range);

        this.charactersEffected = []; // lưu những tướng đã dính damage của chiêu này
        // do chiêu này xuyên qua tướng, nếu ko có mảng duyệt, tướng sẽ bị trừ máu ... đến chết :v
    }

    show() {
        this.radius += .7; // độ lớn lốc tăng dần
        this.damage += frameRate() / 240; // càng bay lâu damage càng cao

        push();
        translate(this.position.x, this.position.y); // đưa bút vẽ tới vị trí vật thể
        rotate(frameCount / 5); // xoáy

        // var tintValue = map(this.travelDistance, 0, this.range, 0, 255);
        // tint(255, 255 - tintValue);
        // tint(this.range, this.range - this.travelDistance);
        image(this.image, 0, 0, this.radius * 2, this.radius * 2);

        pop(); // trả bút vẽ về vị trí mặc định
    }

    effect(c) {
        if (this.checkCharacter(c)) {
            if (this.charactersEffected.indexOf(c) < 0) { // nếu chưa có thì mới trừ máu
                c.loseHealth(this.damage);
                this.charactersEffected.push(c); // cho vào mảng để ko bị trừ nữa
            }

            c.hatTung(1000);
        }
    }
}

class BoomSieuKhungKhiep_Jinx extends Moveable_Ability_Object {
    constructor(_owner, _position, _direction, _damage, _range) {
        var image = images.rocket;
        var speed = 15;
        var radius = 35;
        super(_owner, image, _position, _direction, speed, _damage, radius, _range);
    }

    show() {
        super.show();
        this.damage += frameRate() / 120; // bom của jinx càng bay lâu damage càng cao

        if (random(1) > .5) { // nhả khói
            objects.push(new Smoke(this.position.x, this.position.y, 200, 20));
        }
    }

    effect(c) {
        if (this.checkCharacter(c)) {
            c.loseHealth(this.damage);
            c.lamCham(.3, 1000); // làm chậm

            // hiệu ứng nổ khói
            for (var i = 0; i < 10; i++) {
                objects.push(new Smoke(this.position.x + random(-50, 50),
                    this.position.y + random(-50, 50),
                    random(100, 500), random(20, 70)));
            }

            // finish sau khi nổ
            this.travelDistance = this.range;
        }
    }
}

class TroiAnhSanh_Lux extends Moveable_Ability_Object {
    constructor(_owner, _position, _direction, _damage, _range) {
        var image = images.troiAnhSang;
        var speed = 12;
        var radius = 15;
        super(_owner, image, _position, _direction, speed, _damage, radius, _range);

        this.charactersEffected = []; // tương tự bão kiếm của ys
    }

    effect(c) {
        if (this.checkCharacter(c)) {
            if (this.charactersEffected.indexOf(c) < 0) { // nếu chưa có thì mới trừ máu
                c.loseHealth(this.damage);
                this.charactersEffected.push(c); // cho vào mảng để ko bị trừ nữa
            }
            c.troi(1500); // trói (làm chậm 100%)
        }
    }
}

// =============================== Vat the dung im ======================
class TuongGio_Yasuo {

}

// =============================== Cac vật thể khác =============================
class Smoke {
    constructor(x, y, life, r) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.radius = r || floor(random(10, 50));
        this.born = millis();
        this.life = life;
    }

    run() {
        this.show();
    }

    isFinished() {
        return (millis() - this.born > this.life);
    }

    show() {
        this.vel.add(random(-1, 1), random(-1, 1));
        this.pos.add(this.vel);
        this.vel.mult(0.9);

        // show 
        if (this.radius < 100)
            this.radius += random(7) * (30 / (frameRate() + 1));
        var c = map(this.life - (millis() - this.born), 0, this.life, 30, 255);
        fill(c, c * 2);
        noStroke();

        ellipse(this.pos.x, this.pos.y, this.radius * 2);
    }
}