// canvas
const { body } = document;
const canvas = document.createElement('canvas');
const conText = canvas.getContext('2d');
const width = 500;
const height = 700;
const screenWidth = window.screen.width;
const canvasPosition = (screenWidth / 2) - (width / 2);
const isMobile = window.matchMedia('(max-width: 600px)');
const gameOverElement = document.createElement('div');

// paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDifference = 25;
let paddleBottomX = 225;
let paddleTopX = 225;
let playerMoved = false;
let paddleConTact = false;

// ball
let ballX = 250;
let ballY = 350;
const ballRadius = 5;

// speed
let speedX;
let speedY;
let trajectoryX;
let computerSpeed;

// change mobile-settings
if (isMobile.matches) {
	speedY = -2;
	speedX = speedY;
	computerSpeed = 4;
} else {
	speedY = -1;
	speedX = speedY;
	computerSpeed = 3;
};

// score
let playerScore = 0;
let computerScore = 0;
const winningScore = 7;
let isGameOver = true;
let isNewGame = true;

function renderCanvas() {
	// canvas backGround
	conText.fillStyle = 'black';
	conText.fillRect(0, 0, width, height);

	// paddle-colour
	conText.fillStyle = 'white';

	// player-paddle (bottom)
	conText.fillRect(paddleBottomX, height - 20, paddleWidth, paddleHeight);

	// computer-paddle (top)
	conText.fillRect(paddleTopX, 10, paddleWidth, paddleHeight);

	// dashed--centre-line
	conText.beginPath();
	conText.setLineDash([4]);
	conText.moveTo(0, 350);
	conText.lineTo(500, 350);
	conText.strokeStyle = 'grey';
	conText.stroke();

	// ball
	conText.beginPath();
	conText.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
	conText.fillStyle = 'white';
	conText.fill();

	// score
	conText.font = '32px Courier New';
	conText.fillText(playerScore, 20, canvas.height / 2 + 50);
	conText.fillText(computerScore, 20, canvas.height / 2 - 30);
};

function createCanvas() {
	canvas.setAttribute('width', width);
	canvas.setAttribute('height', height);
	body.appendChild(canvas);
	renderCanvas();
};

// reSet ball to centre
function ballReSet() {
	ballX = width / 2;
	ballY = height / 2;
	speedY = -3;
	paddleConTact = false;
};

// adjust ball-movement
function ballMove() {
	// vertical-speed
	ballY += -speedY;

	// horizontal-speed
	if (playerMoved && paddleConTact) {
		ballX += speedX;
	};
};

// determine what ball bounces off, score points, reSet ball
function ballBoundaries() {
	// bounce-off left wall
	if (ballX < 0 && speedX < 0) {
		speedX = -speedX;
	};

	// bounce-off right wall
	if (ballX > width && speedX > 0) {
		speedX = -speedX;
	};

	// bounce-off player-paddle (bottom)
	if (ballY > height - paddleDifference) {
		if (ballX > paddleBottomX && ballX < paddleBottomX + paddleWidth) {
			paddleConTact = true;

			// add speed on-hit
			if (playerMoved) {
				speedY -= 1;

				// maximum speed
				if (speedY < -5) {
					speedY = -5;
					computerSpeed = 6;
				};
			};

			speedY = -speedY;
			trajectoryX = ballX - (paddleBottomX + paddleDifference);
			speedX = trajectoryX * 0.3;
		} else if (ballY > height) {
			// reSet ball, add to computer-score
			ballReSet();
			computerScore++;
		};
	};

	// bounce-off computer-paddle (top)
	if (ballY < paddleDifference) {
		if (ballX > paddleTopX && ballX < paddleTopX + paddleWidth) {
			// add speed on-hit
			if (playerMoved) {
				speedY += 1;

				// maximum speed
				if (speedY > 5) {
					speedY = 5;
				};
			};

			speedY = -speedY;
		} else if (ballY < 0) {
			// reSet ball, add to player-score
			ballReSet();
			playerScore++;
		};
	};
};

function computerAI() {
	if (playerMoved) {
		if (paddleTopX + paddleDifference < ballX) {
			paddleTopX += computerSpeed;
		} else {
			paddleTopX -= computerSpeed;
		};
	};
};

function showGameOverElement(winner) {
	canvas.hidden = true;
	gameOverElement.textContent = '';
	gameOverElement.classList.add('game-over-container');

	const title = document.createElement('h1');

	title.textContent = `${winner} Win${winner === 'You' ? '' : 's'}`;

	const playAgainButton = document.createElement('button');

	playAgainButton.setAttribute('onclick', 'startGame()');

	playAgainButton.textContent = 'RePlay';

	gameOverElement.append(title, playAgainButton);
	body.appendChild(gameOverElement);
};

function gameOver() {
	if (playerScore === winningScore || computerScore === winningScore) {
		isGameOver = true;

		const winner = playerScore === winningScore ? 'You' : 'Computer';

		showGameOverElement(winner);
	};
};

function animate() {
	renderCanvas();
	ballMove();
	ballBoundaries();
	computerAI();
	gameOver();

	if (!gameOver()) {
		window.requestAnimationFrame(animate);
	};
};

// start game, reSet everyThing
function startGame() {
	if (isGameOver && !isNewGame) {
		body.removeChild(gameOverElement);

		canvas.hidden = false;
	};

	isGameOver = false;
	isNewGame = false;
	playerScore = 0;
	computerScore = 0;
	ballReSet();
	createCanvas();
	animate();

	canvas.addEventListener('mousemove', event => {
		playerMoved = true;
		// compensate for canvas being centred
		paddleBottomX = event.clientX - canvasPosition - paddleDifference;

		if (paddleBottomX < paddleDifference) {
			paddleBottomX = 0;
		};

		if (paddleBottomX > width - paddleWidth) {
			paddleBottomX = width - paddleWidth;
		};

		// hide cursor
		canvas.style.cursor = 'none';
	});
};

// upOn-load
startGame();