import * as _ from 'lodash';

export class DGTMap<T, S> {
    private array: Array<{ key: T, value: S }> = new Array<{ key: T, value: S }>();
    public get size(): number { return this.array.length; }
    public [Symbol.toStringTag]: 'Map';

    public static fromArray<T, S>(array: Array<{ key: T, value: S }>): DGTMap<T, S> {
        const res = new DGTMap<T, S>();

        if (array) {
            res.array = array;
        }

        return res;
    }

    constructor(map: DGTMap<T, S> | Array<{ key: T, value: S }> = null) {
        if (map instanceof DGTMap) {
            this.array = map.array;
        } else if (map instanceof Array) {
            this.array = map;
        }
    }

    public clear(): void {
        this.array = new Array<{ key: T, value: S }>();
    }
    public delete(key: T): boolean {
        _.remove(this.array, (tuple) => _.isEqual(key, tuple.key));

        return true;
    }
    public forEach(callbackfn: (value: S, key: T) => void, thisArg?: any): void {
        return this.array.forEach((tuple) => callbackfn(tuple.value, tuple.key));
    }
    public get(key: T): S {
        let res = null;

        const foundTuple = this.array.find(tuple => _.isEqual(key, tuple.key));

        if (foundTuple) {
            res = foundTuple.value;
        }
        return res;
    }
    public getByIndex(index: number): { key: T, value: S } {
        return this.array[index];
    }
    public findIndex(key: T): number {
        return this.array.findIndex(e => e.key === key);
    }
    public has(key: T): boolean {
        let res = false;

        const foundTuple = this.array.find(tuple => _.isEqual(key, tuple.key));
        if (foundTuple !== null && foundTuple !== undefined) {
            res = true;
        }

        return res;
    }
    public set(key: T, value: S): this {
        if (this.has(key)) {
            this.delete(key);
        }

        this.array.push({ key, value });

        return this;
    }
    public [Symbol.iterator](): IterableIterator<[number, {
        key: T;
        value: S;
    }]> {
        return this.entries();
    }
    public entries(): IterableIterator<[number, {
        key: T;
        value: S;
    }]> {
        return this.array.entries();
    }
    public keys(): IterableIterator<T> {
        return this.array.map(tuple => tuple.key).values();
    }
    public values(): IterableIterator<S> {
        return this.array.map(tuple => tuple.value).values();
    }

    public toArray(): Array<{ key: T, value: S }> {
        return Array.from(this.array);
    }

}
