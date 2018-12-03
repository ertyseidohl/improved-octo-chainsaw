import { ShipUpdateMessage } from "../engineering";

import { InventorySystem } from "../inventory/system";

import { EngineSubSystem } from "./engine_subsystem";
import { GunSubSystem } from "./guns_subsystem";
import { WeightSubSystem } from "./weight_subsystem";

export class System {

    private engineSubSystem: EngineSubSystem;
    private weightSubSystem: WeightSubSystem;
    private gunsSubSystem: GunSubSystem;

    constructor(inventorySystem: InventorySystem) {
        this.weightSubSystem = new WeightSubSystem(inventorySystem);
        this.engineSubSystem = new EngineSubSystem(inventorySystem);
        this.gunsSubSystem = new GunSubSystem(inventorySystem);
    }

    public update(): ShipUpdateMessage {
        const weight = this.weightSubSystem.getShipWeight();
        const topSpeed = this.engineSubSystem.getSpeed();
        const guns = this.gunsSubSystem.getGuns();
        return {
            guns,
            topSpeed,
            weight,
        };
    }

}
