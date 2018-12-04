import { BaseComponent } from "./base_component";
import { StateConfig } from "./component_state";
import { InventorySystem } from "./system";

import { PowerSubSystem } from "../systems/power_subsystem";
import { ConnectedWire } from "../wiring/wire";

export class EnergyCell extends BaseComponent {

    private powerPadsIndexes: Map<number, ConnectedWire>;
    private powerPadsUsed = 0;
    private animation: Phaser.Animation;

    constructor(
        game: Phaser.Game,
        inventorySystem: InventorySystem,
        position?: Phaser.Point,
        key: string = "energy_cell",
        sizex: number = 1,
        sizey: number = 1,
    ) {
        super(game, inventorySystem, key, sizex, sizey, position);

        this.animation = this.animations.add("zap", [1, 2, 3, 4]);
        this.animation.play(5, true);

        this.powerPadsIndexes = this.generatePlugs();
    }

    public getStateConfig(): StateConfig {
        return {
            powerSource: {
                power: 4,
            },
            powerConsumer: null,
            weight: 2,
        };
    }

    public getDescription(): string[] {
        return [
            // tslint:disable-next-line
            "The ZZ-55000 is a real hair-raiser! Make sure to ground yourself before coming within 100 meters. Has 4 wires.",
        ];
    }

    public update(): void {
        super.update();

        if (this.onShip && !this.animation.isPlaying) {
            this.animation.play(20, true);
        } else if (!this.onShip) {
            this.animation.stop();
            this.frame = 0;
        }
    }

    public plugIn(index: number, wire: ConnectedWire) {
        this.powerPadsUsed += 1;
        this.powerPadsIndexes.set(index, wire);
    }

    public plugOut(index: number) {
        this.powerPadsUsed -= 1;
        this.powerPadsIndexes.set(index, null);
    }

    public getNextPowerPadIndex(): number {
        return this.first(this.powerPadsIndexes);
    }

    public getPowerPads(index: number): Phaser.Point {
        if (index >= 4) {
            return null;
        }
        return new Phaser.Point(
            this.x + this.powerPadsOffsets[index].x,
            this.y + this.powerPadsOffsets[index].y,
        );
    }

    public getPowerHandlePoint(): Phaser.Point {
        return new Phaser.Point(
            this.x + 15,
            this.y + 4,
        );
    }

    public disconnectAll(powerSystem: PowerSubSystem): void {
        for (let i = 0; i < this.powerPadsIndexes.size; i += 1) {
            const wire = this.powerPadsIndexes.get(i);
            if (!wire) {
                continue;
            }
            const sink = wire.getTerminalComponent();
            powerSystem.detach(this, sink, wire);
            wire.destroy();
        }
    }

    private generatePlugs(): Map<number, ConnectedWire> {
        const plugs = new Map<number, ConnectedWire>();
        for (let i = 0; i < 4; i += 1) {
            plugs.set(i, null);
        }
        return plugs;
    }

    private first(indexes: Map<number, ConnectedWire>): number {
        for (let i = 0; i < indexes.size; i += 1) {
            if (indexes.get(i) === null) {
                return i;
            }
        }
        return -1;
    }

}
