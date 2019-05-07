var player, autoYasuo;
var objects = []; // lưu các vật thể trong game
var images = {};
var hacked = true;

function preload() {
    images.rocket = loadImage('images/rocket2.png');
    images.locxoay = loadImage('images/locXoay.png');
    images.yasuo = loadImage('images/yasuo.png');
    images.jinx = loadImage('images/jinx.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    preventRightClick();

    // khởi tạo
    player = new Jinx("Hoàng đẹp trai", random(width), random(height));
    autoYasuo = new AutoYasuo(random(width), random(height));
}

function draw() {
    background(30);

    player.run();
    autoYasuo.run();

    if (!autoYasuo.died && random(1) > .96) {
        if(autoYasuo.Q.available()) {
            objects.push(autoYasuo.Q.active());
        }
    }

    for (var i = objects.length - 1; i >= 0; i--) {
        objects[i].run();

        if (!(objects[i] instanceof Smoke)) { // không phải khói thì mới cần check
            var ox = objects[i].position.x;
            var oy = objects[i].position.y;
            var or = objects[i].radius;

            var playerPos = player.getPosition();
            var autoYasuoPos = autoYasuo.getPosition();

            if (collideCircleCircle(playerPos.x, playerPos.y, player.radius, ox, oy, or * 2)) {
                objects[i].effect(player);
            }

            if (collideCircleCircle(autoYasuoPos.x, autoYasuoPos.y, autoYasuo.radius, ox, oy, or* 2)) {
                objects[i].effect(autoYasuo);
            }
        }

        if (objects[i].isFinished()) {
            objects.splice(i, 1); // nếu vật thể đã kết thúc -> xóa khỏi mảng
        }
    }

    if (keyIsPressed) {
        showPreviewAbilityWay();
    }

    fill(255);
    text(round(frameRate()), 15, 15);
}

function mouseClicked() {
    // mousePressed();
}

function mousePressed() {
    // if (mouseButton == "right")
    player.setTargetMove(mouseX, mouseY);
}

function showPreviewAbilityWay() {
    var direc = createVector(mouseX - player.position.x, mouseY - player.position.y);
    var r = direc.mag();

    switch (key) {
        case "q":
        case "Q":
            if(player.Q)
                r = player.Q.getRange();
            break;

        case "W":
        case "w":
            if(player.W)
                r = player.W.getRange();
            break;

        case "E":
        case "e":
            if(player.E)
                r = player.E.getRange();
            // statements_1
            break;

        case "R":
        case "r":
            if(player.R)
                r = player.R.getRange();
            break;

        default:
            // statements_def
            break;
    }

    direc.setMag(r);
    direc.add(player.position);

    stroke("#fff9");
    line(player.position.x, player.position.y, direc.x, direc.y);
}

function keyReleased() {
    if (!player.died)
        switch (key) {
            case "Q":
                if (player.Q && player.Q.available()) 
                    objects.push(player.Q.active());
                break;

            case "W":
                if (player.W && player.W.available()) 
                    objects.push(player.W.active());
                break;

            case "E":
                if (player.E && player.E.available()) 
                    objects.push(player.E.active());
                break;

            case "R":
                if (player.R && player.R.available()) 
                    objects.push(player.R.active());
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