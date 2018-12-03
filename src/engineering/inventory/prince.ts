import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

export class Prince extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "prince", 4, 4, position);

        const princeAnimation: Phaser.Animation = this.animations.add("glow", [1, 2, 3, 4]);
        princeAnimation.play(5, true);
    }

    public reset(x: number, y: number, health?: number): Phaser.Sprite {
        if (y < this.height) {
            y = this.height;
        }
        return super.reset(x, y, health);
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
            weight: 1, // TODO
        };
    }

    public getPower(): number {
        return 0;
    }
}
