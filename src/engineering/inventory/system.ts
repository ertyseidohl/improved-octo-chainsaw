import { Game } from "phaser-ce";
import { BaseComponent } from "./base_component";
import { BaseDragHandler } from "./drag_handler/base";

export const NUM_TILE_SPRITES = 9;

const DISPLAY_TEXT_BUFFER = 100;
const DISPLAY_TEXT_STYLE: Phaser.PhaserTextStyle = {
    font: "pixelsix",
    fontSize: 24,
    fill: "white",
    wordWrap: true,
};

type BaseComponentOrEmpty = BaseComponent | number;

type SerializedIndex = string;

export enum Constraints {
    FRONT,
    BACK,
    DOUBLE_FRONT,
    DOUBLE_BACK,
}

abstract class Ship {
    public map: BaseComponentOrEmpty[][];
    public cargoHoldYStart: number;
}

export const INCINERATOR_BOUNDS: Phaser.Rectangle = new Phaser.Rectangle(
    1024 - 128, // mAgIc nUmBeRs
    128,
    64,
    64,
);

export class BasicShip extends Ship {
    constructor() {
        super();
        this.map =  [
            [0, 0, 0, 0, null, null, 0, 0, 0, 0],
            [0, 0, 0, null, null, null, null, 0, 0, 0],
            [0, 0, 0, null, null, null, null, 0, 0, 0],
            [0, 0, 0, null, null, null, null, 0, 0, 0],
            [0, 0, null, null, null, null, null, null, 0, 0],
            [0, null, null, null, null, null, null, null, null, 0],
            [null, null, null, null, null, null, null, null, null, null],
            [0, 0, null, null, 0, 0, null, null, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, null, null, null, null, 0, 0, 0],
            [0, null, null, null, null, null, null, null, null, 0],
            [0, null, null, null, null, null, null, null, null, 0],
            [0, 0, null, null, null, null, null, null, 0, 0],
        ];
        this.cargoHoldYStart = 8;
    }
}

class Index {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public toSerializedString(): string {
        return this.x + "," + this.y;
    }
}

export class InventorySystem {

    public dragHandler: BaseDragHandler;

    private x: number;
    private y: number;
    private width: number;
    private height: number;

    private game: Phaser.Game;
    private ship: Ship;
    private tiles: Phaser.Group;
    private tileGrid: Phaser.Sprite[][];

    private constraintMap: {[s: string]: Set<SerializedIndex>};
    private constraintCountMap: {[s: string]: number};

    private tileHeight: number;
    private tileWidth: number;

    private grid: BaseComponentOrEmpty[][];
    private components: BaseComponent[];

    private displayText: Phaser.Text;

    constructor(game: Phaser.Game, x: number, y: number,
                tileWidth: number, tileHeight: number,
                ship: Ship) {

        this.game = game;
        this.ship = ship;

        this.height = ship.map.length;
        this.width = ship.map[0].length;

        this.x = x;
        this.y = y;

        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;

        this.grid = ship.map;
        this.components = [];

        this.displayText = new Phaser.Text(
            this.game,
            this.x,
            this.y + (this.height * this.tileHeight) + DISPLAY_TEXT_BUFFER,
            "",
            {
                ...DISPLAY_TEXT_STYLE,
                wordWrapWidth: this.width * this.tileWidth,
            },
        );
        this.game.add.existing(this.displayText);

        this.createTiles();

        this.constraintMap = {
            [Constraints.FRONT]: this.getFrontTileSet(),
            [Constraints.BACK]: this.getRearTileSet(),
            [Constraints.DOUBLE_FRONT]: this.getFrontTileSet(),
            [Constraints.DOUBLE_BACK]: this.getRearTileSet(),
        };

        this.constraintCountMap = {
            [Constraints.FRONT]: 1,
            [Constraints.BACK]: 1,
            [Constraints.DOUBLE_FRONT]: 2,
            [Constraints.DOUBLE_BACK]: 2,
        };

    }

    public getAllComponents(): BaseComponent[] {
        return this.components;
    }

    public release(component: BaseComponent): void {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        component.onShip = false;
        indexes.map((i) => this.grid[i.y][i.x] = null);

        const idx = this.components.indexOf(component);
        this.components.splice(idx, 1);
        console.log(this.components);
    }

    public explode(): void {
        this.game.physics.p2.enable(this.tiles);
        this.tiles.forEach((tile: Phaser.Sprite) => {
            tile.body.velocity.x = (Math.random() * 128) - 64;
            tile.body.velocity.y = (Math.random() * 128) - 64;
        });
    }

