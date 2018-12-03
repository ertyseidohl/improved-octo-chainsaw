import BaseEnemy from "../enemies/base_enemy";
import BasicEnemy from "../enemies/basic_enemy";
import BossEnemy from "../enemies/boss_enemy";
import DummyDrone from "../enemies/dummy_drone";

import BaseStation from "../player/base_station";

import { COMPONENT_TYPES, ENEMY_TYPES, WAVE_TYPE } from "../constants";

import Engineering, { ShipUpdateMessage } from "../engineering/engineering";
import LevelManager from "../levels/level_manager";
import Player from "../player/player";
import { BasicGunPowerup, EnginePowerup, Powerup, PrincePowerup } from "../player/powerup";

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

export default class Gameplay extends Phaser.State {
    private testPowerup: Powerup;

    private gameMessageCenter: Phaser.Text;
    private gameMessageCenterTime: number; // set negative if infinite

    // game objects
    private player: Player;
    private playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private enemyCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private bulletCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private worldCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private powerupCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    private backgrounds: Phaser.TileSprite[];
    private playerDeathQueue: Phaser.Sprite[];

    private currentLevelWaves: Wave[];
    private currentWaveIndex: number;

    private levelManager: LevelManager;

    // level stuff
    private level: number;

    // groups
    private groupExplosions: Phaser.Group;
    private groupExplosionsSmall: Phaser.Group;
    private groupPowerups: Phaser.Group;

    private enemyGroups: {[s: string]: Phaser.Group};

    private shmupBounds: Phaser.Rectangle;
    private engineeringBounds: Phaser.Rectangle;

    private borderSprite: Phaser.Sprite;
    private baseStation: BaseStation;

    // engineering section
    private engineering: Engineering;

    private enter: Phaser.Key;

    public preload(): void {
        this.game.load.image("player", "../assets/ship.png");
        this.game.load.image("border", "../assets/border.png");
        this.game.load.image("bullet", "../assets/laser.png");
        this.game.load.image("enemyBullet", "../assets/enemy-bullet.png");
        this.game.load.image("powerup", "../assets/powerup.png");
        this.game.load.image("health", "../assets/powerup.png");
        this.game.load.image("engine", "../assets/powerup.png");
        this.game.load.image("weight", "../assets/powerup.png");

        this.game.load.image("base_station", "../assets/base_station.png");

        this.game.load.image("enemy", "../assets/enemy_1.png");
        this.game.load.spritesheet("boss_enemy", "../assets/boss_enemy.png", 128, 128, 3);
        this.game.load.spritesheet("dummy_drone", "../assets/dummy_drone.png", 64, 64, 3);

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

        Engineering.preload(this.game);
    }

