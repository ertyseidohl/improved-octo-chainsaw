import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class Engine extends BaseComponent {

    private animation: Phaser.Animation;

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "engine_1", 1, 2, position);
        this.animation = this.animations.add("burn", [1, 2, 3, 4]);
    }

    public update(): void {
        super.update();

        if (this.onShip && this.isOnline() && !this.animation.isPlaying) {
            this.animation.play(20, true);
        } else if (!this.onShip || !this.isOnline()) {
            this.animation.stop();
            this.frame = 0;
        }
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.BACK;
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 2,
                minPowerDraw: 1,
            },
            powerSource: null,
            weight: 4,
        };
    }

    public getSpeed(): number {
        return this.getPower();
    }

    public getPotentialSpeed(): number {
        return this.getStateConfig().powerConsumer.powerLoad;
    }

    public getDescription(): string[] {
        return [
            // tslint:disable-next-line
            "This engine can burn kerosene, oil, antimatter, and three kinds of aliens for fuel. Requires 1 wire, can take 2.",
        ];
    }

    public getPowerPads(index: number): Phaser.Point {
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + this.powerPadsOffsets[index].y,
        );
    }

}
