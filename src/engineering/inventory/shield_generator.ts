import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { Constraints, InventorySystem } from "./system";

export class ShieldGenerator extends BaseComponent {

    private animation: Phaser.Animation;

    constructor(game: Phaser.Game, inventorySystem: InventorySystem, position?: Phaser.Point) {
        super(game, inventorySystem, "shield_generator", 2, 1, position);
        this.animation = this.animations.add("shield", [1, 2, 3, 4]);
    }

    public update(): void {
        super.update();

        if (this.onShip && this.isOnline() && !this.animation.isPlaying) {
            this.animation.play(5, true);
        } else if (!this.onShip || !this.isOnline()) {
            this.animation.stop();
            this.frame = 0;
        }
    }

    public getStateConfig(): StateConfig {
        return {
            powerConsumer: {
                powerLoad: 4,
                minPowerDraw: 4,
            },
            powerSource: null,
            weight: 4,
        };
    }

    public getShielding(): number {
        return 5;
    }

    public getDescription(): string[] {
        return [
            "Shield your ship from enemies, friends, frenemies, and strangers! Requires 4 power to run",
        ];
    }

    public getPowerPads(index: number): Phaser.Point {
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + this.powerPadsOffsets[index].y,
        );
    }

}
