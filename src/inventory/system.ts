import { Game } from "phaser-ce";
import { BaseComponent } from "./base_component";

interface Index {
    x: number;
    y: number;
}

export class InventorySystem {

    private x: number;
    private y: number;
    private width: number;
    private height: number;

    private tileHeight: number;
    private tileWidth: number;

    private grid: BaseComponent[][];

    constructor(x: number, y: number,
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

    public release(component: BaseComponent) {
        const index = this.pixelToGridIndex(component.x, component.y);
        const indexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        indexes.map((i) => this.grid[i.x][i.y] = null);
    }

    public test(component: BaseComponent): boolean {
        const index = this.pixelToGridIndex(component.x, component.y);
        const testIndexes = this.generate_indexes(index, component.tileWidth, component.tileHeight);
        return this.allNone(testIndexes);
    }

    public place(component: BaseComponent) {
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

}
