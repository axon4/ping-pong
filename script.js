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
let isSinglePlayer;
let socket;
let isReferee = false;

// paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDifference = 25;
let paddleX = [255, 255];
let paddleIndex = 0;
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
let opponentScore = 0;
const winningScore = 7;
let isGameOver = true;
// let isNewGame = false;

function renderGameMode() {
	canvas.hidden = true;
	gameOverElement.textContent = '';
	gameOverElement.classList.add('game-over-container');

	const title = document.createElement('h1');
	title.textContent = 'Ping-Pong';

	const singlePlayerButton = document.createElement('button');
	singlePlayerButton.setAttribute('onclick', 'loadGame("single")');
	singlePlayerButton.style.margin = '8px 0';
	singlePlayerButton.textContent = 'Single-Player';

	const multiPlayerButton = document.createElement('button');
	multiPlayerButton.setAttribute('onclick', 'loadGame("multi")');
	multiPlayerButton.style.margin = '8px 0';
	multiPlayerButton.textContent = 'Multi-Player';

	gameOverElement.append(title, singlePlayerButton, multiPlayerButton);
	body.appendChild(gameOverElement);
};

function renderWaiting() {
	// canvas backGround
	conText.fillStyle = 'black';
	conText.fillRect(0, 0, width, height);

	// waiting-text
	conText.fillStyle = 'white';
	conText.font = '32px Courier New';
	conText.fillText('awaiting opponent...', 20, (canvas.height / 2) - 30);
	conText.fillText('connecting to socket...', 20, (canvas.height / 2) - 60);
};

function renderCanvas() {
	// canvas backGround
	conText.fillStyle = 'black';
	conText.fillRect(0, 0, width, height);

	// paddle-colour
	conText.fillStyle = 'white';

	// player-paddle (bottom)
	conText.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

	// computer/opponent paddle (top)
	conText.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

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
	conText.fillText(opponentScore, 20, canvas.height / 2 - 30);
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

	if (!isSinglePlayer) {
		socket.emit('ballMove', {
			x: ballX,
			y: ballY,
			playerScore,
			opponentScore
		});
	};
};

// adjust ball-movement
function ballMove() {
	// vertical-speed
	ballY += -speedY;

	// horizontal-speed
	if (playerMoved && paddleConTact) {
		ballX += speedX;
	};

	if (!isSinglePlayer) {
		socket.emit('ballMove', {
			x: ballX,
			y: ballY,
			playerScore,
			opponentScore
		});
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
		if (ballX > paddleX[0] && ballX < paddleX[0] + paddleWidth) {
			paddleConTact = true;

			// add speed on-hit
			if (playerMoved) {
				speedY -= 1;

				// maximum speed
				if (speedY < -5) {
					speedY = -5;

					if (isSinglePlayer) computerSpeed = 6;
				};
			};

			speedY = -speedY;
			trajectoryX = ballX - (paddleX[0] + paddleDifference);
			speedX = trajectoryX * 0.3;
		} else if (ballY > height) {
			// reSet ball, add to computer-score
			ballReSet();
			opponentScore++;
		};
	};

	// bounce-off computer/opponent paddle (top)
	if (ballY < paddleDifference) {
		if (ballX > paddleX[1] && ballX < paddleX[1] + paddleWidth) {
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
		if (paddleX[1] + paddleDifference < ballX) {
			paddleX[1] += computerSpeed;
		} else {
			paddleX[1] -= computerSpeed;
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
	playAgainButton.setAttribute('onclick', 'loadGame("single")');
	playAgainButton.textContent = 'RePlay';

	gameOverElement.append(title, playAgainButton);
	body.appendChild(gameOverElement);
};

function gameOver() {
	if (playerScore === winningScore || opponentScore === winningScore) {
		isGameOver = true;

		const winner = playerScore === winningScore ? 'You' : 'Computer';

		showGameOverElement(winner);
	};
};

function animate() {
	if (isReferee) {
		ballMove();
		ballBoundaries();
	};

	renderCanvas();
	gameOver();

	if (isSinglePlayer) computerAI();

	if (!gameOver()) {
		window.requestAnimationFrame(animate);
	};
};

// load game, reSet everyThing
function loadGame(gameMode) {
	if (gameMode === 'single') {
		isSinglePlayer = true;

		startGame();
	} else {
		socket = io('http://localhost:3001');

		socket.on('connect', () => {
			console.log('connected to server as:', socket.id);
		});

		socket.on('start', refereeID => {
			console.log('referee:', refereeID);

			isReferee = socket.id === refereeID;

			startGame();
		});

		socket.emit('ready');
	};

	if (isGameOver /* && !isNewGame */) {
		body.removeChild(gameOverElement);

		canvas.hidden = false;
	};

	isGameOver = false;
	// isNewGame = false;
	playerScore = 0;
	opponentScore = 0;
	ballReSet();
	createCanvas();

	if (!isSinglePlayer) renderWaiting();
};

// start game
function startGame() {
	paddleIndex = isReferee ? 0 : 1;

	animate();

	canvas.addEventListener('mousemove', event => {
		playerMoved = true;
		// compensate for canvas being centred
		paddleX[paddleIndex] = event.clientX - canvasPosition - paddleDifference;

		if (paddleX[paddleIndex] < paddleDifference) {
			paddleX[paddleIndex] = 0;
		};

		if (paddleX[paddleIndex] > width - paddleWidth) {
			paddleX[paddleIndex] = width - paddleWidth;
		};

		// hide cursor
		canvas.style.cursor = 'none';

		if (!isSinglePlayer) {
			socket.emit('paddleMove', {x: paddleX[paddleIndex]});
		};
	});

	if (!isSinglePlayer) {
		socket.on('paddleMove', paddle => {
			const opponentPaddleIndex = 1 - paddleIndex;

			paddleX[opponentPaddleIndex] = paddle.x;
		});

		socket.on('ballMove', ball => {
			({ x: ballX, y: ballY, playerScore, opponentScore } = ball);
		});
	};
};

// upOn-load
renderGameMode();