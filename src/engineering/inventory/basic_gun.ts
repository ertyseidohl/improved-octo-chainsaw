import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class BasicGun extends BaseComponent {

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "gun_1", 1, 3, position);

        const gunFireAnimation: Phaser.Animation = this.animations.add("fire");
        gunFireAnimation.play(20, true);
    }

    public getPlacementConstraint(): Constraints {
        return Constraints.FRONT;
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 2,
                minPowerDraw: 1,
            },
            powerSource: null,
            weight: 6,
        };
    }

    public getDescription(): string[] {
        return [
            "The GK-305 model is the hottest on the market! No seriously, you'll need, like, three heatsinks.",
        ];
    }

    public getGuns(): number {
        return 1;
    }

    public getPowerPads(index: number): Phaser.Point {
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + 64 + this.powerPadsOffsets[index].y,
        );
    }

}
