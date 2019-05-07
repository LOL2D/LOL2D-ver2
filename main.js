var yasuo;
var objects = []; // lưu các vật thể trong game
var images = {};
var hacked = true;

function preload() {
    images.locxoay = loadImage('images/locXoay.png');
    images.yasuo = loadImage('images/yasuo.png');
}

function setup() {
    createCanvas(windowWidth, windowHeight).position(0, 0);
    rectMode(CENTER);
    imageMode(CENTER);

    yasuo = new Yasuo();

    preventRightClick();
}

function draw() {
    background(30);

    yasuo.run();

    for (var i = objects.length - 1; i >= 0; i--) {
        objects[i].run();

        if (objects[i].isFinished()) {
            objects.splice(i, 1); // nếu vật thể đã kết thúc -> xóa khỏi mảng
        }
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

function keyPressed() {
    switch (key) {
        case "Q":
            objects.push(new LocXoay_Yasuo(yasuo.getPosition(), yasuo.getDirectionMouse_Vector(), hacked));
            break;

        case "W":
            // statements_1
            break;

        case "E":
            // statements_1
            break;

        case "R":
            // statements_1
            break;

        case "D":
            // statements_1
            break;

        case "F":
            // statements_1
            break;

        default:
            // statements_def
            break;
    }

    console.log(key);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true);
}

function preventRightClick() {
    document.getElementsByTagName("canvas")[0].addEventListener('contextmenu', function(evt) {
        evt.preventDefault();
    }, false);
}