    public create(): void {

        // NOOBIE NOTE: THINGS LIKE TEXT AND SPRITES MUST BE ADDED CORRECT ORDER
        // i.e. adding text, then background, means the text will be behind
        // the background, and therefore invisible.

        const { width, height } = this.game;

        this.backgrounds = [];
        this.playerDeathQueue = [];

        this.enemyGroups = {};

        this.engineering = new Engineering(this);

        this.enter = this.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.enter.onDown.add(this.clearText, this);

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

        //  baseStation
        this.baseStation = new BaseStation(this.game, 0, 0);
        this.game.add.existing(this.baseStation);
        this.baseStation.kill();

        // the player
        this.player = new Player(this.game, this.game.width / 4, this.game.height - 50, "player");
        this.game.add.existing(this.player);

        // setup engineering
        this.engineering.create();

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

        // basic enemies
        this.generateEnemyGroup(30, ENEMY_TYPES.BASIC);
        this.generateEnemyGroup(2, ENEMY_TYPES.BOSS);
        this.generateEnemyGroup(2, ENEMY_TYPES.DUMMY_DRONE);

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
                wordWrap: true, wordWrapWidth: this.shmupBounds.width - 30,
            },
        );
        this.gameMessageCenter.setTextBounds(0, 0, this.shmupBounds.width, this.shmupBounds.height);
        this.game.add.existing(this.gameMessageCenter);

        this.levelManager = new LevelManager(this);
        this.currentLevelWaves = [];
        this.currentWaveIndex = 0;
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

        if (!this.player.alive && !this.playerDeathQueue.length) {
            this.game.state.start("gameover");
        }

        // update time variables
        this.gameMessageCenterTime--;

        this.levelManager.update();
    }

    public displayText(text: string, time: number) {
        this.gameMessageCenter.setText(text, true);
        this.gameMessageCenterTime = time;
    }

    public isDisplayingText(): boolean {
        return this.gameMessageCenterTime > 0;
    }

    public generateBaseStation(): void {
        this.baseStation.reset(this.shmupBounds.width / 4, -64);
        this.player.dock(this.baseStation.getDockPoint());
    }

    public baseStationDone(): boolean {
        if (this.baseStation.y > this.player.y - this.player.height) {
            this.engineering.clearAllPrinces();
        }
        if (this.baseStation.y > this.shmupBounds.height) {
            console.log("BASE STATION DONE");
            this.baseStation.kill();
            this.player.undock();
            return true;
        }
        return false;
    }

    public setUpcomingWaves(waves: Wave[]) {
        this.currentLevelWaves = waves;
        this.currentWaveIndex = 0;
    }

    public waveIndexAllDead(index: number) {
        return this.currentLevelWaves[index].allSpawned && this.currentLevelWaves[index].allDead();
    }

    public princeInInventory(): boolean {
        return this.engineering.princeInInventory();
    }

    public testPowerupPickedUp() {
        if (!this.testPowerup) {
            return false;
        }
        return !this.testPowerup.alive;
    }

    public engineeringHasConnectedTestComponent() {
        return this.engineering.hasConnectedTestComponent();
    }

    private updateShmup(): void {
        this.createWaves();
        this.displayGameMessages();
    }

    private displayGameMessages(): void {
        // center message
        if (this.gameMessageCenterTime <= 0) {
            this.gameMessageCenter.setText("");
        }
    }

    private generateEnemyGroup(count: number, enemyType: ENEMY_TYPES) {
        const group: Phaser.Group = this.game.add.group();
        this.enemyGroups[enemyType] = group;

        for (let i: number = 0; i < ENEMY_POOL_COUNT; i++) {
            let newEnemy: BaseEnemy;
            switch (enemyType) {
                case ENEMY_TYPES.BASIC:
                    newEnemy = new BasicEnemy(this.game, Math.random(), 0);
                    break;
                case ENEMY_TYPES.BOSS:
                    newEnemy = new BossEnemy(this.game, Math.random(), 0);
                    break;
                case ENEMY_TYPES.DUMMY_DRONE:
                    newEnemy = new DummyDrone(this.game, Math.random(), 0);
                    break;
            }
            newEnemy.setBulletsCollisionGroup(this.bulletCollisionGroup);
            newEnemy.setBulletsCollides(this.playerCollisionGroup, this.bulletHitPlayer, this);
            this.enemyGroups[enemyType].add(newEnemy);
            newEnemy.kill();
        }
        this.game.physics.p2.enable(this.enemyGroups[enemyType]);
        this.enemyGroups[enemyType].setAll("body.collideWorldBounds", false);
        this.enemyGroups[enemyType].forEach((enemy: Phaser.Sprite) => {
            const enemyBody: Phaser.Physics.P2.Body = enemy.body;
            enemyBody.setCollisionGroup(this.enemyCollisionGroup);
            enemyBody.collides([this.playerCollisionGroup, this.bulletCollisionGroup]);
            enemyBody.fixedRotation = true;
        });

        return group;
    }

    private clearText() {
        this.gameMessageCenterTime = 0;
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
            case WAVE_TYPE.BOSS:
                currentWave.addEnemy(this.createEnemy(WAVE_TYPE.BOSS, this.shmupBounds.width / 2, ENEMY_TYPES.BOSS));
                currentWave.allSpawned = true;
                this.currentWaveIndex ++;
                break;
            case WAVE_TYPE.DUMMY_DRONE:
                currentWave.addEnemy(
                    this.createEnemy(WAVE_TYPE.DUMMY_DRONE, this.shmupBounds.width / 2, ENEMY_TYPES.DUMMY_DRONE));
                currentWave.allSpawned = true;
                this.currentWaveIndex ++;
                break;
            case WAVE_TYPE.RANDOM:
                if (currentWave.enemyCreateTime <= 0) {
                    currentWave.enemyCreateTime = WAVE_RANDOM_ENEMY_TIME;
                    currentWave.spawnEnemyNumber++;
                    const minX: number = ENEMY_WIDTH;
                    const maxX: number = this.shmupBounds.width - this.borderSprite.width / 2 - ENEMY_WIDTH;
                    currentWave.addEnemy(
                        this.createEnemy(WAVE_TYPE.RANDOM, this.game.rnd.integerInRange(minX, maxX), ENEMY_TYPES.BASIC),
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
                        const currEnemy: BaseEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
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
                let bigVEnemy: BaseEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(0);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-2 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 2, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(2 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-3 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 3, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(3 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
                if (bigVEnemy) {
                    bigVEnemy.reset(xSpawn, ENEMY_Y_SPAWN - WAVE_BIGV_SPACER * 4, bigVEnemy.maxHealth);
                    bigVEnemy.setWaveType(WAVE_TYPE.BIGV);
                    bigVEnemy.setXVel(-4 * WAVE_BIGV_XSPREAD);
                    bigVEnemy.randomizeTimes();
                    currentWave.addEnemy(bigVEnemy);
                }
                bigVEnemy = this.enemyGroups[ENEMY_TYPES.BASIC].getFirstExists(false);
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
                            WAVE_TYPE.ROW_LEFT,
                            WAVE_ROW_XOFFSET + ENEMY_WIDTH * currentWave.spawnEnemyNumber,
                            ENEMY_TYPES.BASIC,
                        ));
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
                            this.game.width / 2 - (WAVE_ROW_XOFFSET + ENEMY_WIDTH * currentWave.spawnEnemyNumber),
                            ENEMY_TYPES.BASIC));
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
                        this.createEnemy(WAVE_TYPE.ROW_STRAIGHT, WAVE_ROW_XOFFSET + ENEMY_WIDTH * i, ENEMY_TYPES.BASIC),
                    );
                    currentWave.spawnEnemyNumber++;
                }
                currentWave.allSpawned = true;
                this.currentWaveIndex ++;
                break;
        }
    }

    private spawnPowerup(enemy: Phaser.Physics.P2.Body, powerupType: COMPONENT_TYPES): Powerup {
        let powerup;
        switch (powerupType) {
            case COMPONENT_TYPES.BASIC_GUN:
                powerup = new BasicGunPowerup(this.game, enemy.x, enemy.y);
                break;
            case COMPONENT_TYPES.ENGINE:
                powerup = new EnginePowerup(this.game, enemy.x, enemy.y);
                break;
            case COMPONENT_TYPES.PRINCE:
                powerup = new PrincePowerup(this.game, enemy.x, enemy.y);
                break;
        }
        if (!this.testPowerup) {
            this.testPowerup = powerup;
            powerup.lifespan = Infinity;
        }
        this.groupPowerups.add(powerup);
        this.game.physics.p2.enable(powerup);
        const powerupBody: Phaser.Physics.P2.Body = powerup.body;
        powerupBody.setCollisionGroup(this.powerupCollisionGroup);
        powerupBody.velocity.y = Math.random() * 42;
        powerupBody.velocity.x = Math.random() * 42 - 84;
        powerupBody.fixedRotation = true;
        this.game.add.existing(powerup);
        powerupBody.collides([this.playerCollisionGroup, this.worldCollisionGroup], this.collectPowerup, this);
        return powerup;
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
        const enemySprite = enemy.sprite as BaseEnemy;
        if (!enemySprite.alive) {
            bullet.sprite.kill();
            return;
        }

        if (!bullet.sprite.alive) {
            return;
        }

        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 15, false, true);
        }

        if (bullet.sprite.alive) {
            enemySprite.damage(1);
            this.game.sound.play("hit");
        }

        if (enemySprite.health <= 0 ) {
            const deathExplosion: Phaser.Sprite = this.groupExplosions.getFirstExists(false);
            if (deathExplosion) {
                deathExplosion.reset(enemy.x, enemy.y);
                deathExplosion.play("explode", 15, false, true);
                this.game.sound.play("explosion");
            }
            const powerupType: COMPONENT_TYPES | null = enemySprite.getPowerupToSpawn();
            if (powerupType) {
                this.spawnPowerup(enemy, powerupType);
            }
        }

        bullet.sprite.kill();
    }

    private bulletHitPlayer(bullet: Phaser.Physics.P2.Body, player: Phaser.Physics.P2.Body): void {
        const explosion: Phaser.Sprite = this.groupExplosionsSmall.getFirstExists(false);
        if (explosion) {
            explosion.reset(bullet.x, bullet.y);
            explosion.play("explode", 30, false, true);
        }

        this.engineering.damagePlayer(1);

        if (this.engineering.getPlayerHealth() <= 0) {
            this.explodePlayer(this.player);
            this.game.sound.play("dead");
        } else {
            this.game.sound.play("hurt");
        }

        bullet.sprite.kill();
    }

    private explodePlayer(player: Phaser.Sprite): void {
        this.engineering.explode();
        this.player.kill();
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

    private createEnemy(waveType: number, xSpawn: number, enemyType: ENEMY_TYPES): BaseEnemy {
        const currEnemy: BaseEnemy = this.enemyGroups[enemyType].getFirstExists(false);
        if (currEnemy) {
            currEnemy.randomizeTimes();
            currEnemy.setWaveType(waveType);
            currEnemy.reset(xSpawn, ENEMY_Y_SPAWN, currEnemy.maxHealth);
        }
        return currEnemy;
    }
}
