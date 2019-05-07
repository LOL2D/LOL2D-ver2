var yasuo, autoYasuo;
var objects = []; // lưu các vật thể trong game
var images = {};
var hacked = true;

function preload() {
    images.rocket = loadImage('images/rocket2.png');
    images.locxoay = loadImage('images/locXoay.png');
    images.yasuo = loadImage('images/yasuo.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
    preventRightClick();

    // khởi tạo
    yasuo = new Yasuo(random(width), random(height));
    autoYasuo = new AutoYasuo(random(width), random(height));
}

function draw() {
    background(30);

    yasuo.run();
    autoYasuo.run();

    if (random(1) > .98) {
        if (autoYasuo.Q.available())
            objects.push(autoYasuo.Q.active());
    }

    for (var i = objects.length - 1; i >= 0; i--) {
        objects[i].run();

        if (objects[i].isFinished()) {
            objects.splice(i, 1); // nếu vật thể đã kết thúc -> xóa khỏi mảng
        }
    }

    if(keyIsPressed) {
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
    yasuo.setTargetMove(mouseX, mouseY);
}

function showPreviewAbilityWay() {
    var direc = createVector(mouseX - yasuo.position.x, mouseY - yasuo.position.y);
    var r = direc.mag();

    switch (key) {
        case "q":
        case "Q":
            r = yasuo.Q.getRange();
            break;

        case "W":
        case "w":
            break;

        case "E":
        case "e":
            // statements_1
            break;

        case "R":
        case "r":
            r = yasuo.W.getRange();
            break;

        default:
            // statements_def
            break;
    }

    direc.setMag(r);
    direc.add(yasuo.position);

    stroke("#fff9");
    line(yasuo.position.x, yasuo.position.y, direc.x, direc.y);
}

function keyReleased() {
    switch (key) {
        case "Q":
            if (yasuo.Q.available()) objects.push(yasuo.Q.active());
            break;

        case "W":
            
            break;

        case "E":
            // statements_1
            break;

        case "R":
            if (yasuo.W.available()) objects.push(yasuo.W.active());
            break;

        case "D":
            yasuo.hatTung(500);
            break;

        case "F":
            yasuo.lamCham(.5, 2000);
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