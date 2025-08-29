let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

let bird;
let hasLanded = false;
let hasBumped = false;
let isGameStarted = false;
let messageToPlayer;
let cursors;
let enterKey;
let score = 0;
let scoreText;
let startX = 0;
let roadHeight = 64; // Altura del suelo (ajustable según imagen)

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('road', 'assets/road.png');
  this.load.image('column', 'assets/column.png');
  this.load.spritesheet('bird', 'assets/bird.png', {
    frameWidth: 64,
    frameHeight: 96
  });
}

function create() {
  hasLanded = false;
  hasBumped = false;
  isGameStarted = false;
  score = 0;

  const background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background').setOrigin(0, 0);

  const roads = this.physics.add.staticGroup();
  const road = roads.create(400, 568, 'road').setScale(2).refreshBody();
  
  // Calcular el top del suelo
  const roadTopY = road.y - road.displayHeight / 2


  // Columnas superiores
  const topColumns = this.physics.add.staticGroup({
    key: 'column',
    repeat: 2,
    setXY: { x: 200, y: 0, stepX: 300 }
  });


  // Crear columnas inferiores con alturas aleatorias
  const bottomColumns = this.physics.add.staticGroup({
   key: 'column',
    repeat: 2,
    setXY: { x: 350, y: 450, stepX: 300 },
  });


  bird = this.physics.add.sprite(0, 50, 'bird').setScale(2);
  bird.setBounce(0.2);
  bird.setCollideWorldBounds(true);
  startX = bird.x;

  this.physics.add.collider(bird, roads, () => hasLanded = true);
  this.physics.add.collider(bird, topColumns, () => hasBumped = true);
  this.physics.add.collider(bird, bottomColumns, () => hasBumped = true);

  cursors = this.input.keyboard.createCursorKeys();
  enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

  // Mensaje en la parte inferior - Message in the bottom
  messageToPlayer = this.add.text(this.scale.width / 2, this.scale.height - 50, 'Press SPACE to start', {
    fontFamily: '"Comic Sans MS", Times, serif',
    fontSize: "24px",
    color: "#ffffff",
    backgroundColor: "#f3e308ff"
  }).setOrigin(0.5);

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#fff'
  });
}

function update() {
  // Iniciar juego con ESPACIO - Star the game with SPACE
  if (Phaser.Input.Keyboard.JustDown(cursors.space) && !isGameStarted) {
    isGameStarted = true;
    messageToPlayer.setText('Press UP to fly. Avoid columns and ground.');
  }

  // Movimiento y puntaje por distancia - Moving and score
  if (isGameStarted && !hasLanded && !hasBumped) {
    if (cursors.up.isDown) {
      bird.setVelocityY(-160);
    }
    bird.setVelocityX(50);
    score = Math.floor(bird.x - startX);
    scoreText.setText('Score: ' + score);
  } else {
    bird.setVelocityX(0);
  }

  // Colisión - Crash
  if (hasLanded || hasBumped) {
    messageToPlayer.setText('Oh no! You crashed!\nPress ENTER to restart');
  }

  // Victoria -Win
  if (bird.x > this.scale.width - 50) {
    bird.setVelocityY(40);
    messageToPlayer.setText('Congrats! You won!\nPress ENTER to restart');
  }

  // Reiniciar con ENTER
  if ((hasLanded || hasBumped || bird.x > this.scale.width - 50) && Phaser.Input.Keyboard.JustDown(enterKey)) {
    this.scene.restart();
  }
}