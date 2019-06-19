let gamemap, camera

let moveable

let player
let comps = []
let images = {}

function preload() {
    images['yasuo'] = loadImage('./images/character/yasuo.png')
    images['jinx'] = loadImage('./images/character/jinx.png')
    images['blitzcrank'] = loadImage('./images/character/blitzcrank.png')

    images['rocket'] = loadImage('./images/rocket2.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    imageMode(CENTER)
    rectMode(CENTER)

    moveable = new MoveableObject({
        picture: images['rocket'],
        position: createVector(100, 100),
        velocity: createVector(6, -2)
    })

    gamemap = new GameMap({
        width: 10000,
        height: 10000
    })

    // Khởi tạo người chơi
    player = new Character({
        name: 'Hoang Yasuo',
        picture: images['yasuo'],
        position: createVector(100, 100),
        radius: 35
    })

    camera = new Camera({
        target: player
    })

    // thêm máy
    let jinx = new AICharacter({
        name: 'Giang Jinx',
        picture: images['jinx'],
        position: createVector(random(width), random(height)),
        radius: 35,
        movementSpeed: 2
    })

    comps.push(jinx)
}

function draw() {
    background(30)

    camera.beginState()
    camera.follow()

    gamemap.displayEdges({
        strokeColor: '#5f5',
        strokeWeightValue: 2
    })
    gamemap.displayGrid()

    moveable.move()
    moveable.display()

    player.move()
    player.collideEdges({
        edges: gamemap.getBound()
    })
    player.display()

    for (let comp of comps) {
        comp.move()
        comp.collideEdges({
            edges: gamemap.getBound()
        })
        comp.display()
    }

    camera.endState()
}

function mousePressed() {
    let mouse = camera.screenToWorld(mouseX, mouseY)
    player.setTargetPosition(mouse.x, mouse.y)

    let vel = p5.Vector.sub(createVector(mouse.x, mouse.y), player.position)
    vel.setMag(15)

    moveable = new MoveableObject({
        picture: images['rocket'],
        position: player.position.copy(),
        velocity: vel
    })
}

function mouseWheel(e) {
    let currentScale = camera.getScale()
    let newScale = currentScale + e.delta / 700

    if(newScale > 0)
        camera.setScale(newScale)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight, true)
}

// =========================================
// ============= CLASSES ===================
// =========================================

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

        if (distance > this.movementSpeed) {
            let direction = p5.Vector.sub(this.targetPosition, this.position)
            let speed = direction.setMag(this.movementSpeed)
            this.position.add(speed)

            return true
        }

        return false
    }

    display() {
        // toạ độ cần tới
        fill(255, 0, 0)
        circle(this.targetPosition.x, this.targetPosition.y, 15)

        // hiển thị
        if (this.picture) {
            image(this.picture, this.position.x, this.position.y, this.radius * 2, this.radius * 2)

        } else {
            fill(255)
            noStroke()
            circle(this.position.x, this.position.y, this.radius * 2)
        }
    }

    collideEdges(config = {}) {
        const {
            edges = {},
            callBack = function () { }
        } = config

        const {
            top = -Infinity,
            bottom = Infinity,
            left = -Infinity,
            right = Infinity
        } = edges

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
            this.targetPosition = createVector(random(width), random(height))
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

	displayEdges(config = {}) {
		
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

	displayGrid(config = {}) {
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
		let x = this.position.x
		let y = this.position.y
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
		let {x, y} = this.position
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

class Ability {

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

    display() {
        if(this.picture) {
            
            push()
            translate(this.position.x, this.position.y)
            rotate(this.velocity.heading())
            image(this.picture, 0, 0, this.radius * 2, this.radius * 2)

            pop()

        } else {
            fill(255)
            noStroke()
            circle(this.position.x, this.position/y, this.radius * 2)
        }
    }
}

class Q_Lux extends MoveableObject {
    constructor(config = {}) {
        super(config)
    }
}