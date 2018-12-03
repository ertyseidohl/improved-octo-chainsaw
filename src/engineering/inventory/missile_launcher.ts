import { BaseComponent } from "./base_component";
import { PowerConsumerStateConfig, StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class MissileLauncher extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "missile_launcher", 2, 2, position);

        const missileFireAnimation: Phaser.Animation = this.animations.add("fire", [1, 2, 3, 4, 5, 6, 7]);
        missileFireAnimation.play(5, true);
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.DOUBLE_FRONT;
    }

    public getDescription(): string[] {
        return [
            "This fires 4 missiles at once, which is 4 times more than one missile!",
        ];
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
            powerConsumer: null,
        };
    }

    public getPower(): number {
        return 4;
    }

}
