import { BaseComponent } from "../inventory/base_component";
import { WeightSubSystem } from "./weight_subsystem";

export class EngineSubSystem {

    private componentGroup: BaseComponent[];
    private weightSubSystem: WeightSubSystem;

    constructor(componentGroup: BaseComponent[], weightSubSystem: WeightSubSystem ) {
        this.componentGroup = componentGroup;
        this.weightSubSystem = weightSubSystem;
    }

    public getSpeed(): number {
        const weight =  this.weightSubSystem.getShipWeight();

        let speed = 0;
        for (const component of this.componentGroup) {
            speed += component.getSpeed();
        }

        return speed;
    }

}
