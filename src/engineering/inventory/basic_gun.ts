import { BaseComponent } from "./base_component";
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

}
