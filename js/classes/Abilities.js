class Ability {
    constructor(_owner, _data) {
        this.damage = _data.damage; // sát thương gây ra
        this.cooldownTime = _data.cooldownTime; // thời gian hồi chiêu (tính bằng milli giây)
        this.range = _data.range;

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

    showRange() { // tương tự active() => dùng cho những chiêu tạo ra vật thể Moveable
        var direc = createVector(mouseX - this.owner.position.x, mouseY - this.owner.position.y);
        direc.setMag(this.range);
        direc.add(this.owner.position);

        stroke("#0006");
        strokeWeight(this.getMovevableObj().radius * 2);
        line(this.owner.position.x, this.owner.position.y, direc.x, direc.y);
    }
}

// =======================================================================

class Q_Yasuo extends Ability {
    constructor(_owner) {
    	var data = {
	        damage : 0,
	        cooldownTime : 1000,
	        range : 700
    	}
        super(_owner, data);
    }

    getMovevableObj() {
        return new BaoKiem_Yasuo(
        	this.owner, this.owner.getPosition(), 
        	this.owner.getDirectionMouse_Vector(), 
        	this.damage, this.range);
    }
}

class W_Jinx extends Ability {
	constructor(_owner) {
		var data = {
	        damage : 0,
	        cooldownTime : 1500,
	        range : 2000
    	}
        super(_owner, data);
    }

    getMovevableObj() {
        return new SungDien_Jinx(
            this.owner, this.owner.getPosition(),
            this.owner.getDirectionMouse_Vector(),
            this.damage, this.range);
    }
}

class R_Jinx extends Ability {
    constructor(_owner) {
    	var data = {
	        damage : 0,
	        cooldownTime : 2000,
	        range : 2000
    	}
        super(_owner, data);
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
    	var data = {
	        damage : 7,
	        cooldownTime : 1500,
	        range : 600
    	}
        super(_owner, data);
    }

    getMovevableObj() {
        return new TroiAnhSanh_Lux(
            this.owner, this.owner.getPosition(),
            this.owner.getDirectionMouse_Vector(),
            this.damage, this.range);
    }
}