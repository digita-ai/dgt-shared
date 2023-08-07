import { isEqual } from '../../utils/is-equal';

export class DGTMap<T, S> {

  private array: { key: T; value: S }[] = new Array<{ key: T; value: S }>();
  get size(): number {

    return this.array.length;

  }
  public [Symbol.toStringTag]: 'Map';

  static fromArray<STATIC_T, STATIC_S>(array: { key: STATIC_T; value: STATIC_S }[]): DGTMap<STATIC_T, STATIC_S> {

    const res = new DGTMap<STATIC_T, STATIC_S>();

    if (array) {

      res.array = array;

    }

    return res;

  }

  constructor(map?: DGTMap<T, S> | { key: T; value: S }[]) {

    if (map instanceof DGTMap) {

      this.array = map.array;

    } else if (map instanceof Array) {

      this.array = map;

    }

  }

  clear(): void {

    this.array = new Array<{ key: T; value: S }>();

  }
  delete(key: T): boolean {

    this.array = this.array.filter((tuple) => tuple.key !== key);

    return true;

  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  forEach(callbackfn: (value: S, key: T) => void, thisArg?: any): void {

    return this.array.forEach((tuple) => callbackfn(tuple.value, tuple.key));

  }
  get(key: T): S | undefined {

    let res;

    const foundTuple = this.array.find((tuple) => isEqual(key, tuple.key));

    if (foundTuple) {

      res = foundTuple.value;

    }

    return res;

  }
  getByIndex(index: number): { key: T; value: S } {

    return this.array[index];

  }
  findIndex(key: T): number {

    return this.array.findIndex((e) => e.key === key);

  }
  has(key: T): boolean {

    let res = false;

    const foundTuple = this.array.find((tuple) => isEqual(key, tuple.key));

    // eslint-disable-next-line no-null/no-null
    if (foundTuple !== null && foundTuple !== undefined) {

      res = true;

    }

    return res;

  }
  set(key: T, value: S): this {

    if (this.has(key)) {

      this.delete(key);

    }

    this.array.push({ key, value });

    return this;

  }
  [Symbol.iterator](): IterableIterator<[number, {
    key: T;
    value: S;
  }]> {

    return this.entries();

  }
  entries(): IterableIterator<[number, {
    key: T;
    value: S;
  }]> {

    return this.array.entries();

  }
  keys(): IterableIterator<T> {

    return this.array.map((tuple) => tuple.key).values();

  }
  values(): IterableIterator<S> {

    return this.array.map((tuple) => tuple.value).values();

  }

  toArray(): { key: T; value: S }[] {

    return Array.from(this.array);

  }

  getByValue(value: S): T | undefined {

    return this.array?.find((entry) => entry?.value === value)?.key;

  }

}
