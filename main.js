let gamemap, camera
let player, comps = []
let abilities = []
let images = {
    characters: {},
    others: {}
}

function preload() {
    images.characters['yasuo'] = loadImage('./images/character/yasuo.png')
    images.characters['jinx'] = loadImage('./images/character/jinx.png')
    images.characters['blitzcrank'] = loadImage('./images/character/blitzcrank.png')

    images.others['rocket'] = loadImage('./images/rocket2.png')
    images.others['locxoay'] = loadImage('./images/locXoay.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    imageMode(CENTER)
    rectMode(CENTER)

    gamemap = new GameMap({
        width: 5000,
        height: 5000
    })

    camera = new Camera()

    // Khởi tạo người chơi
    player = new Character({
        picture: images.characters['jinx'],
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
}

function draw() {
    background(25)

    camera.beginState()
    camera.follow()

    gamemap.showGrid()
    gamemap.showEdges()

    player.run()

    for (let comp of comps) {
        comp.run()
    }

    for (let ability of abilities) {
        ability.run()
    }

    camera.endState()

    showFrameRate()
}

function mousePressed() {
    player.setTargetPosition(camera.screenToWorld(mouseX, mouseY))
}

function keyReleased() {
    if (key == 'f' || key == 'F') {
        new Ability({
            owner: player,
            info: ABILITIES.Flash
        })

    } else if (key == 'd' || key == 'D') {
        new Ability({
            owner: player,
            info: ABILITIES.Teleport
        })

    } else if (key == 'q' || key == 'Q') {
        new Ability({
            owner: player,
            info: ABILITIES.Q_Shaco
        })
    } else if (key == 'w' || key == 'W') {

    } else if (key == 'e' || key == 'E') {
        new Ability({
            owner: player,
            info: ABILITIES.R_Patheon
        })
    } else if (key == 'r' || key == 'R') {
        new Ability({
            owner: player,
            info: ABILITIES.R_Jinx
        })

    } else if (key == 't' || key == 'T') {
        camera.followTarget = !camera.followTarget
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

const showFrameRate = function () {
    fill(255)
    noStroke()
    text(~~frameRate(), 10, 10)
}

const getVectorDirection = function (config = {}) {
    const {
        toPosition = createVector(0, 0),
        fromPosition = createVector(0, 0),
        limit = null,
        mag = null
    } = config

    let direction = p5.Vector.sub(toPosition, fromPosition)

    let addValue = createVector(0, 0)
    if (limit) addValue = direction.limit(limit)
    if (mag) addValue = direction.setMag(mag)

    return addValue
}

const getVectorPosition = function (config = {}) {
    const {
        fromPosition
    } = config

    return fromPosition.copy().add(getVectorDirection(config))
}

// ================== DATABASE ABILITIES ==================
const ABILITIES = {
    Q_Rammus: {
        onBorn: function () {
            this.lifeTime = 5000
            this.bornTime = millis()

            abilities.push(this)
        },
        onAlive: function () {
            this.owner.speedUp(0.04)

            if (this.owner.getSpeed() > this.owner.defaultSpeed * 2) {
                if (random() > 0.8)
                    new Ability({
                        owner: this.owner,
                        info: EFFECTS.Smoke
                    })
            }

        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.setSpeed(this.owner.defaultSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    R_Patheon: {
        onBorn: function () {
            this.range = 3000

            this.jumpAt = 1000
            this.downAt = 2000
            this.finishAt = 3100
            this.timeBorn = millis()

            this.effectRange = 0
            this.effectRangeMax = 200

            this.targetR = getVectorPosition({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                limit: this.range
            })

            abilities.push(this)
        },
        onAlive: function () {
            let period = millis() - this.timeBorn

            // Khi đang dùng chiêu này thì ko thể di chuyển
            this.owner.setSpeed(0)

            // Khi chuẩn bị nhảy
            if (period < this.jumpAt) {
                camera.shake(2)
                this.effectRange = map(period, 0, this.jumpAt, 0, this.effectRangeMax)

                // Khi đang trên không trung
            } else if (period < this.downAt) {
                this.owner.invisible = true

                let newScale = map(period, this.jumpAt, this.downAt, 1, .4)
                camera.setScale(newScale)

                // Khi đang rơi xuống
            } else if (period < this.finishAt) {
                let newScale = map(period, this.downAt, this.finishAt, .4, 1)
                camera.setScale(newScale)

                this.owner.position = this.targetR.copy()
                this.owner.targetPosition = this.targetR.copy()

                camera.shake(5)
            }

            // vẽ vùng ảnh hưởng
            noFill()
            stroke(255, 100)
            strokeWeight(1)
            circle(this.targetR.x, this.targetR.y, this.effectRange * 2)
        },
        checkFinish: function () {
            return millis() - this.timeBorn > this.finishAt
        },
        onFinish: function () {
            this.owner.setSpeed(this.owner.defaultSpeed)
            this.owner.invisible = false

            let r = this.effectRangeMax

            // tạo khói trong vùng ảnh hưởng
            for (let i = 0; i < 15; i++) {

                // lấy 1 vị trí ngẫu nhiên trong vùng ảnh hưởng
                let randomVecInRange = createVector(random(-r, r), random(-r, r))
                let randomPosInRange = this.owner.position.copy().add(randomVecInRange)

                // khói sống lâu hay ko phụ thuộc khoảng cách từ vị trí tìm được tới tâm ảnh hưởng
                let distance = p5.Vector.dist(this.targetR, randomPosInRange)
                let life_time = map(distance, 0, this.effectRangeMax, 100, 1500)

                // tạo khói với những customInfo vừa tính
                new Ability({
                    owner: this.owner,
                    info: EFFECTS.Smoke,
                    customInfo: {
                        position: randomPosInRange,
                        radius: random(10, 20),
                        lifeTime: life_time
                    }
                })
            }

            camera.setScale(1)

            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    R_Jinx: {
        onBorn: function () {
            // tính hướng bắn
            let speed = 15
            let direction = getVectorDirection({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                mag: speed
            })

            // bắn ra TenLuaDanDaoSieuKhungKhiep
            new Ability({
                owner: this.owner,
                info: OBJECTS.TenLuaDanDaoSieuKhungKhiep,
                customInfo: {
                    direction: direction,
                    position: this.owner.position.copy()
                }
            })
        }
    },
    Q_Shaco: {
        onBorn: function () {
            this.timeBorn = millis()
            this.lifeTime = 4000
            this.range = 200

            let targetQ = getVectorPosition({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                limit: this.range
            })

            this.owner.position = targetQ
            this.owner.targetPosition = targetQ
            this.owner.setSpeed(this.owner.getSpeed() + 1)
            this.owner.invisible = true

            abilities.push(this)
        },
        onAlive: function () {

        },
        checkFinish: function () {
            return millis() - this.timeBorn > this.lifeTime
        },
        onFinish: function () {
            this.owner.invisible = false
            this.owner.setSpeed(this.owner.defaultSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    Flash: {
        onBorn: function () {
            this.range = 300
            let direction = p5.Vector.sub(camera.screenToWorld(mouseX, mouseY), this.owner.position)
            direction.limit(this.range)

            this.owner.position.add(direction)
            this.owner.targetPosition = this.owner.position.copy()
        }
    },
    Teleport: {
        onBorn: function () {
            this.lifeTime = 4000
            this.bornTime = millis()
            this.teleportTarget = camera.screenToWorld(mouseX, mouseY)
            this.targetRadiusMax = 40

            this.angle = 0

            this.showEffectTeleport = function(pos, radius) {
                push()
                translate(pos.x, pos.y)
                rotate(this.angle)
                noFill()
                strokeWeight(5)
                stroke('#1d2c5e')
                ellipse(0, 0, radius * 1.5, radius * 3)
                ellipse(0, 0, radius * 3, radius * 1.5)
                pop()
            }

            this.owner.setSpeed(0)
            abilities.push(this)
        },
        onAlive: function () {
            let period = millis() - this.bornTime
            let radius = map(period, 0, this.lifeTime, this.targetRadiusMax, 10)
            let rotateSpeed = map(period, 0, this.lifeTime, 0, PI / 5)
            this.angle += rotateSpeed

            // vị trí tới
            this.showEffectTeleport(this.teleportTarget, radius)

            // vị trí người chơi
            this.showEffectTeleport(this.owner.position, radius)
        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.position = this.teleportTarget.copy()
            this.owner.targetPosition = this.teleportTarget.copy()
            this.owner.setSpeed(this.owner.defaultSpeed)

            abilities.splice(abilities.indexOf(this), 1)
        }
    }
}

const EFFECTS = {
    SlowDown: {
        onBorn: function () {
            this.lifeTime = 3000
            this.oldSpeed = this.owner.getSpeed()
            this.bornTime = millis()
            this.owner.setSpeed(this.oldSpeed / 10)

            abilities.push(this)
        },
        onAlive: function () {
        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.setSpeed(this.oldSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    Smoke: {
        onBorn: function () {
            this.lifeTime = random(500, 2000)
            this.timeBorn = millis()

            let r = this.owner.radius
            let randomAdd = createVector(random(-r, r), random(-r, r))
            this.position = this.owner.position.copy().add(randomAdd)
            this.radius = random(10, 30)

            abilities.push(this)
        },
        onAlive: function () {
            let period = millis() - this.timeBorn
            let alpha = map(period, 0, this.lifeTime, 255, 0)

            noStroke()
            fill(255, alpha)
            circle(this.position.x, this.position.y, this.radius * 2)

            let r = 3
            this.position.add(random(-r, r), random(-r, r))
            this.radius += 1
        },
        checkFinish: function () {
            return millis() - this.timeBorn > this.lifeTime
        },
        onFinish: function () {
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    Force: {
        onBorn: function () {
            this.position = createVector(0, 0)
            this.range = 100
        }
    }
}

const OBJECTS = {
    TenLuaDanDaoSieuKhungKhiep: {
        onBorn: function () {
            this.lifeTime = 10000
            this.timeBorn = millis()

            // khởi tạo hướng
            this.direction = createVector(0, 0)
            this.position = createVector(0, 0)
            this.speed = 0
            this.radius = 25

            // camera.setTarget(this)

            abilities.push(this)
        },
        onAlive: function () {
            // di chuyển theo hướng
            this.position.add(this.direction)

            // hien thi ten lua
            push()
            translate(this.position.x, this.position.y)
            rotate(this.direction.heading())

            image(images.others['rocket'], 0, 0, this.radius * 2, this.radius * 2)
            pop()

            // tạo khói ở đuôi
            if (random() > 0.5) {
                let dir = this.direction.copy().setMag(this.radius)
                let pos = this.position.copy().sub(dir)

                new Ability({
                    owner: this.owner,
                    info: EFFECTS.Smoke,
                    customInfo: {
                        position: pos,
                        radius: random(this.radius / 2, this.radius),
                        lifeTime: random(200, 700)
                    }
                })
            }
        },
        checkFinish: function () {
            return millis() - this.timeBorn > this.lifeTime
        },
        onFinish: function () {
            // hiệu ứng nổ
            for (let i = 0; i < 10; i++) {

                let r = this.radius * 2
                let newPosition = this.position.copy().add(random(-r, r), random(-r, r))

                new Ability({
                    owner: this.owner,
                    info: EFFECTS.Smoke,
                    customInfo: {
                        position: newPosition,
                        radius: random(10, 30),
                        lifeTime: random(500, 1300)
                    }
                })
            }

            // xoá
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    TroiAnhSanh: {
        onBorn: function () {
            // khởi tạo hướng
        },
        onAlive: function () {
            // di chuyển theo hướng
            // hien thi trói ánh sáng
        },
        checkFinish: function () {
            // check trung ai chua
        },
        onFinish: function () {
            // hiệu ứng trói
        }
    }
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

        this.onBorn = onBorn
        this.onAlive = onAlive
        this.onFinish = onFinish
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
        this.defaultSpeed = movementSpeed

        this.targetPosition = position.copy()
        this.lookAtPosition = position.copy()
        this.invisible = false

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

    showLookAtDirection() {
        // vẽ hướng nhìn
        push()
        translate(this.position.x, this.position.y)
        rotate(this.getLookAtAngle())
        stroke(255)
        strokeWeight(2)
        line(0, 0, this.radius, 0)
        pop()
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

        // vẽ hướng cần tới
        let vectorHuong = p5.Vector.sub(this.targetPosition, this.position)
        stroke(255, 50)
        strokeWeight(1)
        line(0, 0, vectorHuong.x, vectorHuong.y)

        // vẽ hình ảnh
        if(this.invisible) {
            noFill()
            stroke(200, 100)
            strokeWeight(1)
            circle(0, 0, this.radius * 2)
            
        } else if (this.picture) {
            image(this.picture, 0, 0, this.radius * 2, this.radius * 2)

        } else {
            fill(100)
            noStroke()
            circle(0, 0, this.radius * 2)
        }
        pop()

        this.showLookAtDirection()
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

            let bound = gamemap.getBound()

            let x = random(bound.left + this.radius, bound.right - this.radius)
            let y = random(bound.top + this.radius, bound.bottom - this.radius)

            this.targetPosition = createVector(x, y)
        }
    }
}

class Ability extends EventableClass {
    constructor(config = {}) {
        const {
            owner,
            info,
            customInfo = {}
        } = config

        super(info)
        this.owner = owner

        this.onBorn()

        for (let custom in customInfo) {
            this[custom] = customInfo[custom]
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

    shake(value) {
        this.position.add(random(-value, value), random(-value, value))
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

window.onload = function () {
    document.addEventListener('contextmenu', e => e.preventDefault());
}