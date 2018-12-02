import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class ShieldGenerator extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "shield_generator", 2, 1);

        const gunFireAnimation: Phaser.Animation = this.animations.add("shield", [1, 2, 3, 4]);
        gunFireAnimation.play(10, true);
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 4,
                minPowerDraw: 2,
            },
        };
    }

    public getDescription(): string[] {
        return [
            "Shield your ship from enemies, friends, frenemies, and strangers!",
        ];
    }

}