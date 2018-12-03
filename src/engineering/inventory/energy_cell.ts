import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class EnergyCell extends BaseComponent {

    private powerPadsIndexes = [0, 1, 2, 3];

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "energy_cell", 1, 1, position);

        const energyCellAnimation = this.animations.add("zap", [1, 2, 3, 4]);
        energyCellAnimation.play(20, true);
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
            "The ZZ-55000 is a real hair-raiser! Make sure to ground yourself before coming within 100 meters...",
        ];
    }

    public getNextPowerPadIndex(): number {
        if (this.powerPadsIndexes.length > 0) {
            return this.powerPadsIndexes[0];
        } else {
            return -1;
        }
    }

    public getPowerPads(index: number): Phaser.Point {
        if (this.powerPadsIndexes.length <= 0) {
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

}
