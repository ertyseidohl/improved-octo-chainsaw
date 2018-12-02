import { Game } from "phaser-ce";
import { BaseComponent } from "./base_component";

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
}

export const BasicShip = [
    [0, 0, 0, 0, null, null, 0, 0, 0, 0],
    [0, 0, 0, null, null, null, null, 0, 0, 0],
    [0, 0, 0, null, null, null, null, 0, 0, 0],
    [0, 0, 0, null, null, null, null, 0, 0, 0],
    [0, 0, null, null, null, null, null, null, 0, 0],
    [0, null, null, null, null, null, null, null, null, 0],
    [null, null, null, null, null, null, null, null, null, null],
    [0, 0, null, null, 0, 0, null, null, 0, 0],
];

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

export interface Coordinate {
    x: number;
    y: number;
}

export class InventorySystem {

    private x: number;
    private y: number;
    private width: number;
    private height: number;

    private game: Phaser.Game;
    private tiles: Phaser.Group;
    private tileGrid: Phaser.Sprite[][];

    private constraintMap: {[s: string]: Set<SerializedIndex>};

    private tileHeight: number;
    private tileWidth: number;

    private grid: BaseComponentOrEmpty[][];

    private displayText: Phaser.Text;

    constructor(game: Phaser.Game, x: number, y: number,
                tileWidth: number, tileHeight: number,
                startingWidth: number, startingHeight: number, shipMap: BaseComponentOrEmpty[][]) {

        this.game = game;

        this.width = startingWidth;
        this.height = startingHeight;

        this.x = x;
        this.y = y;

        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;

        if (shipMap) {
            this.grid = shipMap;
            this.height = shipMap.length;
            this.width = shipMap[0].length;
        } else  {
            this.grid = [];
            for (let i = 0; i < this.height; i++) {
                this.grid[i] = [];
                for (let j = 0; j < this.width; j ++) {
                    this.grid[i][j] = null;
                }
            }
        }

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
        };

    }

    public release(component: BaseComponent): void {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.y][i.x] = null);
    }

    public test(component: BaseComponent): boolean {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const testIndexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);

        if (component.getPlacementConstraint() !== null) {
            const tileset = this.constraintMap[component.getPlacementConstraint()];
            if (! this.intersectionWithTileSet(testIndexes, tileset)) {
                return false;
            }
        }
        return this.allNone(testIndexes);
    }

    public place(component: BaseComponent): Coordinate {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.y][i.x] = component);

        return this.gridIndexToPixels(index.x, index.y);
    }

    public gridIndexToPixels(xIndex: number, yIndex: number): Coordinate {
        const x = this.x + (xIndex * this.tileWidth);
        const y = this.y + (yIndex * this.tileHeight);
        return {x, y};
    }

    public setDisplayText(text: string[]): void {
        this.displayText.setText(text);
    }

    public clearText(): void {
        this.displayText.clear();
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

    private intersectionWithTileSet(indexes: Index[], tileSet: Set<SerializedIndex>) {
        for (const index of indexes) {
            if (tileSet.has(index.toSerializedString())) {
                return true;
            }
        }
        return false;
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }

}
