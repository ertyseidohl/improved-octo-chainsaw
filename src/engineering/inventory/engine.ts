import { BaseComponent } from "./base_component";
import {  Constraints, InventorySystem } from "./system";

export class Engine extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, x: number, y: number) {
        super(game, inventorySystem, x, y, "engine_1", 1, 2);

        const engineAnimation: Phaser.Animation = this.animations.add("burn", [1, 2, 3, 4]);
        engineAnimation.play(20, true);
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.BACK;
    }

    public getDescription(): string[] {
        return [
            "This engine can burn kerosene, oil, antimatter, and three kinds of aliens for fuel.",
        ];
    }

    public getPower(): number {
        return -2;
    }
}
