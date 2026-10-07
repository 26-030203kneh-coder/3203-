const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const finalScore = document.getElementById("finalScore");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameRunning = false;
let animationId;

let score = 0;
let highScore = Number(localStorage.getItem("dinoHighScore") || 0);

let gameSpeed = 6;
let obstacleTimer = 0;
let cloudTimer = 0;

highScoreElement.textContent = String(highScore).padStart(5, "0");

// ==========================
// 공룡
// ==========================

const dino = {
    x: 80,
    y: 220,
    width: 42,
    height: 55,

    velocityY: 0,
    gravity: 0.85,
    jumpPower: -15,

    grounded: true,

    jump() {
        if (this.grounded) {
            this.velocityY = this.jumpPower;
            this.grounded = false;
        }
    },

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        const ground = 220;

        if (this.y >= ground) {
            this.y = ground;
            this.velocityY = 0;
            this.grounded = true;
        }
    },

    draw() {
        ctx.fillStyle = "#333";

        // 몸
        ctx.fillRect(this.x + 8, this.y + 18, 28, 35);

        // 머리
        ctx.fillRect(this.x + 20, this.y, 30, 27);

        // 주둥이
        ctx.fillRect(this.x + 42, this.y + 8, 15, 12);

        // 등
        ctx.fillRect(this.x + 3, this.y + 25, 10, 20);

        // 다리
        ctx.fillRect(this.x + 12, this.y + 48, 8, 10);
        ctx.fillRect(this.x + 30, this.y + 48, 8, 10);

        // 꼬리
        ctx.fillRect(this.x - 12, this.y + 25, 20, 7);
        ctx.fillRect(this.x - 18, this.y + 18, 10, 10);

        // 눈
        ctx.fillStyle = "white";
        ctx.fillRect(this.x + 39, this.y + 5, 5, 5);

        ctx.fillStyle = "#111";
        ctx.fillRect(this.x + 41, this.y + 6, 3, 3);

        // 팔
        ctx.fillRect(this.x + 30, this.y + 27, 15, 5);
    }
};

// ==========================
// 장애물
// ==========================

let obstacles = [];

function createObstacle() {
    const type = Math.random();

    let obstacle;

    if (type < 0.5) {
        // 작은 선인장
        obstacle = {
            x: WIDTH + 20,
            y: 230,
            width: 25,
            height: 45,
            type: "small"
        };
    } else if (type < 0.85) {
        // 큰 선인장
        obstacle = {
            x: WIDTH + 20,
            y: 210,
            width: 32,
            height: 65,
            type: "large"
        };
    } else {
        // 선인장 여러 개
        obstacle = {
            x: WIDTH + 20,
            y: 220,
            width: 55,
            height: 55,
            type: "group"
        };
    }

    obstacles.push(obstacle);
}

function drawCactus(obstacle) {
    ctx.fillStyle = "#258f46";

    const x = obstacle.x;
    const y = obstacle.y;

    if (obstacle.type === "small") {
        ctx.fillRect(x + 8, y, 10, obstacle.height);
        ctx.fillRect(x, y + 15, 8, 7);
        ctx.fillRect(x, y + 10, 6, 15);
        ctx.fillRect(x + 18, y + 22, 8, 7);
        ctx.fillRect(x + 20, y + 15, 6, 16);
    }

    if (obstacle.type === "large") {
        ctx.fillRect(x + 11, y, 12, obstacle.height);

        ctx.fillRect(x, y + 20, 11, 8);
        ctx.fillRect(x, y + 13, 7, 20);

        ctx.fillRect(x + 23, y + 28, 11, 8);
        ctx.fillRect(x + 28, y + 20, 7, 20);
    }

    if (obstacle.type === "group") {
        ctx.fillRect(x + 8, y + 10, 10, 45);
        ctx.fillRect(x + 23, y, 12, 55);
        ctx.fillRect(x + 39, y + 15, 10, 40);

        ctx.fillRect(x, y + 25, 9, 7);
        ctx.fillRect(x + 44, y + 28, 11, 7);
    }
}

