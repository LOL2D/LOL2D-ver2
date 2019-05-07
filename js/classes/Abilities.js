class Ability {
	constructor(_damage, _cooldown, _keycode) {
		this.cooldown = _cooldown; // thời gian hồi chiêu (tính bằng milli giây)
		// this.damage = _damage; // sát thương gây ra

		this.remainingCooldownTime = 0; // thời gian hồi chiêu còn lại (khi đang trong quá trình hồi chiêu)
		this.keycode = _keycode; // nút kích hoạt chiêu này
	}

	run() {
		if(keyIsDown(this.key)) { // nếu nút kích hoạt đang được ấn thì activate
			this.activate();
		}
	}

	activate() {
		if(this.remainingCooldownTime <= 0) { // nếu không trong khoảng thời gian hồi chiêu thì mới hành động

		}
	}

	setKey(_keycode) {
		this.keycode = _keycode;
	}
}

