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
        if (this.onShip && !this.animation.isPlaying) {
            this.animation.play(20, true);
        } else if (!this.onShip) {
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
                minPowerDraw: 0,
            },
            powerSource: null,
            weight: 4,
        };
    }

    public getSpeed(): number {
        return 2;
    }

    public getDescription(): string[] {
        return [
            "This engine can burn kerosene, oil, antimatter, and three kinds of aliens for fuel.",
        ];
    }

}
