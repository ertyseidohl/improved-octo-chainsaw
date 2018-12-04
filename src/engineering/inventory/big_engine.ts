import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class BigEngine extends BaseComponent {

    private animation: Phaser.Animation;

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "big_engine", 2, 2, position);
        this.animation = this.animations.add("burn", [1, 2]);
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

    public getPlacementConstraint(): Constraints {
        return Constraints.DOUBLE_BACK;
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 3,
                minPowerDraw: 3,
            },
            powerSource: null,
            weight: 8,
        };
    }

    public getSpeed(): number {
        return this.getPower() * 3;
    }

    public getDescription(): string[] {
        return [
            // tslint:disable-next-line
            "One hell of an engine. Requires 3 wires.",
        ];
    }

    public getPowerPads(index: number): Phaser.Point {
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + this.powerPadsOffsets[index].y,
        );
    }

}
