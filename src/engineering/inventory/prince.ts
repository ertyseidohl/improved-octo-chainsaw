import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import {  Constraints, InventorySystem } from "./system";

export class Prince extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position: Phaser.Point) {
        super(game, inventorySystem, "prince", 4, 4, position);

        const princeAnimation: Phaser.Animation = this.animations.add("glow", [1, 2, 3, 4]);
        princeAnimation.play(5, true);
    }

    public getDescription(): string[] {
        return [
            "Returning this [pri]mary [n]etwork [c]ontrol [e]lement is your objective!",
        ];
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
            powerConsumer: null,
            weight: 8,
        };
    }

    public getPower(): number {
        return 0;
    }
}
