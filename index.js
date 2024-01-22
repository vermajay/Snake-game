//html elements
const board = document.getElementById('game-board');
const instructionText = document.getElementById('instruction-text');
const logo = document.getElementById('logo');
const score = document.getElementById('score');
const highScoreText = document.getElementById('highScore');

//game variables
const gridSize = 20;
let snake = [{x:10, y:10}];
let food = generateFood();
let highScore = 0;
let direction = 'right';
let gameInterval;
let gameStarted = false;
let gameSpeedDelay = 200;
let mySound;
let myMusic;

//draw game, map, snake
function draw(){
    board.innerHTML = '';
    drawSnake();
    drawFood();
    updateScore();
}

//draw snake
function drawSnake(){
    snake.forEach(segment => {
        const snakeElement = createGameElement('div', 'snake');
        setPosition(snakeElement, segment);
        board.appendChild(snakeElement);
    })
}

//create a snake or food div
function createGameElement(tag, className){
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

//set position of snake element or food div
function setPosition(element, position){
    element.style.gridColumn = position.x;
    element.style.gridRow = position.y;
}

//draw food function
function drawFood(){
    if(!gameStarted) return;
    const foodElement = createGameElement('div', 'food');
    const image = createGameElement('img', 'apple');
    foodElement.appendChild(image);
    setPosition(foodElement, food);
    board.appendChild(foodElement);
}

//generate food position
function generate(){
    x = Math.floor(Math.random() * gridSize) + 1;
    y = Math.floor(Math.random() * gridSize) + 1;
    return {x,y};
}
function generateFood(){
    let flag;
    let temp;
    
    do {
        flag = false;
        temp = generate();
        for(let i=0; i<snake.length; i++){
            if(temp.x === snake[i].x && temp.y === snake[i].y){
                flag = true;
                break;
            }
        }  
    } while (flag === true);

    return temp;
}

//moving the snake
function move(){
    const head = {...snake[0]};
    switch (direction) {
        case 'right':
            head.x++;
            break;
        case 'left':
            head.x--;
            break;
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
    }

    snake.unshift(head);

    //snake eats apple
    if(head.x === food.x && head.y === food.y){
        mySound.play();
        increaseSpeed();
        food = generateFood();
        clearInterval(gameInterval);    // clear past interval
        gameInterval = setInterval(()=>{
            move();
            checkCollision();
            draw();
        }, gameSpeedDelay);
    }
    else{
        snake.pop();
    }
}

//start game function
function startGame(){
    gameStarted = true;  //keep track of the running game
    instructionText.style.display = "none";
    logo.style.display = "none";
    mySound = new sound("assets/eat.mp3");
    myMusic = new sound("assets/bg_music.mp3");
    myMusic.play();
    gameInterval = setInterval(()=>{
        move();
        checkCollision();
        draw();
    }, gameSpeedDelay);
}

//keypress event listener
function handleKeyPress(event){
    if((!gameStarted && event.code === 'Space') || (!gameStarted && event.key === ' ')){
        startGame();
    }
    else{
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
        }
    }
}

document.addEventListener('keydown', handleKeyPress);

function increaseSpeed(){
    if(gameSpeedDelay > 150){
        gameSpeedDelay -= 3;
    }
    else if(gameInterval > 100){
        gameSpeedDelay -= 2;
    }
    else if(gameInterval > 25){
        gameSpeedDelay -= 1;
    }
}

function checkCollision(){
    const head = snake[0];

    if(head.x < 1 || head.x > gridSize || head.y < 1 || head.y > gridSize){
        resetGame();
    }
    for(let i=1; i<snake.length; i++){
        if(head.x === snake[i].x && head.y === snake[i].y){
            resetGame();
        }
    }
}

function resetGame(){
    stopGame();
    myMusic.stop();
    updateHighScore();

    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = 'right';
    gameSpeedDelay = 200;
    updateScore();
}

function updateScore(){
    const currentScore = snake.length - 1;
    score.textContent = currentScore.toString().padStart(3, '0');
}

function stopGame(){
    clearInterval(gameInterval);
    gameStarted = false;
    instructionText.style.display = 'block';
    logo.style.display = 'block';
}

function updateHighScore(){
    const currentScore = snake.length - 1;
    if(currentScore > highScore){
        highScore = currentScore;
        highScoreText.textContent = highScore.toString().padStart(3, '0');
        highScoreText.style.display = 'block';
    }
}

class sound {
    constructor(src) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function () {
            this.sound.pause();
        };
    }
}