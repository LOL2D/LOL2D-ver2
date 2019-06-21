let gamemap, camera
let player, players = []
let abilities = []
let images = {
    characters: {},
    others: {}
}

let mobileControl
let isMobile = false

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
        width: 1000,
        height: 1000
    })

    camera = new Camera()

    // Khởi tạo người chơi
    player = new Character({
        champion: CHARACTERS.Yasuo,
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

    players.push(player)

    camera.setTarget(player)

    // thêm máy
    for (let i = 0; i < 2; i++) {
        players.push(new AICharacter({
            champion: CHARACTERS.Yasuo,
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

    // điều khiển cho đt
    // isMobile = mobilecheck()
    mobileControl = new MobileCircleControl({
        radius: 60,
        onChange: function () {
            this.display()

            let velocity = this.getVector().setMag(5)
            player.targetPosition.add(velocity)
        }
    })
}

function draw() {
    background(25)

    isMobile && mouseIsPressed && mobileControl.setHandPosition(mouseX, mouseY)

    camera.beginState()
    camera.follow()

    gamemap.showGrid()
    gamemap.showEdges()

    for (let p of players) {
        p.run()
    }

    for (let ability of abilities) {
        ability.run()
    }

    camera.endState()

    if(random() > 0.99) {
        let speed = 10
        let direction = getVectorDirection({
            fromPosition: players[1].position.copy(),
            toPosition: camera.screenToWorld(mouseX, mouseY),
            mag: speed
        })

        // bắn ra TenLuaDanDaoSieuKhungKhiep
        new Ability({
            owner: players[1],
            info: OBJECTS.TenLuaDanDaoSieuKhungKhiep,
            customInfo: {
                direction: direction,
                position: players[1].position.copy()
            }
        })
    }

    showFrameRate()
}

function mousePressed() {
    if (isMobile) {
        mobileControl.mousePressed()
    } else {
        player.setTargetPosition(camera.screenToWorld(mouseX, mouseY))
    }
}

function mouseReleased() {
    mobileControl.mouseReleased()
}

function keyReleased() {
    if (key == 't' || key == 'T') {
        camera.followTarget = !camera.followTarget
    } else {
        let upperKey = key.toUpperCase()

        player.action(upperKey)
    }

    console.log(key)
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

const vaChamTronTron = function (tron1, tron2) {
    let distance = p5.Vector.dist(tron1.position, tron2.position)
    if (distance < tron1.radius + tron2.radius) {
        return true
    }
    return false
}

const vaChamObjectPlayer = function(obj, playerArr) {
    for (let p of playerArr) {
        if (!p.disable && p != obj.owner) {
            if(vaChamTronTron(p, obj)) {
                return p
            }
        }
    }
    return null
}

// ================== DATABASE ABILITIES ==================
const ABILITIES = {
    Q_Rammus: {
        onBorn: function () {
            this.lifeTime = 5000
            this.bornTime = millis()

            this.maxSpeed = this.owner.getSpeed() * 3

            abilities.push(this)
        },
        onAlive: function () {
            // this.owner.speedUp(0.04)
            let period = millis() - this.bornTime
            let speed = map(period, 0, this.lifeTime, this.owner.defaultSpeed, this.maxSpeed)
            this.owner.setSpeed(speed)

            if (this.owner.getSpeed() > this.owner.defaultSpeed * 2) {
                if (random() > 0.8)
                    new Ability({
                        owner: this.owner,
                        info: EFFECTS.Smoke,
                        customInfo: {
                            lifeTime: random(100, 600)
                        }
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
            this.bornTime = millis()

            this.effectRange = 0
            this.effectRangeMax = 400

            this.targetR = getVectorPosition({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                limit: this.range
            })

            abilities.push(this)
        },
        onAlive: function () {
            let period = millis() - this.bornTime

            // Khi đang dùng chiêu này thì ko thể di chuyển
            this.owner.setSpeed(0)

            // Khi chuẩn bị nhảy
            if (period < this.jumpAt) {
                camera.shake(2)
                this.effectRange = map(period, 0, this.jumpAt, 0, this.effectRangeMax)

                // Khi đang trên không trung
            } else if (period < this.downAt) {
                this.owner.disable = true

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
            return millis() - this.bornTime > this.finishAt
        },
        onFinish: function () {
            this.owner.setSpeed(this.owner.defaultSpeed)
            this.owner.disable = false

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
            let speed = 10
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
            this.bornTime = millis()
            this.lifeTime = 4000
            this.range = 200

            let targetQ = getVectorPosition({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                limit: this.range
            })

            this.owner.position = targetQ
            this.owner.targetPosition = targetQ
            this.owner.invisible = true

            abilities.push(this)
        },
        onAlive: function () {

        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.invisible = false
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    W_Lucian: {
        onBorn: function () {
            // tính hướng bắn
            let speed = 10
            let direction = getVectorDirection({
                fromPosition: this.owner.position.copy(),
                toPosition: camera.screenToWorld(mouseX, mouseY),
                mag: speed
            })

            // bắn ra TenLuaDanDaoSieuKhungKhiep
            new Ability({
                owner: this.owner,
                info: OBJECTS.W_Lucian,
                customInfo: {
                    direction: direction,
                    position: this.owner.position.copy()
                }
            })
        }
    },
    Flash: {
        onBorn: function () {
            this.range = 300
            let direction = p5.Vector.sub(camera.screenToWorld(mouseX, mouseY), this.owner.position)
            direction.limit(this.range)

            // nếu khởi tạo hàm ở trong onBorn này, thì chỉ gọi được trong onBorn này
            function addSmoke(owner, pos, r) {
                new Ability({
                    owner: owner,
                    info: EFFECTS.Smoke,
                    customInfo: {
                        lifeTime: 400,
                        position: pos.copy(),
                        radius: r
                    }
                })
            }

            addSmoke(this.owner, this.owner.position, this.owner.radius)
            this.owner.position.add(direction)
            this.owner.targetPosition = this.owner.position.copy()
            addSmoke(this.owner, this.owner.position, this.owner.radius)
        }
    },
    Teleport: {
        onBorn: function () {
            this.lifeTime = 4000
            this.bornTime = millis()
            this.teleportTarget = camera.screenToWorld(mouseX, mouseY)
            this.targetRadiusMax = 40

            this.angle = 0

            this.showEffectTeleport = function (pos, radius) {
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
            this.bornTime = millis()
            this.owner.setSpeed(this.owner.getSpeed() / 10)

            abilities.push(this)
        },
        onAlive: function () {
        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
        },
        onFinish: function () {
            this.owner.setSpeed(this.owner.defaultSpeed)
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    Smoke: {
        onBorn: function () {
            this.lifeTime = random(500, 2000)
            this.bornTime = millis()

            let r = this.owner.radius
            let randomAdd = createVector(random(-r, r), random(-r, r))
            this.position = this.owner.position.copy().add(randomAdd)
            this.radius = random(10, 30)

            abilities.push(this)
        },
        onAlive: function () {
            let period = millis() - this.bornTime
            let alpha = map(period, 0, this.lifeTime, 255, 0)

            noStroke()
            fill(255, alpha)
            circle(this.position.x, this.position.y, this.radius * 2)

            let r = 3
            this.position.add(random(-r, r), random(-r, r))
            this.radius += 1
        },
        checkFinish: function () {
            return millis() - this.bornTime > this.lifeTime
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
            this.bornTime = millis()

            // khởi tạo hướng
            this.direction = createVector(0, 0)
            this.position = createVector(0, 0)
            this.speed = 0
            this.radius = 25

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
            if (millis() - this.bornTime > this.lifeTime)
                return true

            this.playerTrung = vaChamObjectPlayer(this, players)

            return this.playerTrung
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

            if (this.playerTrung)
                new Ability({
                    owner: this.playerTrung,
                    info: EFFECTS.SlowDown
                })

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
    },
    W_Lucian: {
        onBorn: function () {
            this.lifeRange = 500
            this.bornPosition = this.owner.position.copy()

            // khởi tạo hướng
            this.direction = createVector(0, 0)
            this.position = createVector(0, 0)
            this.speed = 0
            this.radius = 25

            abilities.push(this)
        },
        onAlive: function () {
            // di chuyển theo hướng
            this.position.add(this.direction)

            // hien thi ten lua
            push()
            translate(this.position.x, this.position.y)
            rotate(this.direction.heading())

            image(images.others['locxoay'], 0, 0, this.radius * 2, this.radius * 2)
            pop()
        },
        checkFinish: function () {
            let dist = p5.Vector.dist(this.position, this.bornPosition)
            if (dist > this.lifeRange)
                return true

            this.playerTrung = vaChamObjectPlayer(this, players)

            return this.playerTrung
        },
        onFinish: function () {
            // hiệu ứng nổ 4 hướng
            push()
            translate(this.position.x, this.position.y)
            rotate(this.direction.heading())
            stroke(255)
            strokeWeight(4)
            line(-100, 0, 100, 0)
            line(0, -100, 0, 100)
            pop()


            if (this.playerTrung)
                new Ability({
                    owner: this.playerTrung,
                    info: EFFECTS.SlowDown
                })

            // xoá
            abilities.splice(abilities.indexOf(this), 1)
        }
    },
    No4Huong: {
        onBorn: function() {
            
            // this.position
            // this.range
            // this.radius = 0
        },
        onAlive: function() {

        },
        checkFinish: function() {

        },
        onFinish: function() {

        }
    }
}

const CHARACTERS = {
    Yasuo: {
        pictureName: 'yasuo',
        Q: ABILITIES.W_Lucian,
        W: ABILITIES.Q_Shaco,
        E: ABILITIES.R_Patheon,
        R: ABILITIES.R_Jinx,
        F: ABILITIES.Flash,
        D: ABILITIES.Teleport
    },
    Lux: {
        pictureName: 'yasuo',
        Q: ABILITIES.Q_Rammus,
        W: ABILITIES.Q_Shaco,
        E: ABILITIES.R_Patheon,
        R: ABILITIES.R_Jinx,
        F: ABILITIES.Flash,
        D: ABILITIES.Teleport
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
            radius = 35,
            position = createVector(500, 100),
            name = 'Character',
            movementSpeed = 4,
            champion = {}

        } = config

        this.champion = champion
        this.position = position
        this.radius = radius
        this.name = name
        this.movementSpeed = movementSpeed
        this.defaultSpeed = movementSpeed

        this.targetPosition = position.copy()
        this.lookAtPosition = position.copy()
        this.invisible = false
        this.disable = false

        this.onBorn()
    }

    action(chieuThuc) {
        if(this.champion[chieuThuc]) {
            new Ability({
                owner: this,
                info: this.champion[chieuThuc]
            })
        }
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
        if(this.disable) return

        push()
        translate(this.position.x, this.position.y)

        // vẽ hướng cần tới
        let vectorHuong = p5.Vector.sub(this.targetPosition, this.position)
        stroke(255, 50)
        strokeWeight(1)
        line(0, 0, vectorHuong.x, vectorHuong.y)

        // vẽ hình ảnh
        if (this.invisible) {
            noFill()
            stroke(200, 100)
            strokeWeight(1)
            circle(0, 0, this.radius * 2)

        } else if (this.champion.pictureName) {
            let name = this.champion.pictureName
            image(images.characters[name], 0, 0, this.radius * 2, this.radius * 2)

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

class MobileCircleControl {
    constructor(config = {}) {
        const {
            position = createVector(width / 2, height / 2),
            radius = 50,
            onChange = function () { }
        } = config

        this.position = position
        this.radius = radius
        this.handPosition = this.position.copy().add(10, -10)
        this.buttonRadius = radius / 2.5
        this.onChange = onChange.bind(this)
    }

    display() {
        if (this.controlable) {
            strokeWeight(3)
            stroke(150, 50)
            line(this.position.x, this.position.y, this.handPosition.x, this.handPosition.y)

            noStroke()
            strokeWeight(1)
            fill(150, 50)
            circle(this.position.x, this.position.y, this.radius * 2)
            circle(this.handPosition.x, this.handPosition.y, this.buttonRadius * 2)
        }
    }

    setControlable(value) {
        this.controlable = value
    }

    getVector() {
        let direction = p5.Vector.sub(this.handPosition, this.position)
        let value = map(direction.mag(), 0, this.radius - this.buttonRadius, 0, 1)

        return direction.setMag(value)
    }

    setHandPosition(x, y) {
        if (this.controlable) {
            let direction = p5.Vector.sub(createVector(x, y), this.position)
            let constrain = direction.limit(this.radius - this.buttonRadius)

            this.handPosition = p5.Vector.add(this.position, constrain)
            this.onChange()
        }
        return this
    }

    resetHandPosition() {
        this.handPosition = this.position.copy()
        return this
    }

    isAcceptHandPosition(x, y) {
        return y > height / 2
        // return p5.Vector.dist(this.position, createVector(x, y)) < this.radius
    }

    // for mouse control
    mousePressed() {
        let check = this.isAcceptHandPosition(mouseX, mouseY)
        if (check) {
            this.position = createVector(mouseX, mouseY)
            this.setControlable(check)
        }
    }

    mouseReleased() {
        this.setControlable(false)
    }
}

function mobilecheck() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

window.onload = function () {
    document.addEventListener('contextmenu', e => e.preventDefault());
}