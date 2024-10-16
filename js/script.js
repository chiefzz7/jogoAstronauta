const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let astronaut = {
    x: 50,
    y: canvas.height - 140,
    width: 100,
    height: 140,
    velocityY: 0,
    jumpPower: 10,
    isJumping: false,
    energy: 120,
    jumpsLeft: 5
};

let asteroids = [];
let stars = [];
let score = 0;
let highScores = [];
let playerNames = [];
let isGameOver = false;

const astronautImage = new Image();
astronautImage.src = "C:/Users/samuel.sramos4/Desktop/teste222/img/astronauta.png";

const asteroidImage = new Image();
asteroidImage.src = "C:/Users/samuel.sramos4/Desktop/teste222/img/asteroid.png";

let imagesLoaded = 0;
const totalImages = 2;

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        document.getElementById('start').style.display = 'block';
    }
}

astronautImage.onload = imageLoaded;
asteroidImage.onload = imageLoaded;

const phrases = [
    "Você trabalha em uma empresa que está perdendo muitos funcionários, e o clima está pesado. Como fazer para motivar a equipe e manter as pessoas na empresa? <br> Para aprender a resolver situações como essa, busque o envelope de charadas na cor <strong>laranja</strong>.",

    "A empresa onde você trabalha está crescendo, mas os custos estão aumentando rápido demais. O desafio é encontrar formas de reduzir gastos sem prejudicar a qualidade do trabalho. <br> Para aprender a resolver situações como essa, busque o envelope de charadas na cor <strong>azul</strong>.",

    "Uma nova loja acaba de abrir, mas poucas pessoas sabem que ela existe. Como fazer com que mais gente conheça e se interesse pela loja? <br> Para aprender a resolver situações como essa, busque o envelope de charadas na cor <strong>amarela</strong>.",

    "Você faz parte de uma equipe que precisa organizar a entrega de muitos produtos para clientes em diferentes cidades, mas há atrasos frequentes. Como melhorar o processo para garantir que tudo chegue no prazo? <br>Para aprender a resolver situações como essa, busque o envelope de charadas na cor <strong>preta</strong>."
];

function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5
        });
    }
}

function drawStars() {
    ctx.fillStyle = "white";
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.x -= star.speed;
        if (star.x < 0) star.x = canvas.width;
    });
}

function startGame() {
    const playerName = document.getElementById('playerName').value;
    if (!playerName) {
        alert("Por favor, digite seu nome!");
        return;
    }
    if (highScores.some(player => player.name === playerName)) {
        alert("Esse nome já está no ranking. Escolha outro nome!");
        return;
    }
    
    playerNames.push(playerName);
    document.getElementById('start').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    isGameOver = false;
    score = 0;
    asteroids = [];
    astronaut.energy = 120;
    astronaut.jumpsLeft = 5;
    createStars();
    updateRanking();
    requestAnimationFrame(updateGame);
    spawnAsteroids();
}

function spawnAsteroids() {
    setInterval(() => {
        if (!isGameOver) {
            let asteroid = {
                x: canvas.width,
                y: Math.random() * (canvas.height - 60),
                width: 40,
                height: 40,
                speed: 5 + Math.floor(score / 20)
            };
            asteroids.push(asteroid);
        }
    }, 1000);
}

function updateGame() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    astronaut.y += astronaut.velocityY;
    if (astronaut.y + astronaut.height < canvas.height) {
        astronaut.velocityY += 0.5;
    } else {
        astronaut.y = canvas.height - astronaut.height;
        astronaut.velocityY = 0;
        astronaut.isJumping = false;
        recoverEnergy();
        astronaut.jumpsLeft = 5;
    }

    updateAsteroids();
    checkCollisions();
    updateScore();
    updateEnergyBar();

    requestAnimationFrame(updateGame);
}

function updateAsteroids() {
    asteroids.forEach((asteroid, index) => {
        asteroid.x -= asteroid.speed;
        if (asteroid.x + asteroid.width < 0) {
            asteroids.splice(index, 1);
            if (score > 20) {
                score += 2;
            } else {
                score += 1;
            }
        }
    });
}

function checkCollisions() {
    asteroids.forEach((asteroid) => {
        let buffer = 35; // Ajuste de margem para melhorar a precisão
        if (
            astronaut.x < asteroid.x + asteroid.width - buffer &&
            astronaut.x + astronaut.width > asteroid.x + buffer &&
            astronaut.y < asteroid.y + asteroid.height - buffer &&
            astronaut.y + astronaut.height > asteroid.y + buffer
        ) {
            gameOver();
        }
    });
}

function gameOver() {
    isGameOver = true;
    document.getElementById('gameOverPhrase').innerText = phrases[Math.floor(Math.random() * phrases.length)];
    document.getElementById('gameOver').style.display = 'block';
    saveHighScore();
    updateRanking();
}

function saveHighScore() {
    highScores.push({ name: playerNames[playerNames.length - 1], score: score });
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
}

function updateRanking() {
    const rankingElement = document.getElementById('ranking');
    rankingElement.innerHTML = "<h2>Ranking Galáctico</h2>";
    highScores.forEach((player, index) => {
        rankingElement.innerHTML += `<p>${index + 1}. ${player.name}: ${player.score}</p>`;
    });
}

function recoverEnergy() {
    if (astronaut.energy < 120) {
        astronaut.energy += 1;
    }
}

function jump() {
    if (astronaut.jumpsLeft > 0 && astronaut.energy > 0) {
        astronaut.velocityY = -astronaut.jumpPower;
        astronaut.isJumping = true;
        astronaut.energy -= 10;
        astronaut.jumpsLeft--;
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('start').style.display = 'block';
    playerNames.pop();
    isGameOver = false;
}

function updateScore() {
    document.getElementById('score').innerText = `Pontuação: ${score}`;
    if (score > 20 && (score - 20) % 10 === 0) {
        asteroids.forEach(asteroid => {
            asteroid.speed += 1;
        });
    }
}

function updateEnergyBar() {
    const energyFill = document.getElementById('energyFill');
    energyFill.style.width = `${(astronaut.energy / 120) * 100}%`;
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
    }
});

function resizeCanvas() {
    const ratio = 4 / 3;
    let newWidth = window.innerWidth * 0.8;
    let newHeight = newWidth / ratio;
    if (newHeight > window.innerHeight * 0.8) {
        newHeight = window.innerHeight * 0.8;
        newWidth = newHeight * ratio;
    }
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();