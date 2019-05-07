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
        var damage = 10;
        var cooldownTime = 500;
        super(damage, cooldownTime);

        this.owner = _owner;
    }

    active() {
        this.lastActivatedTime = millis();
        return new LocXoay_Yasuo(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage);
    }

    getRange() {
        return new LocXoay_Yasuo(this.owner, this.owner.getPosition(), this.owner.getDirectionMouse_Vector(), this.damage).range;
    }
}

class R_Jinx extends Ability {
    constructor(_owner) {
        var damage = 0; // sát thương ban đầu = 0
        var cooldownTime = 500;
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