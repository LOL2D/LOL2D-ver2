class Ability {
    constructor(_damage, _cooldown) {
        this.damage = _damage; // sát thương gây ra
        this.cooldownTime = _cooldown; // thời gian hồi chiêu (tính bằng milli giây)

        this.lastActivatedTime = millis(); // mốc thời gian dùng chiêu trước đó
    }

    available() {
        return (millis() - this.lastActivatedTime >= this.cooldownTime);
    }
}

// =======================================================================

class Q_Yasuo extends Ability {

    constructor(_owner) {
        var damage = 0;
        var cooldownTime = 1000;
        super(damage, cooldownTime);

        this.owner = _owner;
    }

    active() {
        this.lastActivatedTime = millis();
        return new BaoKiem_Yasuo(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage);
    }

    getRange() {
        return new BaoKiem_Yasuo(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage).range;
    }
}

class R_Jinx extends Ability {
    constructor(_owner) {
        var damage = 0; // sát thương ban đầu = 0
        var cooldownTime = 2000;
        super(damage, cooldownTime);

        this.owner = _owner;
    }

    active() {
        this.lastActivatedTime = millis();
        return new BoomSieuKhungKhiep_Jinx(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage);
    }

    getRange() {
        return new BoomSieuKhungKhiep_Jinx(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage).range;
    }
}

class Q_Lux extends Ability {
	constructor(_owner) {
        var damage = 7; // sát thương ban đầu = 0
        var cooldownTime = 1500;
        super(damage, cooldownTime);

        this.owner = _owner;
    }

    active() {
        this.lastActivatedTime = millis();
        return new TroiAnhSanh_Lux(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage);
    }

    getRange() {
        return new TroiAnhSanh_Lux(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage).range;
    }
}