import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class Prince extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "prince", 4, 4, position);

        const princeAnimation: Phaser.Animation = this.animations.add("glow", [1, 2, 3, 4]);
        princeAnimation.play(5, true);
    }
    public getDescription(): string[] {
        return [
            "Returning this [pri]mary [n]etwork [c]ontrol [e]lement is your objective!",
        ];
    }

    public isIncineratable(): boolean {
        return false;
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
            powerConsumer: null,
            weight: 4,
        };
    }

    public getPower(): number {
        return 0;
    }
}
