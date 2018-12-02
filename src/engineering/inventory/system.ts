import { Game } from "phaser-ce";
import { BaseComponent } from "./base_component";

const NUM_TILE_SPRITES = 9;

interface Index {
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

    private grid: BaseComponent[][];

    constructor(game: Phaser.Game, x: number, y: number,
                tileWidth: number, tileHeight: number,
                startingWidth: number, startingHeight: number) {

        this.width = startingWidth;
        this.height = startingHeight;

        this.x = x;
        this.y = y;

        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;

        this.grid = [];
        for (let i = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.height; j ++) {
                this.grid[i][j] = null;
            }
        }
    }

    public preload(): void {
        for (let i: number = 1; i <= NUM_TILE_SPRITES; i++) {
            this.game.load.image(`floor_tile_${i}`, `../assets/floor_tile_${i}.png`);
        }
    }

    public release(component: BaseComponent): void {
        const index = this.pixelToGridIndex(component.x, component.y);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.x][i.y] = null);
    }

    public test(component: BaseComponent): boolean {
        const index = this.pixelToGridIndex(component.x, component.y);
        const testIndexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        return this.allNone(testIndexes);
    }

    public place(component: BaseComponent): void {
        const index = this.pixelToGridIndex(component.x, component.y);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.y][i.y] = component);
    }

    private pixelToGridIndex(x: number, y: number): Index {

        const dx = x - this.x;
        const dy = y - this.y;

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
            if (this.grid[index.x][index.y] != null) {
                return false;
            }
        }
        return true;
    }

    private createTiles(): void {
        this.tiles = this.game.add.group();

        for (let i: number = 0; i < this.tileWidth; i++) {
            for (let j: number = 0; j < this.tileHeight; j++) {
                this.tiles.create(
                    this.x + (32 * i),
                    this.y + (32 * j),
                    this.getTileSprite(),
                );
            }
        }
    }

    private getTileSprite(): string {
        const r: number = Math.floor(Math.random() * NUM_TILE_SPRITES) + 1;
        return `floor_tile_${r}`;
    }

}
