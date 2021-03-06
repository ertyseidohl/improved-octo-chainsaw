import { BaseComponent } from "../inventory/base_component";

import { ConnectedWire } from "../wiring/wire";

abstract class SubSystem {
    public abstract detach(source: BaseComponent, sink: BaseComponent, wire: ConnectedWire): void;
    public abstract attach(source: BaseComponent, sink: BaseComponent, plugIndex: number, wire: ConnectedWire): void;
    public abstract updateAllComponents(): void;
}

export class PowerSubSystem extends SubSystem {

    private sourceToSinkMap: Map<BaseComponent, Set<BaseComponent>>;
    private sinkToSourceMap: Map<BaseComponent, Set<BaseComponent>>;
    private sinkCount: Map<BaseComponent, number>;

    constructor() {
        super();
        this.sourceToSinkMap = new Map<BaseComponent, Set<BaseComponent>>();
        this.sinkToSourceMap = new Map<BaseComponent, Set<BaseComponent>>();
        this.sinkCount = new Map<BaseComponent, number>();
    }

    public attach(source: BaseComponent, sink: BaseComponent, plugIndex: number, wire: ConnectedWire): void {
        let sinkSet = this.sourceToSinkMap.get(source);
        if (!sinkSet) {
            sinkSet = new Set<BaseComponent>();
            this.sourceToSinkMap.set(source, sinkSet);
        }
        sinkSet.add(sink);

        let sourceSet = this.sinkToSourceMap.get(sink);
        if (!sourceSet) {
            sourceSet = new Set<BaseComponent>();
            this.sinkToSourceMap.set(sink, sourceSet);
        }
        sourceSet.add(source);

        const count = this.sinkCount.get(sink) || 0;
        this.sinkCount.set(sink, count + 1);

        source.plugIn(plugIndex, wire);
        sink.plugIn(plugIndex, wire);

        sink.updatePower(sink.getPotential() + 1);
    }

    public detach(source: BaseComponent, sink: BaseComponent, wire: ConnectedWire): void {

        const count = this.sinkCount.get(sink) - 1;
        this.sinkCount.set(sink, count);

        const sinkSet = this.sourceToSinkMap.get(source);
        sinkSet.delete(sink);

        const sourceSet = this.sinkToSourceMap.get(sink);
        sourceSet.delete(source);

        sink.updatePower(sink.getPower() - 1);

        source.plugOut(wire.getOriginPadIndex(),  wire);
        sink.plugOut(wire.getOriginPadIndex(), wire);
    }

    public updateAllComponents(): void {
        this.sinkCount.forEach((power: number, sink: BaseComponent) => {
            sink.updatePower(power);
        });
    }

}
