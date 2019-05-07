var player; 
var AI_Players = [];
var objects = []; // lưu các vật thể trong game
var images = {};

var hacked = false;
var autoFire = true;
var numOfAI = 1;

function preload() {
    // objects
    images.rocket = loadImage('images/rocket2.png');
    images.locxoay = loadImage('images/locXoay.png');
    images.troiAnhSang = loadImage('images/troiAnhSang.png');

    // nhan vat
    images.yasuo = loadImage('images/yasuo.png');
    images.jinx = loadImage('images/jinx.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    preventRightClick();

    newGame();  
}

function newGame() {
    // khởi tạo
    player = new Jinx("Your Name Here", random(width), random(height));

    AI_Players = [];
    for(var i = 0; i < numOfAI; i++) {
        AI_Players.push(new AutoYasuo(null, random(width), random(height)));
    }
    
}

function draw() {
    background(30);

    player.run();

    // auto play
    for(var a of AI_Players) {
        a.run();

        if (autoFire && random(1) > .95) {
            var rand = random(10);

            if(rand < 2.5) {
                a.Q();

            } else if(rand < 5) {
                a.W();

            } else if(rand < 7.5) {
                a.E();

            } else {
                a.R();
            }
        }
    }

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
            for(var a of AI_Players) {
                var aPos = a.getPosition();
                if (collideCircleCircle(aPos.x, aPos.y, a.radius, ox, oy, or* 2)) {
                    objects[i].effect(a);
                }
            }
        }

        if (objects[i].isFinished()) {
            objects.splice(i, 1); // nếu vật thể đã kết thúc -> xóa khỏi mảng
        }
    }

    if (keyIsPressed) {
        showPreviewAbilityWay();
    }

    if(mouseIsPressed) {
        player.setTargetMove(mouseX, mouseY);
    }

    // Hiện frameRate
    fill(255);
    text(round(frameRate()), 15, 15);
}

function showPreviewAbilityWay() {
    var direc = createVector(mouseX - player.position.x, mouseY - player.position.y);
    var r = direc.mag();
    var strokeW = 1;

    switch (key) {
        case "q":
        case "Q":
            if(player.Qobj){
                var obj = player.Qobj.getMovevableObj();
                strokeW = obj.radius;
                r = obj.range;
            }
            break;

        case "W":
        case "w":
            if(player.Wobj){
                var obj = player.Wobj.getMovevableObj();
                strokeW = obj.radius;
                r = obj.range;
            }
            break;

        case "E":
        case "e":
            if(player.Eobj) {
                var obj = player.Eobj.getMovevableObj();
                strokeW = obj.radius;
                r = obj.range;
            }
            // statements_1
            break;

        case "R":
        case "r":
            if(player.Robj){
                var obj = player.Robj.getMovevableObj();
                strokeW = obj.radius;
                r = obj.range;
            }
            break;

        default:
            // statements_def
            break;
    }

    direc.setMag(r);
    direc.add(player.position);

    stroke("#0006");
    strokeWeight(strokeW * 2);
    line(player.position.x, player.position.y, direc.x, direc.y);
    strokeWeight(1); // reset stroke Weight
}

function keyReleased() {
    if (!player.died)
        switch (key) {
            case "P":
                hacked = !hacked;
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
                // statements_def
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