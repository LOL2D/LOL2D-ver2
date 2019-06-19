let player
let comps = []
let images = {}

function preload() {
    images['yasuo'] = loadImage('./images/character/yasuo.png')
    images['jinx'] = loadImage('./images/character/jinx.png')
    images['blitzcrank'] = loadImage('./images/character/blitzcrank.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    imageMode(CENTER)

    // Khởi tạo người chơi
    player = new Character({
        name: 'Hoang Yasuo',
        picture: images['yasuo'],
        position: createVector(random(width), random(height)),
        radius: 35
    })

    // thêm máy
    let jinx = new Character({
        name: 'Giang Jinx',
        picture: images['jinx'],
        position: createVector(random(width), random(height)),
        radius: 35
    })

    comps.push(jinx)
}

function draw() {
    background(30)

    player.move()
    player.display()

    for(let comp of comps) {
        comp.move()
        comp.display()
    }
}

function mousePressed() {
    player.setTargetPosition(mouseX, mouseY)
}


class Character {
    constructor(config = {}) {

        let { 
            picture, 
            radius = 100, 
            position = createVector(500, 100),
            name = 'Character',
            movementSpeed = 5

        } = config

        this.picture = picture
        this.position = position
        this.radius = radius
        this.name = name
        this.movementSpeed = movementSpeed

        this.targetPosition = position.copy()
    }

    setTargetPosition(x, y) {
        this.targetPosition = createVector(x, y)
    }

    move() {
        let distance = p5.Vector.dist(this.targetPosition, this.position)

        if(distance > this.movementSpeed) {
            let direction = p5.Vector.sub(this.targetPosition, this.position)
            let value = direction.setMag(this.movementSpeed)
            this.position.add(value)
        }
    }

    display() {
        // toạ độ cần tới
        fill(255, 0, 0)
        circle(this.targetPosition.x, this.targetPosition.y, 15)

        // hiển thị
        if(this.picture) {
            image(this.picture, this.position.x, this.position.y, this.radius * 2, this.radius * 2)

        } else {
            fill(255)
            noStroke()
            circle(this.position.x, this.position.y, this.radius * 2)
        }
    }
}

class Camera {
    constructor() {

    }
}

class MapGame {
    constructor() {

    }
}