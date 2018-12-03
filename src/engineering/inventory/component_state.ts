export interface StateConfig {
    powerConsumer?: PowerConsumerStateConfig;
    powerSource?: PowerSourceStateConfig;
    weight: number;
}

export interface PowerSourceStateConfig {
    power: number;
}

export interface PowerConsumerStateConfig {
    powerLoad: number;
    minPowerDraw: number;
}

export class ComponentState {

    private health: number;

    private power: number;

    private powerConsumer: PowerConsumerStateConfig;
    private powerSource: PowerSourceStateConfig;

    private weight: number;

    constructor(config: StateConfig) {
        this.powerConsumer = config.powerConsumer;
        this.powerSource = config.powerSource;
        this.health = 100;
        this.weight = config.weight;
        this.power = 0;
    }

    public isOnline(): boolean {
        return this.power > this.powerConsumer.minPowerDraw;
    }

    public isAlive(): boolean {
        return this.health > 0;
    }

    public getWeight(): number {
        return this.weight;
    }

    public getPowerLoad(): number {
        return this.powerConsumer.powerLoad;
    }

    public updatePower(power: number): void {
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

    public getPower(): number {
        if (this.isAlive() && this.isOnline) {
            return this.power;
        }
        return 0;
    }
}
