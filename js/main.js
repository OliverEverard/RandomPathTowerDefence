var userMoney = 750;

function devMoney(){
  userMoney = 99999999999999999 * 99999999999999999999999999999999 * 99999999999999999999999999 * (userMoney + 999999999999999999999999999999);
  return
}

function startGame(){
var config = {
  type: Phaser.AUTO,
  parent: 'content',
  width: 850,
  height: 512,
  physics:{
    default: 'arcade'
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  },
};

if(true){
  var game = new Phaser.Game(config);
  var graphics;
  var path;
  var enemySpeed = 1/15000;
  var enemyCount = 0;
  var bulletDamage = 50;
  var scoreLabel;
  var moneyLabel;
  var turretLevelLabel;
  var turretCount = 0;
  var turretCost = 100;
  var upgradeCost = 2000;
  var upgradeCostLabel;
  var turretCostLabel;
  var turretLevel = 1;
  var gameOver = 0; } //Global Definitions
  var map = [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0 ,0 ,0 ,0 ,0 ,0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
  var lives = 1000;
  var livesLabel;
  var livesCost = 10000
  var livesCostLabel;
  var lastX;
  var q = 1;
  var rand1;
  var ticRate = 1000;
  //console.log(graphics, path, enemySpeed, enemyCount, bulletDamage, scoreLabel, moneyLabel, turretLevelLabel, turretCount, turretCost, upgradeCost, upgradeCostLabel, turretCostLabel, turretLevel, gameOver, map, lives, livesLabel, livesCost, livesCostLabel, lastX, q, rand1, ticRate);

  var Enemy = new Phaser.Class({
    Extends: Phaser.GameObjects.Image,
    initialize:

    function Enemy (scene)
    {
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'enemy');
      this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
    },
    startOnPath: function () {
      // set the t parameter at the start of the path
      this.follower.t = 0;

      // get x and y of the given t point
      path.getPoint(this.follower.t, this.follower.vec);

      // set the x and y of our enemy to the received from the previous step
      this.setPosition(this.follower.vec.x, this.follower.vec.y);
      this.hp = 150;

    },
    receiveDamage: function(damage) {
      this.hp -= damage;

      // if hp drops below 0 enemy is deactivated
      if (this.hp <= 0) {
        this.setActive(false);
        this.setVisible(false);
        enemyCount = enemyCount + 1;
        userMoney = userMoney + Math.ceil(enemyCount / 6);
        updateLabels(enemyCount, scoreLabel, moneyLabel, userMoney, livesCost, livesCostLabel);

      }
    },
    update: function (time, delta)
    {
      // move the t point along the path, 1 is the start and 0 is the end
      this.follower.t += enemySpeed * delta;

      // get the new x and y coordinates in vec
      path.getPoint(this.follower.t, this.follower.vec);

      // update enemy x and y to the newly obtained x and y
      this.setPosition(this.follower.vec.x, this.follower.vec.y);

      // if enemy at end of path, remove
      if (this.follower.t >= 1)
      {
        this.setActive(false);
        this.setVisible(false);
        lives = lives - this.hp;
        console.log(this.hp, "Lives have been removed");


        if (lives < 1){
        window.alert("Game Over.");
        location.reload();
      }
      updateLabels();
      }
    }
  });

  var Turret = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    function Turret (scene)
    {
      Phaser.GameObjects.Image.call(this, scene, 0, 0, 'tower');
      this.nextTic = 0;
    },
    // we will place the turret according to the grid
    place: function(i, j) {
      this.y = i * 64 + 64/2;
      this.x = j * 64 + 64/2;
      map[i][j] = 1;
    },

    fire: function() {
      var enemy = getEnemy(this.x, this.y, 200);
      if(enemy) {
        var angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
        addBullet(this.x, this.y, angle);
        this.angle = (angle + Math.PI/2) * Phaser.Math.RAD_TO_DEG;
      }
    },
    update: function (time, delta)
    {
      if (gameOver != 1){
        // time to shoot
        if(time > this.nextTic) {
          this.fire();
          this.nextTic = time + ticRate;
        }
      }}
    });

    var Bullet = new Phaser.Class({

      Extends: Phaser.GameObjects.Image,

      initialize:

      function Bullet (scene)
      {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');

        this.dx = 0;
        this.dy = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(600, 1);
      },

      fire: function (x, y, angle)
      {
        this.setActive(true);
        this.setVisible(true);

        //  Bullets fire from the middle of the screen to the given x/y
        this.setPosition(x, y);

        this.dx = Math.cos(angle);
        this.dy = Math.sin(angle);

        this.lifespan = 300;
      },

      update: function (time, delta)
      {
        this.lifespan -= delta;

        this.x += this.dx * (this.speed * delta);
        this.y += this.dy * (this.speed * delta);

        if (this.lifespan <= 0)
        {
          this.setActive(false);
          this.setVisible(false);
        }
      }

    });

    function preload() {
      var loadingText = this.add.text(700, 450, "LOADING...",
        {
          fontFamily: "Roboto Condensed",
          fontSize: '20px',
          fill: '#fff'
        })
      this.load.image('enemy', 'assets/kenny-td/Default size/towerDefense_tile271.png');
      this.load.image('tower', 'assets/kenny-td/Default size/towerDefense_tile249.png');
      this.load.image('bullet', 'assets/kenny-td/Default size/towerDefense_tile298.png');
      this.load.image("ground", "assets/kenny-td/Default size/towerDefense_tile024.png");
      this.load.image("sideBar", "assets/kenny-td/Default size/towerDefense_tile257.png");
      this.load.image("upgradeButton", "assets/kenny-td/Default size/towerDefense_tile085.png");
      this.load.image("restartButton", "assets/kenny-td/Default size/towerDefense_tile087.png ");
      this.load.image("livesButton", "assets/kenny-td/Default size/livesButton.png ");
      this.load.audio('bkMusic', 'assets/Sounds/bkMusic.mp3');
    }

    function create() {
      var bkMusic = this.sound.add('bkMusic');
      bkMusic.play({
        loop: true
      })
      if(true){
        scoreLabel = this.add.text(
          this.physics.world.bounds.width / 4,
          this.physics.world.bounds.height / 4,
          'Score: '+enemyCount,
          {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '20px',
            fill: '#fff'
          });
          scoreLabel.depth = 2;
          scoreLabel.x = 650;
          scoreLabel.y = 5;


          moneyLabel = this.add.text(
            this.physics.world.bounds.width / 4,
            this.physics.world.bounds.height / 4,
            'Money: '+userMoney,
            {
              fontFamily: 'Monaco, Courier, monospace',
              fontSize: '20px',
              fill: '#fff'
            });
            moneyLabel.depth = 2;
            moneyLabel.x = 650;
            moneyLabel.y = 30;

            turretLevelLabel = this.add.text(
              this.physics.world.bounds.width / 4,
              this.physics.world.bounds.height / 4,
              'Turret Level: '+ turretLevel,
              {
                fontFamily: 'Monaco, Courier, monospace',
                fontSize: '20px',
                fill: '#fff'
              });
              turretLevelLabel.depth = 2;
              turretLevelLabel.x = 650;
              turretLevelLabel.y = 80;

              upgradeCostLabel = this.add.text(
                this.physics.world.bounds.width / 4,
                this.physics.world.bounds.height / 4,
                'Upgrade Cost: '+ upgradeCost,
                {
                  fontFamily: 'Monaco, Courier, monospace',
                  fontSize: '15px',
                  fill: '#fff'
                });
                upgradeCostLabel.depth = 2;
                upgradeCostLabel.x = 650;
                upgradeCostLabel.y = 130;

                turretCostLabel = this.add.text(
                  this.physics.world.bounds.width / 4,
                  this.physics.world.bounds.height / 4,
                  'Turret Cost: '+ turretCost,
                  {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '15px',
                    fill: '#fff'
                  });
                  turretCostLabel.depth = 2;
                  turretCostLabel.x = 650;
                  turretCostLabel.y = 105;

                  livesLabel = this.add.text(
                    this.physics.world.bounds.width / 4,
                    this.physics.world.bounds.height / 4,
                    'Lives: '+ lives,
                    {
                      fontFamily: 'Monaco, Courier, monospace',
                      fontSize: '20px',
                      fill: '#fff'
                    });
                    livesLabel.depth = 2;
                    livesLabel.x = 650;
                    livesLabel.y = 175;

                    livesCostLabel = this.add.text(
                      this.physics.world.bounds.width / 4,
                      this.physics.world.bounds.height / 4,
                      'Lives Cost: '+ livesCost,
                      {
                        fontFamily: 'Monaco, Courier, monospace',
                        fontSize: '15px',
                        fill: '#fff'
                      });
                      livesCostLabel.depth = 2;
                      livesCostLabel.x = 650;
                      livesCostLabel.y = 200;


                  var upgradeButton = this.add.sprite(710, 460, 'upgradeButton');
                  var upgradeButtonText = this.add.text(680, 430, "UPGRADE",
                  {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '15px',
                    fill: '#fff'
                  })
                  upgradeButtonText.depth = 4;
                  upgradeButton.setInteractive();
                  upgradeButton.on('pointerdown', () => { levelUp() })
                  upgradeButton.scale = 4;
                  upgradeButton.depth = 3;

                  var restartButton = this.add.sprite(786, 460, 'restartButton');
                  var restartButtonText = this.add.text(756, 430, "RESTART",
                  {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '15px',
                    fill: '#fff'
                  })
                  restartButtonText.depth = 4;
                  restartButton.setInteractive();
                  restartButton.on('pointerdown', () => { location.reload(); })
                  restartButton.scale = 4;
                  restartButton.depth = 3;

                  var livesBuy = this.add.sprite(786, 390, 'livesButton');
                  var livesBuyText = this.add.text(748, 360, "BUY LIVES",
                  {
                    fontFamily: 'Monaco, Courier, monospace',
                    fontSize: '15px',
                    fill: '#fff'
                  })
                  livesBuyText.depth = 4;
                  livesBuy.setInteractive();
                  livesBuy.on('pointerdown', () => { buyLives(); })
                  livesBuy.scale = 4;
                  livesBuy.depth = 3;

                } //Label Creations

                for (let y = 0; y < 550;) {
                  for (let x = 0; x < 650;) {
                    this.ground = this.add.sprite(x, y, "ground");
                    x = x + 64;
                  }
                  y = y + 64;
                };

                graphics = this.add.graphics();
                //draw grid
                drawGrid(graphics);

                for (let y = 0; y < 550;) {
                  for (let x = 675; x < 900;) {
                    this.ground = this.add.sprite(x, y, "sideBar");
                    x = x + 64;
                  }
                  y = y + 64;
                };

                var numOfSquares = 0
                var runOnce = 0;
                var biggestX = 0;
                var smallestX = 0;
                var loopTimes = 0

                 while (numOfSquares <=28 || numOfSquares >=30 || ((biggestX - smallestX) < 500)){
                   loopTimes = loopTimes + 1;
                  if (runOnce === 1){
                    numOfSquares = 0;
                    rand1 = 0;
                    q = 1;
                    biggestX = 0;
                    smallestX = 700;
                    blankMap()
                  } else {var rand2;};

                  runOnce = 1;
                  rand1 = Phaser.Math.Between(1, 10);
                    path = this.add.path((rand1 * 64)-32 , -32);
                    path.lineTo((rand1 * 64)-32 , 32);
                    lastX = (rand1 * 64)-32;
                    numOfSquares = numOfSquares + 1;
                    makeMap()

                    for (; q <= 8;){
                      rand2 = Math.floor(Math.random() * 4);
                      if (rand2 === 0){
                        if ((lastX - 64) >= 32){
                        path.lineTo(lastX - 64, (q * 64) - 32);
                        lastX = lastX - 64
                        numOfSquares = numOfSquares + 1;
                      } else{
                        path.lineTo(lastX + 64, (q * 64) - 32);
                        lastX = lastX + 64;
                        numOfSquares = numOfSquares + 1;
                      }
                      } else if (rand2 === 1){
                          path.lineTo(lastX, (q * 64) + 32);
                          q = q + 1;
                          numOfSquares = numOfSquares + 1;
                      } else if (rand2 === 2){
                        if ((lastX - 64) <= 518){
                          path.lineTo(lastX + 64, (q * 64) - 32);
                          lastX = lastX + 64;
                          numOfSquares = numOfSquares + 1;
                        } else {
                          path.lineTo(lastX - 64, (q * 64) - 32);
                          lastX = lastX - 64
                          numOfSquares = numOfSquares + 1;
                        }
                      } else if (rand2 === 3){
                        if (q > 1){
                          q = q - 1;
                          path.lineTo(lastX, (q * 64) - 32);
                          numOfSquares = numOfSquares + 1;
                        } else {
                          path.lineTo(lastX, (q * 64) + 32);
                          q = q + 1;
                          numOfSquares = numOfSquares + 1;
                        }}

                      makeMap()

                    if (lastX > biggestX){
                      biggestX = lastX;
                    } else if (lastX < smallestX){
                      smallestX = lastX;
                    }

                  }
                  };
                  console.log("Loops", loopTimes);

                graphics.lineStyle(3, 0xffffff, 1);
                // visualize the path
                path.draw(graphics);



                //enemies = this.add.group({ classType: Enemy, runChildUpdate: true });
                enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
                this.nextEnemy = 0;

                turrets = this.add.group({ classType: Turret, runChildUpdate: true });
                this.input.on('pointerdown', placeTurret);

                //bullets = this.add.group({ classType: Bullet, runChildUpdate: true });
                bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
                this.physics.add.overlap(enemies, bullets, damageEnemy);
              }

      function update(time, delta) {
        if (gameOver != 1){
          // if its time for the next enemy
          if (time > this.nextEnemy)
          {
            var enemy = enemies.get();
            if (enemy)
            {
              enemy.setActive(true);
              enemy.setVisible(true);

              // place the enemy at the start of the path
              enemy.startOnPath();

              if (enemyCount < 10){
                this.nextEnemy = time + 2000;
              } else if (enemyCount >= 10, enemyCount < 25) {
                this.nextEnemy = time + 1250;
                this.hp = 250;
              }  else if (enemyCount >= 25, enemyCount < 50) {
                this.nextEnemy = time + 800;
                this.hp = 350;
                enemySpeed = 1/12000;
              } else if (enemyCount >= 50, enemyCount < 100){
                this.nextEnemy = time + 700;
                this.hp = 450;
                enemySpeed = 1/10000;
              } else if (enemyCount >= 100, enemyCount < 200){
                this.nextEnemy = time + 500;
                this.hp = 500;
              } else if (enemyCount >= 200, enemyCount <= 300){
                this.nextEnemy = time + 250;
                this.hp = 750;
                enemySpeed = 1/9500;
              } else if (enemyCount >= 300, enemyCount <= 400){
                this.nextEnemy = time + 150;
                this.hp = 900;
              } else if (enemyCount >= 400, enemyCount <= 1000){
                this.nextEnemy = time + 100;
                this.hp = 1100;
                enemySpeed = 1/8000;
              } else  if (enemyCount >= 1000, enemyCount <= 2000){
                this.nextEnemy = time + (80 - (enemyCount/ 600));
                this.hp = (1150 + (enemyCount / 5));
                enemySpeed = 1/7500;
                //console.log(this.hp);
              } else {
                this.nextEnemy = time + (50 - (enemyCount/ 600));
                this.hp = (2000 + (enemyCount / 4));
                enemySpeed = (1/5000) - (enemyCount/3000) ;
              }
            }
          }
        }}

      function drawGrid(graphics) {
        graphics.lineStyle(1, 0xffffff, 0.2);
        for(var i = 0; i < 8; i++) {
          graphics.moveTo(0, i * 64);
          graphics.lineTo(640, i * 64);
        }
        for(var j = 0; j < 10; j++) {
          graphics.moveTo(j * 64, 0);
          graphics.lineTo(j * 64, 512);
        }
        graphics.strokePath();
      }

      function placeTurret(pointer) {
        var i = Math.floor(pointer.y/64);
        var j = Math.floor(pointer.x/64);
        if(canPlaceTurret(i, j) === 0) {
          if (userMoney >= turretCost){
            var turret = turrets.get();
            if (turret)
            {
              turret.setActive(true);
              turret.setVisible(true);
              turret.place(i, j);
              userMoney = userMoney - turretCost;
              upgradeCost = upgradeCost + (turretCount * turretLevel * 100)

              moneyLabel.text = 'Money: '+userMoney;
              turretCount = turretCount = 1;
              if (turretCount >= 1){
                turretCost = turretCost  + 50;
              } else if (turretCount >= 2){
                turretCost = turretCost  + 100;;
              } else if (turretCount >= 5){
                turretCost = turretCost  + 150;
              } else if (turretCount >= 10){
                turretCost = turretCost  + 400;
              } else{
                turretCost = turretCost  + 300;
              }
              updateLabels()
            }
          }
          // } else if (canPlaceTurret != 0 ){
          //   levelUp()
        }

      }

      function canPlaceTurret(i, j) {
        return map[i][j];
      }

      function addBullet(x, y, angle) {
        var bullet = bullets.get();
        if (bullet)
        {
          bullet.fire(x, y, angle);
        }

      }

      function getEnemy(x, y, distance) {
        var enemyUnits = enemies.getChildren();
        for(var i = 0; i < enemyUnits.length; i++) {
          if(enemyUnits[i].active && Phaser.Math.Distance.Between(x, y, enemyUnits[i].x, enemyUnits[i].y) <= distance)
          return enemyUnits[i];
        }
        return false;
      }

      function damageEnemy(enemy, bullet) {
        // only if both enemy and bullet are alive
        if (enemy.active === true && bullet.active === true) {
          //remove the bullet right away
          bullet.setActive(false);
          bullet.setVisible(false);

          // decrease the enemy hp with bulletDamage
          enemy.receiveDamage(bulletDamage);
        }
      }

      function updateLabels() {
        if (enemySpeed != 0){
          scoreLabel.text = 'Score: '+enemyCount;
          moneyLabel.text = 'Money: '+userMoney;
          turretLevelLabel.text = 'Turret Level: '+turretLevel;
          upgradeCostLabel.text = 'Upgrade Cost: '+upgradeCost;
          turretCostLabel.text = 'Turret Cost: '+ turretCost;
          livesCostLabel.text = 'Lives Cost: '+ livesCost;
          livesLabel.text = 'Lives: '+ lives;

        }}

      function levelUp(){
        if (turretLevel === 1){
          if (userMoney >= upgradeCost){
            turretLevel = 2;
            bulletDamage = 300;
            userMoney = userMoney - upgradeCost;
            //console.log("Turret Level", turretLevel)
            upgradeCost = 15000;
            turretCost = turretCost * 2;
          }
        } else if (turretLevel === 2){
          if (userMoney >= upgradeCost){
            bulletDamage = 500;
            ticRate = 800;
            turretLevel = 3;
            userMoney = userMoney - upgradeCost;
            //console.log("Turret Level", turretLevel)
            upgradeCost = 75000;
            turretCost = turretCost * 3;
          }
        } else if (turretLevel === 3){
          if (userMoney >= upgradeCost){
            bulletDamage = 1000;
            ticRate = 600;
            turretLevel = 4;
            userMoney = userMoney - upgradeCost;
            //console.log("Turret Level", turretLevel)
            upgradeCost = (500000);
            turretCost = turretCost * 4;
          }
          } else if (turretLevel === 4){
            if (userMoney >= upgradeCost){
              bulletDamage = 2000;
              ticRate = 400;
              turretLevel = 5;
              userMoney = userMoney - upgradeCost;
              //console.log("Turret Level", turretLevel)
              upgradeCost = 2000000
              turretCost = turretCost * 5;
            }
        } else {
          if (userMoney >= upgradeCost){
            bulletDamage = bulletDamage * 1.5;
            ticRate = ticRate - (turretLevel * 5);
            turretLevel = turretLevel + 1
            userMoney = userMoney - upgradeCost;
            upgradeCost = upgradeCost * (2 * (turretLevel / 5));
            turretCost = turretCost * 5;
          }
        } updateLabels()
      }

      function makeMap(){
        var x = ((lastX + 32) / 64) -1;
        var y = (q - 1)
        //console.log(x, y);
        //console.log(map);
        map[y][x] = -1;
      }

      function blankMap(){
        map = [[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0 ,0 ,0 ,0 ,0 ,0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
      }

      function buyLives(){
        if (userMoney >= livesCost){
          lives = lives + 10000;
          userMoney = userMoney - livesCost;
          livesCost = livesCost * 5;
          updateLabels()
        }
      }

    }
