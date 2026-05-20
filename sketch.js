// ============================================================
// Platformer: Custom Textures & Elevator Mechanic
// ============================================================

let bgImage;
let playerSprite;
let platformTexture;

// ------------------------------------------------------------
// PLATFORMS ARRAY
// ------------------------------------------------------------
let platforms = [
  // Ground floor
  { x: 0, y: 410, w: 800, h: 40, type: "normal" },

  // Re-positioned regular platforms
  { x: 60, y: 320, w: 120, h: 16, type: "normal" },
  { x: 240, y: 250, w: 140, h: 16, type: "normal" },
  { x: 450, y: 310, w: 120, h: 16, type: "normal" },

  // --- OUR SPECIAL ELEVATOR PLATFORM ---
  // startY stores the resting position so it knows where to bounce around.
  // timer keeps track of the wave animation.
  {
    x: 640,
    y: 220,
    startY: 220,
    w: 110,
    h: 16,
    type: "elevator",
    timer: 0,
    isMoving: false,
  },
];

// ------------------------------------------------------------
// PLAYER OBJECT
// ------------------------------------------------------------
let player = {
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  r: 20,
  speed: 0.55,
  maxSpeed: 4.5,
  jumpForce: -12,
  friction: 0.78,
  onGround: false,
};

const GRAVITY = 0.6;
const PLATFORM_COLOR = [255, 160, 50];

// ============================================================
// setup() & preload()
// ============================================================
function preload() {
  // Ensure these paths match your local folder structure
  bgImage = loadImage("assets/images/background.png");
  playerSprite = loadImage("assets/images/character.png");
  platformTexture = loadImage("assets/images/texture.jpg");
}

function setup() {
  createCanvas(800, 450);
  // Place player on top of the ground platform
  player.y = platforms[0].y - player.r;
}

// ============================================================
// draw() loop
// ============================================================
function draw() {
  // Draw Background Image
  image(bgImage, 0, 0, width, height);

  handleInput();
  applyPhysics();
  updateMovingPlatforms(); // Updates elevator Y position
  resolvePlatformCollisions();

  drawPlatforms();
  drawPlayer();
  drawHUD();
}

// ------------------------------------------------------------
// MECHANICS & LOGIC
// ------------------------------------------------------------

function handleInput() {
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.vx -= player.speed;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.vx += player.speed;

  player.vx = constrain(player.vx, -player.maxSpeed, player.maxSpeed);

  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) {
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

function applyPhysics() {
  player.vy += GRAVITY;
  player.x += player.vx;
  player.y += player.vy;

  player.x = constrain(player.x, player.r, width - player.r);

  if (player.y > height + 100) {
    player.x = 100;
    player.y = platforms[0].y - player.r;
    player.vx = 0;
    player.vy = 0;
  }

  player.onGround = false;
}

function updateMovingPlatforms() {
  for (let p of platforms) {
    if (p.type === "elevator" && p.isMoving) {
      p.timer += 0.05; // Speed of oscillation
      // Smooth up/down movement using sine wave
      p.y = p.startY + sin(p.timer) * 40;
    }
  }
}

function resolvePlatformCollisions() {
  for (let p of platforms) {
    let playerLeft = player.x - player.r;
    let playerRight = player.x + player.r;
    let playerBottom = player.y + player.r;
    let platLeft = p.x;
    let platRight = p.x + p.w;
    let platTop = p.y;

    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;
    let landingOnTop =
      player.vy >= 0 && playerBottom >= platTop && playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r;
      player.vy = 0;
      player.onGround = true;

      // ACTIVATE ELEVATOR: If the player lands on it, start the movement
      if (p.type === "elevator") {
        p.isMoving = true;
      }
    }
  }
}

// ------------------------------------------------------------
// DRAWING FUNCTIONS
// ------------------------------------------------------------

function drawPlatforms() {
  for (let p of platforms) {
    if (p.type === "elevator") {
      // Draw the custom texture for elevators
      image(platformTexture, p.x, p.y, p.w, p.h);
    } else {
      // Draw standard colored rectangles for normal platforms
      fill(PLATFORM_COLOR[0], PLATFORM_COLOR[1], PLATFORM_COLOR[2]);
      noStroke();
      rect(p.x, p.y, p.w, p.h, 6);
    }
  }
}

function drawPlayer() {
  push();
  imageMode(CENTER);
  image(playerSprite, player.x, player.y, player.r * 2, player.r * 2);
  pop();
}

function drawHUD() {
  fill(255);
  noStroke();
  textSize(13);
  textAlign(LEFT);
  text("Move: Arrow Keys/WASD | Jump: W/Up", 16, 24);
  text("Land on the far right platform to trigger the elevator!", 16, 45);
}
