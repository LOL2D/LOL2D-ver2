let gamemap, camera
let objects = []

let player
let comps = []
let abilities = []
let images = {
    characters: {},
    moveableObjects: {}
}


function preload() {
    images.characters['yasuo'] = loadImage('./images/character/yasuo.png')
    images.characters['jinx'] = loadImage('./images/character/jinx.png')
    images.characters['blitzcrank'] = loadImage('./images/character/blitzcrank.png')

    images.moveableObjects['rocket'] = loadImage('./images/rocket2.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    imageMode(CENTER)
    rectMode(CENTER)

    gamemap = new GameMap({
        width: 10000,
        height: 10000
    })

    camera = new Camera()

    // Khởi tạo người chơi
    player = new Character({
        picture: images.characters['yasuo'],
        onBorn: function () {
        },
        onAlive: function () {
            this.lookAt(camera.screenToWorld(mouseX, mouseY))
            this.move()
            this.collideBound({
                bound: gamemap.getBound()
            })
            this.showTargetPosition()
            this.show()
        }
    })

    camera.setTarget(player)

    // thêm máy
    for (let i = 0; i < 2; i++) {
        comps.push(new AICharacter({
            picture: randomProperty(images.characters),
            position: createVector(random(width), random(height)),
            onAlive: function () {
                this.move()
                this.collideBound({
                    bound: gamemap.getBound()
                })
                this.show()
            }
        }))
    }

    new Ability({
        owner: player,
        info: EFFECTS.SlowDown //ABILITIES.Q_Rammus
    })
}

function draw() {
    background(25)

    camera.beginState()
    camera.follow()

    gamemap.showGrid()
    gamemap.showEdges()

    player.run()

    for(let ability of abilities) {
        ability.run()
    }

    for (let comp of comps) {
        comp.run()
    }

    // for (let o of objects) {
    //     o.move()
    //     o.show()
    // }

    camera.endState()
}

function mousePressed() {
    player.setTargetPosition(camera.screenToWorld(mouseX, mouseY))
}

function keyPressed() {
    if (key == 'q' || key == 'Q') {

        let mouse = camera.screenToWorld(mouseX, mouseY)

        // create new rocket
        let vel = p5.Vector.sub(createVector(mouse.x, mouse.y), player.position)
        vel.setMag(15)

        objects = [];
        objects.push(new MoveableObject({
            picture: images.moveableObjects['rocket'],
            position: player.position.copy(),
            velocity: vel
        }))
    }
}

function mouseWheel(e) {
    let currentScale = camera.getScale()
    let newScale = currentScale - e.delta / 700

    if (newScale > 0)
        camera.setScale(newScale)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true)
}

const randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return obj[keys[keys.length * Math.random() << 0]];
}

// =========================================
// ============= CLASSES ===================
// =========================================
class EventableClass {
    constructor(config = {}) {
        const {
            onBorn = function () { },
            onAlive = function () { },
            onFinish = function () { },
            checkFinish = function () { }
        } = config

        this.onBorn = onBorn //.bind(this)
        this.onAlive = onAlive //.bind(this)
        this.onFinish = onFinish //.bind(this)
        this.checkFinish = checkFinish
    }

    run() {
        this.onAlive()
        this.checkFinish() && this.onFinish()
    }
}

class Character extends EventableClass {
    constructor(config = {}) {
        super(config)

        let {
            picture,
            radius = 35,
            position = createVector(500, 100),
            name = 'Character',
            movementSpeed = 4

        } = config

        this.picture = picture
        this.position = position
        this.radius = radius
        this.name = name
        this.movementSpeed = movementSpeed

        this.targetPosition = position.copy()
        this.lookAtPosition = position.copy()

        this.onBorn()
    }

    getSpeed() {
        return this.movementSpeed
    }

    setSpeed(speed) {
        this.movementSpeed = speed
    }

    speedUp(v) {
        this.movementSpeed += v
    }

    lookAt(x, y) {
        if (x instanceof p5.Vector) {
            this.lookAtPosition = x
        } else {
            this.lookAtPosition = createVector(x, y)
        }
    }

    getLookAtAngle() {
        let direction = p5.Vector.sub(this.lookAtPosition, this.position)
        return direction.heading()
    }

    setTargetPosition(x, y) {
        if (x instanceof p5.Vector) {
            this.targetPosition = x
        } else {
            this.targetPosition = createVector(x, y)
        }
    }

    showTargetPosition() {
        fill(0, 255, 0)
        circle(this.targetPosition.x, this.targetPosition.y, 15)
    }

