import { BaseComponent } from "./base_component";

class PowerSubSystem {

    private sourceToSinkMap: Map<BaseComponent, Set<BaseComponent>>;

    private sinkToSourceMap: Map<BaseComponent, Set<BaseComponent>>;

    public attach(source: BaseComponent, sink: BaseComponent) {
        const sinkSet = this.sourceToSinkMap.get(source);
        sinkSet.add(sink);

        const sourceSet = this.sinkToSourceMap.get(sink);
        sourceSet.add(source);
    }

    public detach(source: BaseComponent, sink: BaseComponent) {

        const sinkSet = this.sourceToSinkMap.get(source);
        sinkSet.delete(sink);

        const sourceSet = this.sinkToSourceMap.get(sink);
        sourceSet.add(source);
    }

}
