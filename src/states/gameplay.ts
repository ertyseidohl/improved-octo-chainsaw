import BaseEnemy from "../enemies/base_enemy";

import { WAVE_TYPE } from "../constants";

import Engineering, { ShipUpdateMessage } from "../engineering/engineering";
import LevelManager from "../levels/level_manager";
import Player from "../player/player";
import { Powerup } from "../player/powerup";

import Wave from "../levels/wave";

// NOTE: ALL TIMES ARE IN FRAMES AT 60FPS

// constants
const ENEMY_POOL_COUNT: number = 30;
const ENEMY_SPAWN_TIME: number = 120;
const ENEMY_Y_SPAWN: number = -20;
const ENEMY_WIDTH: number = 100; // spacing number for spawning enemies

// gameplay states
enum GAMEPLAY_STATE {
    GETREADY,
    WAVES,
    BOSS,
    VICTORY,
}

enum READY_STATES {
    READY,
    DRAMATIC_PAUSE,
    GO,
}
const POWERUP_POOL_COUNT: number = 30;

// wave constants
const WAVE_TIME_MAX: number = 120;
const WAVE_RANDOM_ENEMY_MAX: number = 6;
const WAVE_RANDOM_ENEMY_TIME: number = 60;
const WAVE_ROWS_MAX = 4; // number of rows spawned in row wave
const WAVE_ROW_XOFFSET = 60;
const WAVE_ROWS_ENEMY_COUNT_MAX = 5;
const WAVE_ROWS_TIME_MAX = 90; // time between row spawns
const WAVE_ROWS_ENEMY_TIME_MAX = 28; // time between enemy spawns in rows (only for right and left)
const WAVE_BIGV_SPACER = 50;
const WAVE_BIGV_XSPREAD = 20;
const WAVE_SWOOP_MAX = 3; // this is the number of swoops we've have during a swoop wave
const WAVE_SWOOP_OFFSET = 30;
const WAVE_SWOOP_ENEMY_COUNT_MAX = 5;
const WAVE_SWOOP_TIME_MAX = 30;
const WAVE_SWOOP_ENEMY_TIME_MAX = 24;
const WAVE_SWOOP_XVEL = 210;

export default class Startup extends Phaser.State {
    private gameplayState: number;
    private startState: number;
    private startStateTime: number;

    private gameMessageCenter: Phaser.Text;
    private gameMessageCenterTime: number; // set negative if infinite

    // game objects
    private player: Player;
    private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private enemyCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private worldCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private powerupCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    private backgrounds: Phaser.TileSprite[] = [];
    private playerDeathQueue: Phaser.Sprite[] = [];

    private currentLevelWaves: Wave[];
    private currentWaveIndex: number;

    private levelManager: LevelManager;

    // level stuff
    private level: number;

    // groups
    private groupEnemies: Phaser.Group;
    private groupExplosions: Phaser.Group;
    private groupExplosionsSmall: Phaser.Group;
    private groupPowerups: Phaser.Group;

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

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
        this.game.load.image("health", "../assets/powerup.png");

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
        this.game.load.image("engine_1_powerup", "../assets/engine_1_powerup.png");

