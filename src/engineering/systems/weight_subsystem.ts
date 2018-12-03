import { BaseComponent } from "../inventory/base_component";
import { InventorySystem } from "../inventory/system";

export class WeightSubSystem {

    private inventorySystem: InventorySystem;

    constructor(inventorySystem: InventorySystem) {
        this.inventorySystem = inventorySystem;
    }

    public getShipWeight(): number {
        let weight = 0;

        for (const component of this.inventorySystem.getAllComponents()) {
            weight += component.getWeight();
        }

        return weight;
    }

}
