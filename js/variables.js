var sceneManager; // biến Scene manager quản lý các scenes của game

var player; // người chơi

var AI_Players = []; // máy chơi
var numOfAI = 5; // số lượng máy
var autoFire = true; // máy tự động bắn

var objects = []; // lưu các vật thể trong game
var images = {}; // các hình ảnh cần cho game

var gamemap; // biến bản đồ
var viewport; // biến theo dõi - tầm nhìn

var hacked = false; // hiện đường đạn

window.onload = function() {
    document.getElementById('newGame')
        .addEventListener('click', (e) => {
        	// nếu vào game thì mở scene Game
            menuWhenDie("close");

            newGame(); // ván mới
            sceneManager.showScene(Game);
        });
}

function newGame() {
    // khởi tạo
    gamemap = new GameMap(2000, 2000, 250);

    player = getRandomCharacter();
    objects = [];
    AI_Players = [];
    for (var i = 0; i < numOfAI; i++) {
        AI_Players.push(getRandomCharacter(true));
    }

    viewport = new ViewPort(player);
}

function checkNewGame() {
    var haveLife = false;
    for (var a of AI_Players) {
        if (!a.died) {
            haveLife = true;
            break;
        }
    }

    if (player.died || !haveLife) {
    	// nếu chết thì mở lại scene Loading
        menuWhenDie('open');
        // sceneManager.showScene( Loading );
    }
}

function getRandomCharacter(_isAuto) {
    var names = ["Yasuo", "Blitzcrank", "Jinx", "Lux"];
    var randomName = names[floor(random(names.length))];
    if (_isAuto) {
        return eval("new Auto" + randomName + "(null, random(gamemap.width), random(gamemap.height))");
    }
    return eval("new " + randomName + "('" + randomName + "', random(gamemap.width), random(gamemap.height))");
}

function menuWhenDie(e) {
    document.getElementById("menuWhenDie").style.display = (e == "open" ? "block" : "none");
}
