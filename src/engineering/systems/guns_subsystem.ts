import { InventorySystem } from "../inventory/system";

export class GunSubSystem {

    private inventorySystem: InventorySystem;

    constructor(componentGroup: InventorySystem) {
        this.inventorySystem = componentGroup;
    }

    public getGuns(): number {
        let speed = 0;
        for (const component of this.inventorySystem.getAllComponents()) {
            speed += component.getGuns();
        }
        return speed;
    }

}