        this.engineering.preload();
    }

    public create(): void {

        // NOOBIE NOTE: THINGS LIKE TEXT AND SPRITES MUST BE ADDED CORRECT ORDER
        // i.e. adding text, then background, means the text will be behind
        // the background, and therefore invisible.

        const { width, height } = this.game;

        this.gameplayState = GAMEPLAY_STATE.GETREADY;
        this.startState = 0; // this is janky forgive me!!!
        this.startStateTime = 120; // "Get Ready!" 2 seconds

        // collision groups
        this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.bulletCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.worldCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.powerupCollisionGroup = this.game.physics.p2.createCollisionGroup();

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
        borderSpriteBody.collides([
            this.playerCollisionGroup,
            this.enemyCollisionGroup,
            this.bulletCollisionGroup,
            this.powerupCollisionGroup,
        ]);

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
        // groups

        // assign collision groups
        this.player.body.setCollisionGroup(this.playerCollisionGroup);
        this.player.body.collides(this.worldCollisionGroup);
        this.player.body.collides(this.enemyCollisionGroup);
        this.player.body.collides(this.bulletCollisionGroup);
        this.player.body.collides(this.powerupCollisionGroup);

        this.player.setBulletsCollisionGroup(this.bulletCollisionGroup);
        this.player.setBulletsCollides(this.enemyCollisionGroup, this.bulletHitEnemy, this);

        // powerups
        this.groupPowerups = this.game.add.group();

        // enemies
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

        this.gameMessageCenter = new Phaser.Text(
            this.game,
            0,
            0,
            "",
            {
                font: "34px pixelsix", fill: "#fff",
                boundsAlignH: "center", boundsAlignV: "middle",
            },
        );
        this.gameMessageCenter.setTextBounds(0, 0, this.shmupBounds.width, this.shmupBounds.height);
        this.game.add.existing(this.gameMessageCenter);

        this.levelManager = new LevelManager(this);
    }

    public update(): void {
        this.updateShmup();
        for (let i: number = 0; i < this.backgrounds.length; i++) {
            this.backgrounds[i].tilePosition.y += (i + 1);
        }
        const shipUpdateMessage: ShipUpdateMessage = this.engineering.update();
        this.player.getUpdateMessage(shipUpdateMessage);

        if (this.playerDeathQueue.length && Math.random() < 0.2) {
            const playerDeathExplosion: Phaser.Sprite = this.playerDeathQueue.pop();
            playerDeathExplosion.visible = true;
            playerDeathExplosion.animations.getAnimation("explode").play(30, false, true);
        }

        // update time variables
        this.gameMessageCenterTime--;
        this.startStateTime--;

        this.levelManager.update();
    }

    public displayText(text: string, time: number) {
        this.gameMessageCenter.setText(text, true);
        this.gameMessageCenterTime = time;
    }

    public isDisplayingText(): boolean {
        return this.gameMessageCenterTime > 0;
    }

    public setUpcomingWaves(waves: Wave[]) {
        this.currentLevelWaves = waves;
        this.currentWaveIndex = 0;
    }

    public waveIndexAllDead(index: number) {
        return this.currentLevelWaves[index].allSpawned && this.currentLevelWaves[index].allDead();
    }

    private updateShmup(): void {
        switch (this.gameplayState) {
            case GAMEPLAY_STATE.GETREADY:
            switch (this.startState) {
                case READY_STATES.READY:
                // remember message and time were set it create
                if (this.startStateTime <= 0) {
                    this.startStateTime = 60; // one second dramatic pause
                    this.startState = READY_STATES.DRAMATIC_PAUSE;
                }
                break;
                case READY_STATES.DRAMATIC_PAUSE:
                if (this.startStateTime <= 0) {
                    this.displayText("GO!", 60);
                    this.startState = READY_STATES.GO;
                }
                break;
                case READY_STATES.GO:
                this.gameplayState = GAMEPLAY_STATE.WAVES;
                break;
            }
            break;
            case GAMEPLAY_STATE.WAVES:
            this.createWaves();
            break;
            case GAMEPLAY_STATE.BOSS:
            break;
            case GAMEPLAY_STATE.VICTORY:
            break;
        }
        this.displayGameMessages();
    }

    private displayGameMessages(): void {
        // center message
        if (this.gameMessageCenterTime <= 0) {
            this.gameMessageCenter.setText("");
        }
    }

    private allWavesFinished(): boolean {
        for (const wave of this.currentLevelWaves) {
            if (!wave.allSpawned) {
                return false;
            }
        }
        return true;
    }

    private createWaves(): void {
        if (this.currentWaveIndex === this.currentLevelWaves.length) {
            return;
        }

        const currentWave: Wave = this.currentLevelWaves[this.currentWaveIndex];

        currentWave.spawnDelay--;
        currentWave.enemyCreateTime--;

        if (currentWave.spawnDelay > 0) {
            return;
        }

        switch (currentWave.waveType) {
            case WAVE_TYPE.RANDOM:
                if (currentWave.enemyCreateTime <= 0) {
                    currentWave.enemyCreateTime = WAVE_RANDOM_ENEMY_TIME;
                    currentWave.spawnEnemyNumber++;
                    const minX: number = ENEMY_WIDTH;
                    const maxX: number = this.shmupBounds.width - this.borderSprite.width / 2 - ENEMY_WIDTH;
                    currentWave.addEnemy(
                        this.createEnemy(WAVE_TYPE.RANDOM, this.game.rnd.integerInRange(minX, maxX)),
                    );
                }
                if (currentWave.spawnEnemyNumber >= WAVE_RANDOM_ENEMY_MAX) {
                    currentWave.allSpawned = true;
                    this.currentWaveIndex ++;
                }
                break;
            case WAVE_TYPE.SWOOP_LEFT:
            case WAVE_TYPE.SWOOP_RIGHT:
                if (currentWave.spawnEnemyNumber < WAVE_SWOOP_ENEMY_COUNT_MAX) {
                    if (currentWave.enemyCreateTime <= 0) {
                        currentWave.enemyCreateTime = WAVE_SWOOP_ENEMY_TIME_MAX;
                        const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
                        if (currEnemy) {
                            currentWave.addEnemy(currEnemy);
                            if (currentWave.waveType === WAVE_TYPE.SWOOP_LEFT) {
                                currEnemy.reset(0 + WAVE_SWOOP_OFFSET, ENEMY_Y_SPAWN, currEnemy.maxHealth);
                            } else {
                                currEnemy.reset(
                                    this.game.width / 2 - WAVE_SWOOP_OFFSET, ENEMY_Y_SPAWN, currEnemy.maxHealth);
                            }
                            currEnemy.randomizeTimes();
                            currEnemy.setWaveType(WAVE_TYPE.SWOOP_LEFT);
                            currEnemy.setXVel(
                                currentWave.waveType === WAVE_TYPE.SWOOP_LEFT ? WAVE_SWOOP_XVEL : -WAVE_SWOOP_XVEL);
                        }
                        currentWave.spawnEnemyNumber++;
                    }
                } else {
                    currentWave.allSpawned = true;
                    this.currentWaveIndex ++;
                }
                break;
            case WAVE_TYPE.BIGV:
                const xSpawn: number = this.game.width / 4;
                let bigVEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(0);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-2 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(2 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-3 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(3 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 4, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-4 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.groupEnemies.getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 4, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(4 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                currentWave.allSpawned = true;
                this.currentWaveIndex ++;
                break;
            case WAVE_TYPE.ROW_LEFT:
                if (currentWave.spawnEnemyNumber < WAVE_ROWS_ENEMY_COUNT_MAX) {
                    if (currentWave.enemyCreateTime <= 0) {
                        currentWave.enemyCreateTime = WAVE_ROWS_ENEMY_TIME_MAX;
                        currentWave.addEnemy(this.createEnemy(
                            WAVE_TYPE.ROW_LEFT, WAVE_ROW_XOFFSET + ENEMY_WIDTH * currentWave.spawnEnemyNumber));
                        currentWave.spawnEnemyNumber++;
                    }
                } else {
                    currentWave.allSpawned = true;
                    this.currentWaveIndex ++;
                }
                break;
            case WAVE_TYPE.ROW_RIGHT:
                if (currentWave.spawnEnemyNumber < WAVE_ROWS_ENEMY_COUNT_MAX) {
                    if (currentWave.enemyCreateTime <= 0) {
                        currentWave.enemyCreateTime = WAVE_ROWS_ENEMY_TIME_MAX;
                        currentWave.addEnemy(this.createEnemy(
                            WAVE_TYPE.ROW_RIGHT,
                            this.game.width / 2 - (WAVE_ROW_XOFFSET + ENEMY_WIDTH * currentWave.spawnEnemyNumber)));
                        currentWave.spawnEnemyNumber++;
                    }
                } else {
                    currentWave.allSpawned = true;
                    this.currentWaveIndex ++;
                }
                break;
            case WAVE_TYPE.ROW_STRAIGHT:
                for (let i: number = 0; i < WAVE_ROWS_ENEMY_COUNT_MAX; i++) {
                    currentWave.addEnemy(
                        this.createEnemy(WAVE_TYPE.ROW_STRAIGHT, WAVE_ROW_XOFFSET + ENEMY_WIDTH * i),
                    );
                    currentWave.spawnEnemyNumber++;
                }
                currentWave.allSpawned = true;
                this.currentWaveIndex ++;
                break;
        }
    }

    private spawnPowerup(enemy: Phaser.Physics.P2.Body) {
        const powerup = Powerup.createRandom(this.game, enemy.x, enemy.y);
        this.groupPowerups.add(powerup);
        this.game.physics.p2.enable(powerup);
        const powerupBody: Phaser.Physics.P2.Body = powerup.body;
        powerupBody.setCollisionGroup(this.powerupCollisionGroup);
        powerupBody.velocity.y = Math.random() * 42;
        powerupBody.velocity.x = Math.random() * 42 - 84;
        powerupBody.fixedRotation = true;
        this.game.add.existing(powerup);
        powerupBody.collides([this.playerCollisionGroup, this.worldCollisionGroup], this.collectPowerup, this);
    }

    private collectPowerup(powerup: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body): void {
        if (player !== this.player.body) {
            return;
        }
        this.game.sound.play("powerup");
        const powerupSprite: Powerup = powerup.sprite as Powerup;
        if (this.engineering.createComponentByName(powerupSprite.getComponentName())) {
            powerupSprite.destroy();
        }
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
            this.game.sound.play("hit");
        }

        if (enemy.sprite.health <= 0) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                deathExplosion.reset(enemy.x, enemy.y);
                deathExplosion.play("explode", 30, false, true);
                this.game.sound.play("explosion");
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
            this.game.sound.play("dead");
        } else {
            this.game.sound.play("hurt");
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

    private createEnemy(waveType: number, xSpawn: number): BaseEnemy {
        const currEnemy: BaseEnemy = this.groupEnemies.getFirstExists(false);
        if (currEnemy) {
            currEnemy.randomizeTimes();
            currEnemy.setWaveType(waveType);
            currEnemy.reset(xSpawn, ENEMY_Y_SPAWN, currEnemy.maxHealth);
        }
        return currEnemy;
    }
}
