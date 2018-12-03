import { BaseComponent } from "../inventory/base_component";
import { InventorySystem } from "../inventory/system";

export class ShieldSubSystem {

    private inventorySystem: InventorySystem;

    constructor(inventorySystem: InventorySystem) {
        this.inventorySystem = inventorySystem;
    }

    public getShielding(): number {
        let shielding = 0;

        for (const component of this.inventorySystem.getAllComponents()) {
            shielding += component.getShielding();
        }

        return shielding;
    }

}
