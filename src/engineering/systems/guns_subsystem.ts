import { InventorySystem } from "../inventory/system";

export class GunSubSystem {

    private inventorySystem: InventorySystem;

    constructor(componentGroup: InventorySystem) {
        this.inventorySystem = componentGroup;
    }

    public getGuns(): number {
        let guns = 0;
        for (const component of this.inventorySystem.getAllComponents()) {
            guns += component.getGuns();
        }
        return guns;
    }

    public getPotentialGuns(): number {
        let guns = 0;
        for (const component of this.inventorySystem.getAllComponents()) {
            guns += component.getPotentialGuns();
        }
        return guns;
    }

}
