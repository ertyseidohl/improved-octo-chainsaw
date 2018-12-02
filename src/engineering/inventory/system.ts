import { Game } from "phaser-ce";
import { BaseComponent } from "./base_component";

export const NUM_TILE_SPRITES = 9;

type BaseComponentOrEmpty = BaseComponent | number;

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

interface Index {
    x: number;
    y: number;
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

    private tileHeight: number;
    private tileWidth: number;

    private grid: BaseComponentOrEmpty[][];

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

        this.createTiles();
    }

    public release(component: BaseComponent): void {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.y][i.x] = null);
    }

    public test(component: BaseComponent): boolean {
        const index = this.pixelToGridIndex(component.x, component.y, true);
        const testIndexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);

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

    private pixelToGridIndex(x: number, y: number, tile: boolean): Index {
        let offset = 0;
        if (tile) {
            offset = 16;
        }

        const dx = x - this.x + offset;
        const dy = y - this.y + offset;

        const ix = Math.floor(dx / this.tileWidth);
        const iy = Math.floor(dy / this.tileHeight);
    
        return {
            x: ix,
            y: iy,
        };
    }

    private generate_indexes(originIndex: Index, width: number, height: number) {
        const indexes = [];
        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
                indexes.push({x: originIndex.x + x , y: originIndex.y + y});
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
        for (let i: number = 0; i < this.width; i++) {
            for (let j: number = 0; j < this.height; j++) {
                if (this.grid[j][i] === null) {
                    this.tiles.create(
                        this.x + (32 * i),
                        this.y + (32 * j),
                        this.getTileSprite(),
                    );
                }
            }
        }
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }

}
