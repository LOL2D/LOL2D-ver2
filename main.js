var yasuo, autoYasuo;
var objects = []; // lưu các vật thể trong game
var images = {};
var hacked = false;

function preload() {
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

    if(random(1) > .98) 
        objects.push(autoYasuo.Q());

    for (var i = objects.length - 1; i >= 0; i--) {
        objects[i].run();

        if (objects[i].isFinished()) {
            objects.splice(i, 1); // nếu vật thể đã kết thúc -> xóa khỏi mảng
        }
    }

    // if(random(1) > .95) 
    //     objects.push(new LocXoay_Yasuo(createVector(random(width), random(height)), p5.Vector.random2D(), hacked));

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
            objects.push(yasuo.Q());
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
            yasuo.hatTung(500);
            break;

        case "F":
            yasuo.lamCham(.5, 2000);
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