    move() {
        let distance = p5.Vector.dist(this.targetPosition, this.position)

        if (distance > this.movementSpeed) {
            let direction = p5.Vector.sub(this.targetPosition, this.position)
            let speed = direction.setMag(this.movementSpeed)
            this.position.add(speed)

            return true
        }

        return false
    }

    show() {
        push()
        translate(this.position.x, this.position.y)

        if (this.picture) {
            image(this.picture, 0, 0, this.radius * 2, this.radius * 2)

        } else {
            fill(100)
            noStroke()
            circle(0, 0, this.radius * 2)
        }

        // vẽ hướng nhìn
        rotate(this.getLookAtAngle())
        stroke(255)
        strokeWeight(2)
        line(0, 0, this.radius, 0)

        pop()
    }

    collideBound(config = {}) {
        const {
            bound = {},
            callBack = function () { }
        } = config

        const {
            top = -Infinity,
            bottom = Infinity,
            left = -Infinity,
            right = Infinity
        } = bound

        let isCollided = false

        if (this.position.x < left + this.radius) {
            this.position.x = left + this.radius
            isCollided = true
        }
        if (this.position.x > right - this.radius) {
            this.position.x = right - this.radius
            isCollided = true
        }
        if (this.position.y < top + this.radius) {
            this.position.y = top + this.radius
            isCollided = true
        }
        if (this.position.y > bottom - this.radius) {
            this.position.y = bottom - this.radius
            isCollided = true
        }

        if (isCollided) {
            callBack()
        }
    }
}

class AICharacter extends Character {
    constructor(config = {}) {
        super(config)
    }

    move() {
        if (!super.move()) {
            let x = random(width - this.radius * 2) + this.radius
            let y = random(height - this.radius * 2) + this.radius
            this.targetPosition = createVector(x, y)
        }
    }
}

class Ability extends EventableClass {
    constructor(config = {}) {
        const {
            owner,
            info
        } = config

        super(info)

        this.owner = owner
        this.info = info

        this.onBorn()
    }
}

class MoveableObject {
    constructor(config = {}) {
        const {
            position = createVector(0, 0),
            velocity = createVector(0, 0),
            radius = 30,
            picture
        } = config

        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.picture = picture
    }

    move() {
        this.position.add(this.velocity)
    }

    show() {
        if (this.picture) {

            push()
            translate(this.position.x, this.position.y)
            rotate(this.velocity.heading())
            image(this.picture, 0, 0, this.radius * 2, this.radius * 2)

            pop()

        } else {
            fill(255)
            noStroke()
            circle(this.position.x, this.position.y, this.radius * 2)
        }
    }
}

class GameMap {
    constructor(config = {}) {

        const {
            position,
            width = 500,
            height = 500,
            gridSize = 250
        } = config

        this.position = position || createVector(width * .5, height * .5)
        this.width = width
        this.height = height
        this.gridSize = gridSize
    }

    showEdges(config = {}) {

        const {
            strokeColor = '#fffa',
            strokeWeightValue = 1
        } = config

        push()
        translate(this.position.x - this.width * .5, this.position.y - this.height * .5)

        stroke(strokeColor)
        strokeWeight(strokeWeightValue)
        line(0, 0, this.width, 0)
        line(0, 0, 0, this.height)
        line(0, this.height, this.width, this.height)
        line(this.width, 0, this.width, this.height)

        pop()
    }

    showGrid(config = {}) {
        const {
            edges = this.getBound(),
            color = "#5556",
            strokeWeightValue = 3
        } = config

        let left = max(edges.left, this.position.x - this.width / 2)
        let right = min(edges.right, this.position.x + this.width / 2)
        let top = max(edges.top, this.position.y - this.height / 2)
        let bottom = min(edges.bottom, this.position.y + this.height / 2)

        stroke(color);
        strokeWeight(strokeWeightValue);
        var delta = 1;

        for (var x = left; x < right; x += delta) {
            if (floor(x) % this.gridSize == 0) {
                /* while you find 1 x%this.gridSize==0 
                => delta will equal this.gridSize => shorter loop */
                delta = this.gridSize;
                line(x, top, x, bottom);
            }
        }

        // do the same thing to y axis
        delta = 1;
        for (var y = top; y < bottom; y += delta) {
            if (floor(y) % this.gridSize == 0) {
                delta = this.gridSize;
                line(left, y, right, y);
            }
        }
    }

