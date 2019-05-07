function menuWhenDie(e) {
    document.getElementById("menuWhenDie").style.display = (e=="open"?"block":"none");
}

window.onload = function() {
	document.getElementById('newGame')
        .addEventListener('click', (e) => {
            // e.target.style.display = 'none';
            menuWhenDie("close");
            newGame();
        });
}