    public test(component: BaseComponent): boolean {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const testIndexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        const currentConstraints: Constraints = component.getPlacementConstraint();

        if (index.y > this.ship.cargoHoldYStart) {
            return this.allNone(testIndexes);
        }

        if (currentConstraints !== null) {
            const tileset = this.constraintMap[currentConstraints];
            if (this.intersectionWithTileSet(testIndexes, tileset) < this.constraintCountMap[currentConstraints]) {
                return false;
            }
        }
        return this.allNone(testIndexes);
    }

    public place(component: BaseComponent): Phaser.Point {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.y][i.x] = component);

        if (index.y > this.ship.cargoHoldYStart) {
            component.onShip = false;
        } else {
            component.onShip = true;
        }

        this.components.push(component);
        return this.gridIndexToPixels(index.x, index.y);
    }

    public find(point: Phaser.Point): BaseComponent | undefined {
        const i = this.pixelToGridIndex(point.x, point.y, false);
        const col = this.grid[i.y];
        if (col) {
            const elem = col[i.x];
            if (elem instanceof BaseComponent) {
                return elem;
            }
        }
        return undefined;
    }

    public gridIndexToPixels(xIndex: number, yIndex: number): Phaser.Point {
        const x = this.x + (xIndex * this.tileWidth);
        const y = this.y + (yIndex * this.tileHeight);
        return new Phaser.Point(x, y);
    }

    public placeInFirstAvailable(component: BaseComponent): boolean {
        for (let i: number = 0; i < this.height; i++) {
            for (let j: number = 0; j < this.width; j++) {
                const newCoords = this.gridIndexToPixels(j, i);
                component.x = newCoords.x;
                component.y = newCoords.y;
                if (this.test(component)) {
                    this.place(component);
                    return true;
                }
            }
        }
        return false;
    }

    public setDisplayText(text: string[]): void {
        this.displayText.setText(text.join("\n"));
    }

    public clearText(): void {
        this.displayText.setText("");
    }

    private pixelToGridIndex(x: number, y: number, tile: boolean): Index {
        let offset = 0;
        if (tile) {
            offset = 16;
        }

        const dx = x - this.x + offset;
        const dy = y - this.y + offset;

        const ix = Math.floor(dx / this.tileWidth);
        const iy = Math.floor(dy / this.tileHeight);

        return new Index(ix, iy);
    }

    private generate_indexes(originIndex: Index, width: number, height: number) {
        const indexes = [];
        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                indexes.push(new Index(originIndex.x + x , originIndex.y + y));
            }
        }
        return indexes;
    }

    private allNone(indexes: Index[]): boolean {
        for (const index of indexes) {
            if (index.x < 0 || index.x >= this.width || index.y < 0 || index.y >= this.height) {
                return false;
            }
            if (this.grid[index.y][index.x] != null) {
                return false;
            }
        }
        return true;
    }

    private createTiles(): void {
        this.tiles = this.game.add.group();
        this.tileGrid = [];

        for (let j: number = 0; j < this.height; j++) {
            this.tileGrid[j] = [];
            for (let i: number = 0; i < this.width; i++) {
                if (this.grid[j][i] === null) {
                    const tile = this.tiles.create(
                        this.x + (32 * i),
                        this.y + (32 * j),
                        this.getTileSprite(),
                    );

                    this.tileGrid[j][i] = tile;
                }
            }
        }
    }

    private getFrontTileSet(): Set<SerializedIndex> {
        const myset = new Set<SerializedIndex>();

        for (let i: number = 0; i < this.width; i++) {
            for (let j: number = 0; j < this.height; j++) {
                if (this.tileGrid[j][i] && (j - 1 < 0 || !this.tileGrid[j - 1][i] )) {
                    myset.add(new Index(i, j).toSerializedString());
                }
            }
        }

        return myset;
    }

    private getRearTileSet(): Set<SerializedIndex> {
        const myset = new Set<SerializedIndex>();

        for (let i: number = 0; i < this.width; i++) {
            for (let j: number = 0; j < this.height; j++) {
                if (this.tileGrid[j][i] && (j + 1 >= this.height || !this.tileGrid[j + 1][i] )) {
                    myset.add(new Index(i, j).toSerializedString());
                }
            }
        }
        return myset;
    }

    private intersectionWithTileSet(indexes: Index[], tileSet: Set<SerializedIndex>): number {
        let numIntersections: number = 0;
        for (const index of indexes) {
            if (tileSet.has(index.toSerializedString())) {
                numIntersections ++;
            }
        }
        return numIntersections;
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }

}
