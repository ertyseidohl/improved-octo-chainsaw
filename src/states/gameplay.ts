import BaseEnemy from "../enemies/base_enemy";

import { ENEMY_WAVE } from "../constants";

import Engineering from "../engineering/engineering";
import Player from "../player/player";

// constants
const ENEMY_POOL_COUNT: number = 30;
const ENEMY_SPAWN_TIME: number = 2000;
const ENEMY_Y_SPAWN: number = -20;
const ENEMY_WIDTH: number = 100; // spacing number for spawning enemies

const POWERUP_POOL_COUNT: number = 30;

// wave constants
const WAVE_TIME_MAX: number = 2000;
const WAVE_RANDOM_ENEMY_MAX: number = 6;
const WAVE_RANDOM_ENEMY_TIME: number = 1000;
const WAVE_ROWS_MAX = 4; // number of rows spawned in row wave
const WAVE_ROW_XOFFSET = 60;
const WAVE_ROWS_ENEMY_COUNT_MAX = 5;
const WAVE_ROWS_TIME_MAX = 1500; // time between row spawns
const WAVE_ROWS_ENEMY_TIME_MAX = 300; // time between enemy spawns in rows (only for right and left)
const WAVE_BIGV_SPACER = 50;
const WAVE_BIGV_XSPREAD = 20;
const WAVE_SWOOP_MAX = 3; // this is the number of swoops we've have during a swoop wave
const WAVE_SWOOP_OFFSET = 30;
const WAVE_SWOOP_ENEMY_COUNT_MAX = 5;
const WAVE_SWOOP_TIME_MAX = 500;
const WAVE_SWOOP_ENEMY_TIME_MAX = 400;
const WAVE_SWOOP_XVEL = 210;

enum ROW_TYPE {
    LEFT,
    RIGHT,
    STRAIGHT,
    LAST,
}

enum SWOOP_TYPE {
    LEFT,
    RIGHT,
    LAST,
}

export default class Startup extends Phaser.State {
    // game objects
    private player: Player;
    private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private enemyCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private worldCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private backgrounds: Phaser.TileSprite[] = [];
    private playerDeathQueue: Phaser.Sprite[] = [];
    private spawnEnmyNumber: number; // we'll use this variable for all wave types
    private spawnWaveTime: number;
    private spawnWaveType: number;
    private spawnRowNum: number;
    private spawnRowFinished: boolean;
    private spawnRowTime: number;
    private spawnRowType: number;
    private spawnSwoopNum: number;
    private spawnSwoopFinished: boolean;
    private spawnSwoopTime: number;
    private spawnSwoopType: number;

    // Enemy vars
    private enemyRndmCreateCoolDwn = ENEMY_SPAWN_TIME;
    private enemyCreateTime = 0;

    // groups
    private groupEnemies: Phaser.Group;
    private groupExplosions: Phaser.Group;
    private groupExplosionsSmall: Phaser.Group;
    private groupPowerups: Phaser.Group;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private liveComponents: Phaser.Group;

    private borderSprite: Phaser.Sprite;

    // engineering section
    private engineering = new Engineering(this);

    public preload(): void {
        this.game.load.image("player", "../assets/ship.png");
        this.game.load.image("enemy", "../assets/enemy_1.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/laser.png");
        this.game.load.image("enemyBullet", "../assets/enemy-bullet.png");
        this.game.load.image("powerup", "../assets/powerup.png");

        this.game.load.spritesheet("prince", "../assets/prince.png", 128, 128, 4);
        this.game.load.spritesheet("explosion", "../assets/explosion.png", 64, 64, 6);
        this.game.load.spritesheet("explosion_small", "../assets/explosion_small.png", 32, 32, 4);
        this.game.load.spritesheet("missile_launcher", "../assets/missile_launcher.png", 64, 64, 8);
        this.game.load.image("background", "../assets/background.png");
        this.game.load.image("stars_1", "../assets/stars_1.png");
        this.game.load.image("stars_2", "../assets/stars_2.png");
        this.game.load.image("stars_3", "../assets/stars_3.png");

        this.game.load.spritesheet("button_z", "../assets/button_z.png", 32, 32, 2);
        this.game.load.spritesheet("button_x", "../assets/button_x.png", 32, 32, 2);
        this.game.load.spritesheet("button_c", "../assets/button_c.png", 32, 32, 2);

        this.game.load.image("gun_1_powerup", "../assets/gun_1_powerup.png");

        this.engineering.preload();
    }

