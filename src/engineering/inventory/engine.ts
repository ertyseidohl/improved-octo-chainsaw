import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class Engine extends BaseComponent {

    private animating: boolean = false;

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "engine_1", 1, 2, position);
    }

    public update(): void {
        if (this.onShip && !this.animating) {
            this.animating = true;
            const engineAnimation: Phaser.Animation = this.animations.add("burn", [1, 2, 3, 4]);
            engineAnimation.play(20, true);
        } else if (!this.onShip) {
            this.animating = false;
            this.animations.getAnimation("burn").stop();
            this.frame = 0;
        }
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.BACK;
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: null,
            powerConsumer: {
                powerLoad: 2,
                minPowerDraw: 0,
            },
        };
    }

    public getDescription(): string[] {
        return [
            "This engine can burn kerosene, oil, antimatter, and three kinds of aliens for fuel.",
        ];
    }

}