    getBound() {
        const { x, y } = this.position
        let w1 = this.width * .5
        let h1 = this.height * .5

        return {
            top: y - h1,
            bottom: y + h1,
            left: x - w1,
            right: x + w1
        }
    }
}

class Camera {
    constructor(config = {}) {

        const {
            position = createVector(0, 0), // vị trí camera
            target = { // target là 1 vật thể, có chứa thuộc tính position bên trong
                position: createVector(0, 0)
            },
            followTarget = true, // di chuyển camera theo target hay không
            followSpeed = 0.1,
            scale = 1,
            borderSize = 30,
            constrainBound = {
                top: -Infinity,
                bottom: Infinity,
                left: -Infinity,
                right: Infinity
            }
        } = config

        this.position = position
        this.target = target
        this.followTarget = followTarget
        this.followSpeed = followSpeed
        this.scale = scale
        this.borderSize = borderSize
        this.constrainBound = constrainBound
    }

    beginState() { // Bắt đầu translate - push
        push()
        translate(width * .5, height * .5)
        scale(this.scale)
        translate(-this.position.x, -this.position.y)
    }

    endState() { // Kết thúc việc translate - pop
        pop()
    }

    follow(config = {}) {
        if (this.followTarget) {
            const {
                timeScale = 1,
                target = this.target,
                followSpeed = this.followSpeed,
                isConstrain = false
            } = config

            this.position = p5.Vector.lerp(this.position, target.position, followSpeed * timeScale)

            if (isConstrain) {
                const { left, right, top, bottom } = this.constrainBound

                this.position.x = constrain(this.position.x, left, right)
                this.position.y = constrain(this.position.y, top, bottom)
            }

        } else if (mouseX > width - this.borderSize || mouseX < this.borderSize ||
            mouseY > height - this.borderSize || mouseY < this.borderSize) {

            var vec = createVector(mouseX - width / 2, mouseY - height / 2).setMag(30);
            this.position.add(vec);

            // noStroke();
            // fill(200, 20);
            // var r = this.borderSize;
            // if (mouseY < r) rect(width / 2, r / 2, width, r); // top
            // if (mouseY > height - r) rect(width / 2, height - r / 2, width, r); // down
            // if (mouseX < r) rect(r / 2, height / 2, this.borderSize, height); // left
            // if (mouseX > width - r) rect(width - r / 2, height / 2, r, height); // right
        }
    }

    setTarget(newTarget) {
        this.target = newTarget
        return this
    }

    setScale(scaleValue) {
        this.scale = scaleValue
        return this
    }

    getScale() {
        return this.scale
    }

    getBound() {
        let { x, y } = this.position
        let dx = width / 2 / this.scale
        let dy = height / 2 / this.scale
        return {
            left: x - dx,
            right: x + dx,
            top: y - dy,
            bottom: y + dy
        }
    }

    // Chuyển đổi vị trí thực của vật thể (theo hệ toạ độ của mapgame) về vị trí trên màn hình (theo hệ toạ độ màn hình)
    worldToScreen(worldX, worldY) {
        let screenX = (worldX - this.position.x) * this.scale + width * .5
        let screenY = (worldY - this.position.y) * this.scale + height * .5
        return createVector(screenX, screenY)
    }

    // Ngược lại worldToScreen
    screenToWorld(screenX, screenY) {
        let worldX = (screenX - width * .5) / this.scale + this.position.x
        let worldY = (screenY - height * .5) / this.scale + this.position.y
        return createVector(worldX, worldY)
    }
}


// ================== DATABASE ABILITIES ==================
const ABILITIES = {
    Q_Rammus: {
        onBorn: function () {
            this.lifeTime = 5000
            this.oldSpeed = this.owner.getSpeed()
            this.bornTime = millis()

            abilities.push(this)
        },
        onAlive: function () {
            this.owner.speedUp(0.04)
        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.setSpeed(this.oldSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    R_Patheon: {
        onBorn: function () {
            this.bornTime = millis()
        },
        onAlive: function () {

        },
        checkFinish: function () {

        },
        onFinish: function () {

        }
    },
    W_Yasuo: {

    }
}

const EFFECTS = {
    SlowDown: {
        onBorn: function() {
            this.lifeTime = 3000
            this.oldSpeed = this.owner.getSpeed()
            this.bornTime = millis()
            this.owner.setSpeed(this.oldSpeed / 10)

            abilities.push(this)
        },
        onAlive: function() {
        },
        checkFinish: function() {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.setSpeed(this.oldSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    }
}

const OBJECTS = {
    TuongGio: {

    }
}