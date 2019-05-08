var player;
var AI_Players = [];
var objects = []; // lưu các vật thể trong game
var images = {};
var loading;

var hacked = false; // hiện đường đạn
var autoFire = true; // máy tự động bắn
var numOfAI = 2; // số lượng máy

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(16);
    preventRightClick();

    loadImages(); // load các hình
    loading = new Loading(30, 10, "#0f0");
}

function draw() {
    background(20);

    if (!checkLoad()) { // khi chưa load xong hình thì hiện loading
        loading.run();

    } else if (!player) { // ngược lại, nếu đã load xong hết thì new Game
        menuWhenDie('open');

        noStroke();
        fill(200);
        text("Vui lòng tắt Unikey TIẾNG VIÊT để trải nghiệm game tốt hơn", width * .5, height * .5 + 40);

    } else {
        // vẽ và check các objects
        for (var i = objects.length - 1; i >= 0; i--) {
            objects[i].run();

            if (!(objects[i] instanceof Smoke)) { // không phải khói thì mới cần check
                var ox = objects[i].position.x;
                var oy = objects[i].position.y;
                var or = objects[i].radius;

                var playerPos = player.getPosition();
                if (collideCircleCircle(playerPos.x, playerPos.y, player.radius, ox, oy, or * 2)) {
                    objects[i].effect(player);
                }

                // duyệt qua mảng tướng máy
                for (var a of AI_Players) {
                    if (!a.died) {
                        var aPos = a.getPosition();
                        if (collideCircleCircle(aPos.x, aPos.y, a.radius, ox, oy, or * 2)) {
                            objects[i].effect(a);
                        }
                    }
                }
            }

            // nếu vật thể đã kết thúc -> xóa khỏi mảng
            if (objects[i].isFinished()) {
                objects[i].finished = true;
                objects.splice(i, 1);
            }
        }

        if (mouseIsPressed) {
            player.setTargetMove(mouseX, mouseY);
        }

        // vẽ nhân vật
        player.run();
        showPreviewAbilityWay();

        // auto play
        for (var a of AI_Players) {
            a.run();

            if (autoFire && random(1) > .95) {
                var rand = random(10);

                if (rand < 2.5) a.Q();
                else if (rand < 5) a.W();
                else if (rand < 7.5) a.E();
                else a.R();

            }
        }
    }

    // Hiện frameRate
    fill(255);
    noStroke();
    text(round(frameRate()), 15, 15);
}

function keyReleased() {
    if (player && !player.died)
        switch (key) {
            case "P":
                hacked = !hacked;
                break;
            case "O":
                autoFire = !autoFire;
                break;
            case "Q":
                player.Q();
                break;
            case "W":
                player.W();
                break;
            case "E":
                player.E();
                break;
            case "R":
                player.R();
                break;
            case "D":
                break;
            case "F":
                break;
            default:
                break;
        }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
}

function preventRightClick() {
    document.getElementsByTagName("canvas")[0].addEventListener('contextmenu', function(evt) {
        evt.preventDefault();
    }, false);
}

// ===========================================
function loadImages() {
    // objects
    images.rocket = loadImage('images/rocket2.png');
    images.locxoay = loadImage('images/locXoay.png');
    images.troiAnhSang = loadImage('images/troiAnhSang.png');
    images.banTay = loadImage('images/bantay.png');

    // nhan vat
    images.yasuo = loadImage('images/yasuo.png');
    images.jinx = loadImage('images/jinx.png');
    images.blitzcrank = loadImage('images/blitzcrank.png');
}

function checkLoad() { // hàm check xem các images đã được load hết chưa
    return images.rocket && images.locxoay && images.troiAnhSang &&
        images.yasuo && images.jinx && images.banTay && images.blitzcrank;
}

function newGame() {
    // khởi tạo
    player = new Jinx("Jinx Best", random(width), random(height));

    AI_Players = [];
    for (var i = 0; i < numOfAI; i++) {
        var rand = random(10);
        if (rand < 3) {
            AI_Players.push(new AutoYasuo(random(width), random(height)));
        } else if (rand < 7) {
            AI_Players.push(new AutoBlitz(random(width), random(height)));
        } else {
            AI_Players.push(new AutoJinx(random(width), random(height)));
        }
    }
}

function showPreviewAbilityWay() {
    if (keyIsDown(81))
        player.Qabi && player.Qabi.showRange();
    else if (keyIsDown(87))
        player.Wabi && player.Wabi.showRange();
    else if (keyIsDown(69))
        player.Eabi && player.Eabi.showRange();
    else if (keyIsDown(82))
        player.Rabi && player.Rabi.showRange();
}