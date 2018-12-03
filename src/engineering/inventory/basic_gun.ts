import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class BasicGun extends BaseComponent {

    private animation: Phaser.Animation;
    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "gun_1", 1, 3, position);

        this.animation = this.animations.add("fire");
        this.animation.play(20, true);
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

    public update(): void {
        super.update();

        if (this.onShip && this.isOnline() && !this.animation.isPlaying) {
            this.animation.play(20, true);
        } else if (!this.onShip || !this.isOnline()) {
            this.animation.stop();
            this.frame = 0;
        }
    }

    public getDescription(): string[] {
        return [
            "The GK-305 model is the hottest on the market! No seriously, you'll need, like, three heatsinks.",
        ];
    }

    public getGuns(): number {
        return this.getPower();
    }

    public getPowerPads(index: number): Phaser.Point {
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + 64 + this.powerPadsOffsets[index].y,
        );
    }

}
