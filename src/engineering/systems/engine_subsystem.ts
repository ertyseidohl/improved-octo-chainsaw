import { InventorySystem } from "../inventory/system";

export class EngineSubSystem {

    private inventorySystem: InventorySystem;

    constructor(componentGroup: InventorySystem) {
        this.inventorySystem = componentGroup;
    }

    public getSpeed(): number {
        let speed = 0;
        for (const component of this.inventorySystem.getAllComponents()) {
            speed += component.getSpeed();
        }
        return speed;
    }

    public getPotentialSpeed(): number {
        let speed = 0;
        for (const component of this.inventorySystem.getAllComponents()) {
            speed += component.getPotentialSpeed();
        }
        return speed;
    }

}
