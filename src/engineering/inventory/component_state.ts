export enum PowerFunction {
    StepFunction,
    Fractional,
    OnOff,
}

export interface StateConfig {
    powerConsumer?: PowerConsumerStateConfig;
    powerSource?: PowerSourceStateConfig;
}

export interface PowerSourceStateConfig {
    power: number;
}

export interface PowerConsumerStateConfig {
    powerLoad: number;
    minPowerDraw: number;
    powerFunction: PowerFunction;
    powerFunctionSteps: number[];
}

export class ComponentState {

    private health: number;

    private power: number;

    private powerConsumer: PowerConsumerStateConfig;
    private powerSource: PowerSourceStateConfig;

    constructor(config: StateConfig) {
        this.powerConsumer = config.powerConsumer;
        this.powerSource = config.powerSource;
        this.health = 100;
    }

    public isOnline(): boolean {
        return this.power > this.powerConsumer.minPowerDraw;
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public getPowerLoad(): number {
        return this.powerConsumer.powerLoad;
    }

    public applyPower(power: number): void {
        if (power > this.powerConsumer.powerLoad) {
            power = this.powerConsumer.powerLoad;
        }
        this.power = power;
    }

    public takeDamage(damage: number): void {
        this.health = this.health - damage;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    public getPowerFactor(): number {
        const numerator = this.power - this.powerConsumer.minPowerDraw;
        const denomator = this.powerConsumer.powerLoad - this.powerConsumer.minPowerDraw;
        const fraction = numerator / denomator;

        if (!this.isAlive() || fraction <= 0) {
            return 0;
        }

        if (this.powerConsumer.powerFunction === PowerFunction.Fractional) {
            return fraction;
        } else if (this.powerConsumer.powerFunction === PowerFunction.StepFunction) {
            const numSteps = this.powerConsumer.powerFunctionSteps.length;
            const index = Math.floor(numSteps * fraction);
            return this.powerConsumer.powerFunctionSteps[index];
        }
    }

}
