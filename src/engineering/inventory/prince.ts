import { BaseComponent } from "./base_component";
import {  Constraints, InventorySystem } from "./system";

export class Prince extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "prince", 4, 4);

        const princeAnimation: Phaser.Animation = this.animations.add("glow", [1, 2, 3, 4]);
        princeAnimation.play(5, true);
    }

    public getDescription(): string[] {
        return [
            "Returning this [pri]mary [n]etwork [c]ontrol [e]lement is your objective!",
        ];
    }

    public getPower(): number {
        return 0;
    }
}
