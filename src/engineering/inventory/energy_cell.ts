import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class EnergyCell extends BaseComponent {

    private powerPadsIndexes: Map<number, boolean>;
    private powerPadsUsed = 0;

    constructor(
        game: Phaser.Game,
        inventorySystem: InventorySystem,
        position?: Phaser.Point,
        key: string = "energy_cell",
        sizex: number = 1,
        sizey: number = 1,
    ) {
        super(game, inventorySystem, key, sizex, sizey, position);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(5, true);

        this.powerPadsIndexes = this.generatePlugs();
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
            powerConsumer: null,
            weight: 2,
        };
    }

    public getDescription(): string[] {
        return [
            // tslint:disable-next-line
            "The ZZ-55000 is a real hair-raiser! Make sure to ground yourself before coming within 100 meters. Has 4 wires.",
        ];
    }

    public plugIn(index: number) {
        this.powerPadsUsed += 1;
        this.powerPadsIndexes.set(index, true);
    }

    public getNextPowerPadIndex(): number {
        return this.first(this.powerPadsIndexes);
    }

    public getPowerPads(index: number): Phaser.Point {
        if (index >= 4) {
            return null;
        }
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + this.powerPadsOffsets[index].y,
        );
    }

    public getPowerHandlePoint(): Phaser.Point {
        return new Phaser.Point(
            this.x + 15,
            this.y + 4,
        );
    }

    private generatePlugs(): Map<number, boolean> {
        const plugs = new Map<number, boolean>();
        for (let i = 0; i < 4; i += 1) {
            plugs.set(i, false);
        }
        return plugs;
    }

    private first(indexes: Map<number, boolean>): number {
        for (let i = 0; i < indexes.size; i += 1) {
            if (indexes.get(i) === false) {
                return i;
            }
        }
        return -1;
    }

}