    public create(): void {
        const { width, height } = this.game;

        // collision groups
        this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.bulletCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.worldCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup();

        // This part is vital if you want the objects
        // with their own collision groups to still collide with the world bounds
        // (which we do) - what this does is adjust the bounds to use its own collision group.
        this.game.physics.p2.updateBoundsCollisionGroup();

        // play area bounds
        this.borderSprite = this.game.add.sprite(width / 2, height / 2, "border");
        this.game.physics.p2.enable(this.borderSprite, true);
        const borderSpriteBody: Phaser.Physics.P2.Body = this.borderSprite.body;
        borderSpriteBody.static = true;
        borderSpriteBody.setCollisionGroup(this.worldCollisionGroup);
        borderSpriteBody.collides([this.playerCollisionGroup, this.enemyCollisionGroup, this.bulletCollisionGroup]);

        this.shmupBounds = new Phaser.Rectangle(
            0,
            0,
            width / 2 - this.borderSprite.width / 2,
            height,
        );
        this.engineeringBounds = new Phaser.Rectangle(
            this.shmupBounds.width + this.borderSprite.width,
            0,
            this.shmupBounds.width,
            this.game.height,
        );
        this.engineering.bounds = this.engineeringBounds;

        // background
        this.game.add.sprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            "background",
        );

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_1",
        ));

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_2",
        ));

        this.backgrounds.push(this.game.add.tileSprite(
            this.shmupBounds.x,
            this.shmupBounds.y,
            this.shmupBounds.width,
            this.shmupBounds.height,
            "stars_3",
        ));

        // setup engineering
        this.engineering.create();

        // sprites and physics
        this.player = new Player(this.game, this.game.width / 4, this.game.height - 50, "player");
        this.game.add.existing(this.player);

        this.game.physics.p2.enable(this.groupEnemies);
        this.groupEnemies.setAll("body.collideWorldBounds", false);
        this.groupEnemies.forEach((enemy: Phaser.Sprite) => {
            const enemyBody: Phaser.Physics.P2.Body = enemy.body;
            enemyBody.setCollisionGroup(this.enemyCollisionGroup);
            enemyBody.collides([this.playerCollisionGroup, this.bulletCollisionGroup]);
            enemyBody.fixedRotation = true;
        });
        // groups

        // assign collision groups
        this.player.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.body.collides(this.worldCollisionGroup);
        this.player.body.collides(this.enemyCollisionGroup);
        this.player.body.collides(this.bulletCollisionGroup);

        this.player.setBulletsCollisionGroup(this.bulletCollisionGroup);
        this.player.setBulletsCollides(this.enemyCollisionGroup, this.bulletHitEnemy, this);

        // enemies
        this.spawnWaveTime = this.game.time.now + WAVE_TIME_MAX;
        this.spawnWaveType = ENEMY_WAVE.NONE;

        this.groupEnemies = this.game.add.group();
        for (let i: number = 0; i < ENEMY_POOL_COUNT; i++) {
            const newEnemy: BaseEnemy = new BaseEnemy(this.game, Math.random(), 0, "enemy");
            newEnemy.setBulletsCollisionGroup(this.bulletCollisionGroup);
            newEnemy.setBulletsCollides(this.playerCollisionGroup, this.bulletHitPlayer, this);
            this.groupEnemies.add(newEnemy);
            newEnemy.kill();
        }
        this.game.physics.p2.enable(this.groupEnemies);
        this.groupEnemies.setAll("body.collideWorldBounds", false);
        this.groupEnemies.forEach((enemy: Phaser.Sprite) => {
            const enemyBody: Phaser.Physics.P2.Body = enemy.body;
            enemyBody.setCollisionGroup(this.enemyCollisionGroup);
            enemyBody.collides([this.playerCollisionGroup, this.bulletCollisionGroup]);
            enemyBody.fixedRotation = true;
        });

        this.groupExplosions = this.game.add.group();
        this.groupExplosions.createMultiple(60, "explosion");
        this.groupExplosions.forEach((explosion: Phaser.Sprite) => explosion.animations.add("explode"));

        this.groupExplosionsSmall = this.game.add.group();
        this.groupExplosionsSmall.createMultiple(10, "explosion_small");
        this.groupExplosionsSmall.forEach((explosion: Phaser.Sprite) => explosion.animations.add("explode"));
    }

    public update(): void {
        this.updateShmup();
        for (let i: number = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].tilePosition.y += (i + 1);
        }
        this.engineering.update();

        if (this.playerDeathQueue.length && Math.random() < 0.2) {
            const playerDeathExplosion: Phaser.Sprite = this.playerDeathQueue.pop();
            playerDeathExplosion.visible = true;
            playerDeathExplosion.animations.getAnimation("explode").play(30, false, true);
        }
    }

    private updateShmup(): void {
        // if time to spawn wave, and wave is finished, generate enemies
        // we don't need a "wave finished" variable, we just set spawnWaveType to NONE and check for that
        if (this.game.time.now >= this.spawnWaveTime && this.spawnWaveType === ENEMY_WAVE.NONE) {
            // use 1 because 0 is "NONE"
            this.spawnWaveType = this.game.rnd.integerInRange(1, ENEMY_WAVE.LAST - 1);
            // this.spawnWaveType = ENEMY_WAVE.SWOOP;
            this.enemyCreateTime = 0;
            this.spawnEnmyNumber = 0;
            this.spawnRowTime = 0;
            this.spawnRowNum = 0;
            this.spawnRowFinished = true;
            this.spawnSwoopTime = 0;
            this.spawnSwoopNum = 0;
            this.spawnSwoopFinished = true;

            // console debug messages
            switch (this.spawnWaveType) {
                case ENEMY_WAVE.RANDOM:
                console.log("Wave: Random");
                break;
                case ENEMY_WAVE.SWOOP:
                console.log("Wave: Swoop");
                break;
                case ENEMY_WAVE.BIGV:
                console.log("Wave: Big V");
                break;
                case ENEMY_WAVE.ROWS:
                console.log("Wave: Rows");
                break;
                default:
                console.log("Error: No wave chosen!");
                this.resetWave();
                break;
            }
        }

        switch (this.spawnWaveType) {
            case ENEMY_WAVE.NONE:
            // do nothing
            break;
            case ENEMY_WAVE.RANDOM:
            if (this.game.time.now >= this.enemyCreateTime) {
                this.enemyCreateTime = this.game.time.now + WAVE_RANDOM_ENEMY_TIME;
                this.spawnEnmyNumber++;
                const minX: number = ENEMY_WIDTH;
                const maxX: number = this.shmupBounds.width - this.borderSprite.width / 2 - ENEMY_WIDTH;
                this.createEnemy(this.spawnWaveType, this.game.rnd.integerInRange(minX, maxX));
            }
            // check for end of wave
            if (this.spawnEnmyNumber >= WAVE_RANDOM_ENEMY_MAX) {
                this.resetWave();
            }
            break;
            case ENEMY_WAVE.SWOOP:
            // choose new swoop if swoop is finished
            if (this.spawnSwoopFinished) {
                this.spawnSwoopFinished = false;
                this.spawnEnmyNumber = 0;
                this.enemyCreateTime = 0;
                this.spawnSwoopType = this.game.rnd.integerInRange(0, SWOOP_TYPE.LAST - 1);
                switch (this.spawnSwoopType) {
                    case SWOOP_TYPE.LEFT:
                    console.log("Swoop chosen: Left");
                    break;
                    case SWOOP_TYPE.RIGHT:
                    console.log("Swoop chosen: Right");
                    break;
                }
            } else {
                // otherwise, execute swoop
                // debugger;
                switch (this.spawnSwoopType) {
                    /* spawn enemies until the number of
                    enemies spawned matches WAVE_SWOOP_ENEMY_COUNT_MAX, then set
                    the swoop time to WAVE_SWOOP_TIME_MAX. Once the game time reaches that,
                    we set spawnSwoopFinished to true;
                    */
                    case SWOOP_TYPE.LEFT:
                    if (this.spawnEnmyNumber < WAVE_SWOOP_ENEMY_COUNT_MAX) {
                        if (this.game.time.now >= this.enemyCreateTime) {
                            this.enemyCreateTime = this.game.time.now + WAVE_SWOOP_ENEMY_TIME_MAX;
                            const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
                            if (currEnemy) {
                                currEnemy.reset(0 + WAVE_SWOOP_OFFSET, ENEMY_Y_SPAWN, currEnemy.maxHealth);
                                currEnemy.randomizeTimes();
                                currEnemy.setWaveType(this.spawnWaveType);
                                currEnemy.setXVel(WAVE_SWOOP_XVEL);
                            }
                            this.spawnEnmyNumber++;
                        }
                        if (this.spawnEnmyNumber >= WAVE_SWOOP_ENEMY_COUNT_MAX) {
                            this.spawnSwoopTime = this.game.time.now + WAVE_SWOOP_TIME_MAX;
                            console.log("Swoop Finished, waiting to setup new swoop...");
                            this.spawnSwoopNum++;
                        }
                    }
                    break;
                    case SWOOP_TYPE.RIGHT:
                    if (this.spawnEnmyNumber < WAVE_SWOOP_ENEMY_COUNT_MAX) {
                        if (this.game.time.now >= this.enemyCreateTime) {
                            this.enemyCreateTime = this.game.time.now + WAVE_SWOOP_ENEMY_TIME_MAX;
                            const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
                            if (currEnemy) {
                                currEnemy.reset(this.game.width / 2 - WAVE_SWOOP_OFFSET,
                                    ENEMY_Y_SPAWN, currEnemy.maxHealth);
                                currEnemy.randomizeTimes();
                                currEnemy.setWaveType(this.spawnWaveType);
                                currEnemy.setXVel(-WAVE_SWOOP_XVEL);
                            }
                            this.spawnEnmyNumber++;
                        }
                        if (this.spawnEnmyNumber >= WAVE_SWOOP_ENEMY_COUNT_MAX) {
                            this.spawnSwoopTime = this.game.time.now + WAVE_SWOOP_TIME_MAX;
                            console.log("Swoop Finished, waiting to setup new swoop...");
                            this.spawnSwoopNum++;
                        }
                    }
                    break;
                }
                // If we've spawned all the necessary enemies, and the spawn time has been reached, we're done
                // spawning the swoop
                if (this.game.time.now >= this.spawnSwoopTime && this.spawnEnmyNumber >= WAVE_SWOOP_ENEMY_COUNT_MAX) {
                    this.spawnSwoopFinished = true;
                }
            }
            // spawnSwoopNum is incremented when new wave is chosen
            // greater than necessary to spawn actual number in WAVE_ROW_MAX
            if (this.spawnSwoopNum >= WAVE_SWOOP_MAX) {
                this.resetWave();
            }
            break;
            case ENEMY_WAVE.BIGV:
            // I think it makes sense to just hardcode these guys in
            // 5 enemies with different starty Y positions and x velocities
            const xSpawn: number = this.game.width / 4;
            let bigVEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(0);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(-WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(-2 * WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(2 * WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(-3 * WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(3 * WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 4, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(-4 * WAVE_BIGV_XSPREAD);
            }
            bigVEnemy = this.groupEnemies.getFirstExists(false);
            if (bigVEnemy) {
                bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 4, bigVEnemy.maxHealth);
                bigVEnemy.setWaveType(this.spawnWaveType);
                bigVEnemy.setXVel(4 * WAVE_BIGV_XSPREAD);
            }
            this.resetWave();
            break;
            case ENEMY_WAVE.ROWS:
            if (this.spawnRowFinished) {
                this.spawnRowFinished = false;
                this.spawnEnmyNumber = 0;
                this.spawnRowType = this.game.rnd.integerInRange(0, ROW_TYPE.LAST - 1);
                // debug row chosen
                switch (this.spawnRowType) {
                    case ROW_TYPE.LEFT:
                    console.log("Row chosen: Left");
                    break;
                    case ROW_TYPE.RIGHT:
                    console.log("Row chosen: Right");
                    break;
                    case ROW_TYPE.STRAIGHT:
                    console.log("Row chosen: Straight");
                    break;
                }
            } else {
                // execute row type
                switch (this.spawnRowType) {
                    /* all rows work the same way, spawn enemies until the number of
                    enemies spawned matches WAVE_ROWS_ENEMY_COUNT_MAX, then set
                    the row time to WAVE_ROWS_TIME_MAX. Once the game time reaches that,
                    we set spawnRowFinished to true;
                    */
                    case ROW_TYPE.LEFT:
                    if (this.spawnEnmyNumber < WAVE_ROWS_ENEMY_COUNT_MAX) {
                        if (this.game.time.now >= this.enemyCreateTime) {
                            this.enemyCreateTime = this.game.time.now + WAVE_ROWS_ENEMY_TIME_MAX;
                            this.createEnemy(this.spawnWaveType, WAVE_ROW_XOFFSET + ENEMY_WIDTH * this.spawnEnmyNumber);
                            this.spawnEnmyNumber++;
                        }
                        if (this.spawnEnmyNumber >= WAVE_ROWS_ENEMY_COUNT_MAX) {
                            this.spawnRowTime = this.game.time.now + WAVE_ROWS_TIME_MAX;
                            console.log("Row Finished, waiting to setup new row...");
                            this.spawnRowNum++;
                        }
                    }
                    break;
                    case ROW_TYPE.RIGHT:
                    if (this.spawnEnmyNumber < WAVE_ROWS_ENEMY_COUNT_MAX) {
                        if (this.game.time.now >= this.enemyCreateTime) {
                            this.enemyCreateTime = this.game.time.now + WAVE_ROWS_ENEMY_TIME_MAX;
                            this.createEnemy(this.spawnWaveType,
                                this.game.width / 2 - (WAVE_ROW_XOFFSET + ENEMY_WIDTH * this.spawnEnmyNumber));
                            this.spawnEnmyNumber++;
                        }
                        if (this.spawnEnmyNumber >= WAVE_ROWS_ENEMY_COUNT_MAX) {
                            this.spawnRowTime = this.game.time.now + WAVE_ROWS_TIME_MAX;
                            console.log("Row Finished, waiting to setup new row...");
                            this.spawnRowNum++;
                        }
                    }
                    break;
                    case ROW_TYPE.STRAIGHT:
                    if (this.spawnEnmyNumber < WAVE_ROWS_ENEMY_COUNT_MAX) {
                        for (let i: number = 0; i < WAVE_ROWS_ENEMY_COUNT_MAX; i++) {
                            this.createEnemy(this.spawnWaveType, WAVE_ROW_XOFFSET + ENEMY_WIDTH * i);
                            this.spawnEnmyNumber++;
                        }
                        this.spawnRowTime = this.game.time.now + WAVE_ROWS_TIME_MAX;
                        console.log("Row Finished, waiting to setup new row...");
                        this.spawnRowNum++;
                    }
                    break;
                }
                // If we've spawned all the necessary enemies, and the spawn time has been reached, we're done
                // spawning the row
                if (this.game.time.now >= this.spawnRowTime && this.spawnEnmyNumber >= WAVE_ROWS_ENEMY_COUNT_MAX) {
                    this.spawnRowFinished = true;
                }
            }
            // spawnRowNum is incremented when new wave is chosen
            // greater than necessary to spawn actual number in WAVE_ROW_MAX
            if (this.spawnRowNum >= WAVE_ROWS_MAX) {
                this.resetWave();
            }
            break;
        }
    }

    private spawnPowerup(enemy: Phaser.Physics.P2.Body) {
        // const powerup = this.groupPowerups.getFirstExists(false);
        // if (powerup) {
        //     powerup.reset(enemy.sprite.x, enemy.sprite.y);
        //     const powerupBody: Phaser.Physics.P2.Body = powerup.body;
        //     powerupBody.velocity.y = Math.random() * 42;
        //     powerupBody.velocity.x = Math.random() * 42 - 84;
        //     powerupBody.fixedRotation = true;
        // }
    }

    private bulletHitEnemy(bullet: Phaser.Physics.P2.Body, enemy: Phaser.Physics.P2.Body): void {
        if (!bullet.sprite.alive) {
            return;
        }
        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 30, false, true);
        }

        if (bullet.sprite.alive) {
            enemy.sprite.damage(1);
        }

        if (enemy.sprite.health <= 0) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                deathExplosion.reset(enemy.x, enemy.y);
                deathExplosion.play("explode", 30, false, true);
            }
            this.spawnPowerup(enemy);
        }

        bullet.sprite.kill();
    }

    private bulletHitPlayer(bullet: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body): void {
        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 30, false, true);
        }

        player.sprite.damage(1);

        if (player.sprite.health <= 0) {
            this.playerIsDead(this.player);
        }

        bullet.sprite.kill();
    }

    private playerIsDead(player: Phaser.Sprite): void {
        this.engineering.explode();
        for (let i: number = 0; i < 60; i++) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                if (Math.random() < 0.5) {
                    deathExplosion.reset(
                        player.x + ((Math.random() * 200) - 100),
                        player.y + ((Math.random() * 200) - 100),
                    );
                } else {
                    deathExplosion.reset(
                        this.engineeringBounds.x + (Math.random() * this.engineeringBounds.width),
                        this.engineeringBounds.y + (Math.random() * this.engineeringBounds.height),
                    );
                }
                deathExplosion.visible = false;
                this.playerDeathQueue.push(deathExplosion);
            }
        }
    }

    private powerUpHitPlayer(): void {
        // not implemented
    }

    private createEnemy(waveType: number, xSpawn: number) {
        const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
        if (currEnemy) {
            if (waveType === ENEMY_WAVE.RANDOM) {
                currEnemy.randomizeTimes();
            }
            currEnemy.setWaveType(waveType);
            currEnemy.reset(xSpawn, ENEMY_Y_SPAWN, currEnemy.maxHealth);
        }
    }

    private resetWave(): void {
        console.log("Wave Reset");
        this.spawnWaveTime = this.game.time.now + WAVE_TIME_MAX;
        this.spawnWaveType = ENEMY_WAVE.NONE;
    }
}
