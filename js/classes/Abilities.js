class Ability {
    constructor(_owner, _damage, _cooldown, _range) {
        this.damage = _damage; // sát thương gây ra
        this.cooldownTime = _cooldown; // thời gian hồi chiêu (tính bằng milli giây)
        this.range = _range;

        this.lastActivatedTime = millis(); // mốc thời gian dùng chiêu trước đó
        this.owner = _owner;
    }

    available() {
        return (millis() - this.lastActivatedTime >= this.cooldownTime);
    }

    active() { // active này dùng cho những chiêu thức thêm vật thể Movevable vào game
    	if(this.available()) {
	        this.lastActivatedTime = millis();
	        objects.push(this.getMovevableObj());
    	}
    }

    showRange() {
        var direc = createVector(mouseX - this.owner.position.x, mouseY - this.owner.position.y);
        direc.setMag(this.range);
        direc.add(this.owner.position);

        stroke("#0006");
        strokeWeight(this.getMovevableObj().radius * 2);
        line(this.owner.position.x, this.owner.position.y, direc.x, direc.y);
        // strokeWeight(1); // reset stroke Weight
    }
}

// =======================================================================

class Q_Yasuo extends Ability {

    constructor(_owner) {
        var damage = 0;
        var cooldownTime = 1000;
        var range = 700;
        super(_owner, damage, cooldownTime, range);
    }

    getMovevableObj() {
        return new BaoKiem_Yasuo(
        	this.owner, this.owner.getPosition(), 
        	this.owner.getDirectionMouse_Vector(), 
        	this.damage, this.range);
    }
}

class R_Jinx extends Ability {
    constructor(_owner) {
        var damage = 0; // sát thương ban đầu = 0
        var cooldownTime = 2000;
        var range = 2000;
        super(_owner, damage, cooldownTime, range);
    }

    getMovevableObj() {
        return new BoomSieuKhungKhiep_Jinx(
            this.owner, this.owner.getPosition(),
            this.owner.getDirectionMouse_Vector(),
            this.damage, this.range);
    }
}

class Q_Lux extends Ability {
    constructor(_owner) {
        var damage = 7; // sát thương ban đầu = 0
        var cooldownTime = 1500;
        var range = 600;
        super(_owner, damage, cooldownTime, range);
    }

    getMovevableObj() {
        return new TroiAnhSanh_Lux(
            this.owner, this.owner.getPosition(),
            this.owner.getDirectionMouse_Vector(),
            this.damage, this.range);
    }
}