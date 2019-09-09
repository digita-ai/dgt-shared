export abstract class DGTConfigurationService<T> {
    public abstract get<S>(configFn: (config: T) => S): S;
}
