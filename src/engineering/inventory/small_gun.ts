import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class SmallGun extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "gun_small", 1, 2);

        const gunFireAnimation: Phaser.Animation = this.animations.add("fire", [1, 2, 3, 4]);
        gunFireAnimation.play(10, true);
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.FRONT;
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 1,
                minPowerDraw: 0.5,
            },
            powerSource: null,
        };
    }

    public getDescription(): string[] {
        return [
            "This gun is actually just four smaller guns taped together.",
        ];
    }

}