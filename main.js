
let player

function setup() {
    createCanvas(windowWidth, windowHeight)

    player = new Character({
        name: 'Hoang'
    })
}

function draw() {
    background(30)

    player.display()
}



// class MoveableObject {
//     constructor() {

//     }
// }

class Character {
    constructor(config = {}) {

        let { 
            radius = 100, 
            position = createVector(500, 100),
            name = 'Character'
        } = config

        this.position = position
        this.radius = radius
        this.name = name

        console.log(this.name)
    }

    display() {
        fill(255)
        noStroke()
        circle(this.position.x, this.position.y, this.radius * 2)
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