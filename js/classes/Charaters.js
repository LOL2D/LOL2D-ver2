class Character {
    constructor(_name, _image, _x, _y, _r, _speed, _isEnermy) {
        this.name = _name;
        this.image = _image;
        this.position = createVector(_x, _y); // tọa độ nhân vật
        this.radius = _r; // bán kính vẽ nhân vật
        this.maxHealth = 100;
        this.health = 100; // lượng máu
        this.color = (_isEnermy ? "#f00c" : "#0f0c"); // là kẻ địch thì màu đỏ, ngược lại là xanh
        this.bgColor = "#0000";

        this.speed = _speed; // vận tốc di chuyển
        this.targetMove = createVector(random(width), random(height)); // tọa độ cần tới (khi ấn chuột trên bản đồ)
        this.targetRadius = 25; // độ lớn khi hiển thị targetMove
        this.died = false; // chết hay chưa :v

        // các hiệu ứng trên character
        this.effects = {
            biLamCham: false, // bị làm chậm
            biTroi: false, // bị trói
            biHatTung: false, // bị hất tung
            biCamLang: false, // bị câm lặng    
        }

    }

    run() { // hàm chạy chính (ở main chỉ gọi hàm này)
        if (!this.died) {
            this.showTargetMove();
            this.move();
            this.showHealth();
        }
        this.show();
    }

    // ================= Các hàm hành đông ====================
    loseHealth(damage) {
        if (this.health >= damage) {
            this.health -= damage;
        } else {
            this.health = 0;
            this.died = true;
            this.color = "#555"; // Mất màu :v
            this.bgColor = "#555a";
            menuWhenDie('open');
            // this.health = this.maxHealth; // test
        }
    }

    move() { // hàm di chuyển
        if (this.targetMove && !this.effects.biTroi && !this.effects.biHatTung) {
            // khoảng cách so với điểm cần tới
            var distance = p5.Vector.dist(this.targetMove, this.position);
            if (distance > max(5, this.speed)) {
                // tạo vector chỉ theo hướng cần tới
                var sub = p5.Vector.sub(this.targetMove, this.position);
                // thu nhỏ vector trên lại với độ dài = speed (hoặc bị làm chậm)
                var step = sub.setMag((this.effects.biLamCham ? (this.speed * (1 - this.effects.biLamCham)) : this.speed));
                // di chuyển theo vector sau khi thu nhỏ
                this.position.add(step);

            } else {
                this.targetMove = null; // xóa dữ liệu tọa độ khi nhân vật đã tới nơi

                if (this.autoMove)
                    this.setTargetMove(random(width), random(height)); // test tự động di chuyển
            }
        }
    }

    setTargetMove(x, y) { // hàm set tọa độ cần tới
        this.targetMove = createVector(x, y);
        this.targetRadius = 25; // reset độ lớn
    }

    troi(time) {
        // time ở dạng mili giây
        this.effects.biTroi = true;

        var effects = this.effects;
        setTimeout(function() { // setTimeOut .... khá rắc rối
            effects.biTroi = false;
        }, time);
    }

    lamCham(percent, time) {
        // time ở dạng mili giây
        this.effects.biLamCham = percent; // percent là phần trăm làm chậm (0 - 1)

        var effects = this.effects;
        setTimeout(function() { // setTimeOut .... khá rắc rối
            effects.biLamCham = false;
        }, time);
    }

    hatTung(time) {
        if (!this.effects.biHatTung) {
            // time ở dạng mili giây
            this.effects.biHatTung = time; // percent là phần trăm làm chậm (0 - 1)
            this.effects.thoiGianBatDau_HatTung = millis();
            this.effects.radiusHatTung = this.radius; // độ lớn khi vẽ vật thể bị hất tung
            this.effects.radiusHatTung_Max = this.radius * 1.5;

        } else {
            // dùng cho trùng lặp hất tung (hất tung khi vẫn đang trên không)
            clearTimeout(this.effects.indexHatTung);
            this.effects.thoiGianBatDau_HatTung = millis();
        }

        var effects = this.effects;
        this.effects.indexHatTung = setTimeout(function() { // setTimeOut .... khá rắc rối
            effects.biHatTung = false;
        }, time);
    }

    // ===================== Các hàm hiển thị ====================
    show() { // hàm hiển thị
        var radius = this.radius;

        // hiển thị hiệu ứng hất tung
        if (this.effects.biHatTung) {

            // có 2 giai đoạn : bay lên và hạ xuống , mỗi giai đoạn chiếm 1/2 thời gian hất tung
            if (millis() - this.effects.thoiGianBatDau_HatTung < this.effects.biHatTung / 2) {

                if (this.effects.radiusHatTung < this.effects.radiusHatTung_Max) {
                    this.effects.radiusHatTung++; // đang bay lên => radius to dần
                }

            } else if (this.effects.radiusHatTung > this.radius) {
                this.effects.radiusHatTung--; // đang bay xuống => radius nhỏ dần
            }

            radius = this.effects.radiusHatTung;
        }

        image(this.image, this.position.x, this.position.y, radius * 2, radius * 2);

        push();
        translate(this.position.x, this.position.y); // di chuyển bút vẽ tới vị trí nhân vật
        rotate(this.getDirectionMouse()); // xoay 1 góc theo hướng nhìn của chuột

        fill(this.bgColor);
        stroke(this.effects.biTroi ? "#fffb" : this.color); // nếu bị trói thì màu trắng
        strokeWeight(5);
        ellipse(0, 0, radius * 2); // vẽ thân
        strokeWeight(1); // reset strokeWeight

        if (!this.died) {
            fill(255);
            noStroke();
            rect(radius * .5, 0, radius, 3); // vẽ hướng    
        }


        pop(); // trả lại bút vẽ về như cũ
    }

    showHealth() {
        // các giá trị mặc định
        var healthWidth = 150;
        var healthHeight = 20;
        var bgHealth = "#5559";

        rectMode(CORNER); // chuyển về corner mode cho dễ vẽ
        // vẽ
        fill(bgHealth);
        stroke(200);
        rect(this.position.x - healthWidth * .5,
            this.position.y + this.radius + 10,
            healthWidth,
            healthHeight
        );

        fill(this.color);
        noStroke();
        rect(this.position.x - healthWidth * .5,
            this.position.y + this.radius + 10,
            map(this.health, 0, this.maxHealth, 0, healthWidth), // tính độ dài thanh máu
            healthHeight
        );

        fill(255);
        textSize(17);
        text(floor(this.health), this.position.x, this.position.y + this.radius + healthHeight)
        rectMode(CENTER); // reset mode
    }

    showTargetMove() { // hiển thị điểm cần tới
        if (this.targetMove) {
            if (this.targetRadius >= 5)
                this.targetRadius -= 1.5;

            fill(this.color);
            ellipse(this.targetMove.x, this.targetMove.y, this.targetRadius * 2);

            if (hacked) {
                stroke(this.color);
                line(this.position.x, this.position.y, this.targetMove.x, this.targetMove.y);
            }
        }
    }

    showAbility() {
        if (this.Q) {

        }
    }

    // =================== Các hàm tính và lấy giá trị ================
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

//=========================================================

class Yasuo extends Character {
    constructor(_name, _x, _y, _isEnermy) {
        var image = images.yasuo;
        var radius = 30;
        var speed = 5;
        super(_name, image, _x, _y, radius, speed, _isEnermy);

        this.Q = new Q_Yasuo(this);
        this.W = new Q_Lux(this);
        this.E = null;
        this.R = new R_Jinx(this);
    }
}

class AutoYasuo extends Yasuo {
    constructor(_name, _x, _y) {
        super((_name || "Yasuo Máy"), _x, _y, true);
        this.autoMove = true;
    }
}

class Jinx extends Character {
    constructor(_name, _x, _y, _isEnermy) {
        var image = images.jinx;
        var radius = 30;
        var speed = 5.5;
        super(_name, image, _x, _y, radius, speed, _isEnermy);

        this.Q = new Q_Yasuo(this);
        this.W = new Q_Lux(this);
        this.E = null;
        this.R = new R_Jinx(this);
    }
}