import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class BasicGun extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "gun_1", 1, 3);

        const gunFireAnimation: Phaser.Animation = this.animations.add("fire");
        gunFireAnimation.play(20, true);
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.FRONT;
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 2,
                minPowerDraw: 1,
            },
        };
    }

    public getDescription(): string[] {
        return [
            "The GK-305 model is the hottest on the market! No seriously, you'll need, like, three heatsinks.",
        ];
    }

}
