function menuWhenDie(e) {
    document.getElementById("menuWhenDie").style.display = (e=="open"?"block":"none");
}

function checkNewGame() {
	var haveLife = false;
	for(var a of AI_Players) {
		if(!a.died) {
			haveLife = true;
			break;
		}
	}

	if(player.died || !haveLife) {
		menuWhenDie('open');
	}
}

window.onload = function() {
	document.getElementById('newGame')
        .addEventListener('click', (e) => {
            menuWhenDie("close");
            newGame();
        });
}