function updateObstacles() {
    obstacleTimer--;

    if (obstacleTimer <= 0) {
        createObstacle();

        const minimum = 70;
        const maximum = 130;

        obstacleTimer =
            minimum +
            Math.floor(Math.random() * (maximum - minimum));

        // 점점 빨라짐
        obstacleTimer -= Math.min(score / 100, 35);
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// ==========================
// 구름
// ==========================

let clouds = [];

function createCloud() {
    clouds.push({
        x: WIDTH + 50,
        y: 40 + Math.random() * 80,
        width: 70 + Math.random() * 50,
        speed: 1 + Math.random()
    });
}

function updateClouds() {
    cloudTimer--;

    if (cloudTimer <= 0) {
        createCloud();
        cloudTimer = 100 + Math.random() * 180;
    }

    for (let i = clouds.length - 1; i >= 0; i--) {
        clouds[i].x -= clouds[i].speed;

        if (clouds[i].x + clouds[i].width < 0) {
            clouds.splice(i, 1);
        }
    }
}

function drawCloud(cloud) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";

    ctx.beginPath();

    ctx.arc(cloud.x + 20, cloud.y + 15, 18, 0, Math.PI * 2);
    ctx.arc(cloud.x + 40, cloud.y + 8, 23, 0, Math.PI * 2);
    ctx.arc(cloud.x + 65, cloud.y + 17, 17, 0, Math.PI * 2);

    ctx.fillRect(
        cloud.x + 15,
        cloud.y + 15,
        cloud.width - 20,
        20
    );

    ctx.fill();
}

// ==========================
// 충돌
// ==========================

function checkCollision(dino, obstacle) {
    const padding = 7;

    return (
        dino.x + padding < obstacle.x + obstacle.width &&
        dino.x + dino.width - padding > obstacle.x &&
        dino.y + padding < obstacle.y + obstacle.height &&
        dino.y + dino.height > obstacle.y
    );
}

// ==========================
// 배경
// ==========================

function drawBackground() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 하늘
    ctx.fillStyle = "#eaf8ff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // 태양
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.arc(780, 55, 25, 0, Math.PI * 2);
    ctx.fill();

    // 구름
    clouds.forEach(drawCloud);

    // 땅
    ctx.fillStyle = "#555";
    ctx.fillRect(0, 275, WIDTH, 3);

    // 땅 무늬
    ctx.fillStyle = "#777";

    for (let x = 0; x < WIDTH; x += 45) {
        const offset = (Date.now() / 8) % 45;

        ctx.fillRect(
            x - offset,
            285,
            25,
            3
        );
    }
}

// ==========================
// 점수
// ==========================

function updateScore() {
    score += 0.1;

    const displayScore = Math.floor(score);

    scoreElement.textContent =
        String(displayScore).padStart(5, "0");

    // 점수에 따라 속도 증가
    gameSpeed = 6 + Math.floor(score / 100) * 0.5;
}

// ==========================
// 게임 시작
// ==========================

function startGame() {
    score = 0;
    gameSpeed = 6;

    obstacleTimer = 70;
    cloudTimer = 0;

    obstacles = [];
    clouds = [];

    dino.y = 220;
    dino.velocityY = 0;
    dino.grounded = true;

    gameRunning = true;

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    cancelAnimationFrame(animationId);
    gameLoop();
}

// ==========================
// 게임 종료
// ==========================

function gameOver() {
    gameRunning = false;

    const final = Math.floor(score);

    finalScore.textContent = final;

    if (final > highScore) {
        highScore = final;

        localStorage.setItem(
            "dinoHighScore",
            highScore
        );
    }

    highScoreElement.textContent =
        String(highScore).padStart(5, "0");

    gameOverScreen.classList.remove("hidden");
}

// ==========================
// 게임 루프
// ==========================

function gameLoop() {
    if (!gameRunning) return;

    drawBackground();

    updateClouds();
    updateObstacles();

    dino.update();

    // 장애물
    obstacles.forEach(drawCactus);

    // 공룡
    dino.draw();

    // 충돌 체크
    for (const obstacle of obstacles) {
        if (checkCollision(dino, obstacle)) {
            gameOver();
            return;
        }
    }

    updateScore();

    animationId = requestAnimationFrame(gameLoop);
}

// ==========================
// 입력
// ==========================

function jump() {
    if (!gameRunning) return;

    dino.jump();
}

document.addEventListener("keydown", (event) => {
    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {
        event.preventDefault();

        if (!gameRunning) {
            startGame();
        } else {
            jump();
        }
    }
});

canvas.addEventListener("click", () => {
    if (gameRunning) {
        jump();
    }
});

canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();

    if (gameRunning) {
        jump();
    }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// 초기 화면
drawBackground();
dino.draw();
