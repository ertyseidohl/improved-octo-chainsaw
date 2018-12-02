import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class Engine extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "engine_1_live", 1, 2);

        const engineAnimation: Phaser.Animation = this.animations.add("burn", [1, 2, 3, 4]);
        engineAnimation.play(20, true);
    }

}
