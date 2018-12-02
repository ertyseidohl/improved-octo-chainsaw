import { BaseComponent } from "./base_component";
import { InventorySystem } from "./system";

export class BasicGun extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "gun_1", 1, 3);

        const gunFireAnimation: Phaser.Animation = this.animations.add("fire");
        gunFireAnimation.play(20, true);
    }

    public getDescription(): string[] {
        return [
            "The GK-305 model is the hottest on the market! No seriously, you'll need, like, three heatsinks.",
        ];
    }

    public getPower(): number {
        return 2;
    }

}
