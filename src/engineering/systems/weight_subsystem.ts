import { BaseComponent } from "../inventory/base_component";

export class WeightSubSystem {

    private componentGroup: BaseComponent[];

    constructor(componentGroup: BaseComponent[]) {
        this.componentGroup = componentGroup;
    }

    public getShipWeight(): number {
        let weight = 0;

        for (const component of this.componentGroup) {
            weight += component.getWeight();
        }

        return weight;
    }

}
