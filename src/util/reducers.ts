/**
 * Functions of this file will return instances of "ArrayableMap", which enables easier
 * access to array functions like map() etc.
 *
 * TODO can this be simplify this further and avoid having to call toArray() to begin with? The reducers could
 * return ArrayableMapEntry<K, V>[]; right away, probably (or a different type altogether if adressing by "key"
 * is important)
 */
// class ArrayableMap<K, V> extends Map<K, V> {}
// type ArrayableMapEntry<K, V> = { key: K; value: V };
// interface ArrayableMap<K, V> {
//   toArray(): ArrayableMapEntry<K, V>[];
// }
// ArrayableMap.prototype.toArray = function () {
//   return Array.from(this.entries()).map((e) => {
//     return {
//       key: e[0],
//       value: e[1],
//     };
//   });
// };
class ArrayableMap<K, V> {
  // Obviously poor name, but limits changes elsewhere for now.
  // Also this seems like a terrible idea but it works https://stackoverflow.com/questions/43592760/typescript-javascript-using-tuple-as-key-of-map
  // TODO YEAH IT WAS A TERRIBLE IDEA -- we lose all the types (e.g moment/bigjs)
  private map = new Map<string, V>();

  set(key: K, value: V): this {
    this.map.set(JSON.stringify(key), value);
    return this;
  }

  get(key: K): V | undefined {
    return this.map.get(JSON.stringify(key));
  }

  has(key: K): boolean {
    return this.map.has(JSON.stringify(key));
  }

  get size() {
    return this.map.size;
  }

  toArray() {
    return Array.from(this.map.entries()).map((e) => {
      return {
        key: JSON.parse(e[0]), // TODO LOL!?
        value: e[1],
      };
    });
  }
}

/**
 * @type T the type of objects reduced
 * @type K the type of keys being extracted (grouped by, counted, ...)
 * @type V the type of values in the resulting Map
 *
 * Map<K,V> is the `U` in reduce()
 */
type KeyExtractor<T, K> = (current: T) => K;

type GroupByToMapReducer<T, K, V> = (
  accumulator: ArrayableMap<K, V>,
  current: T
) => ArrayableMap<K, V>;

type GroupByToMapReduceArgs<T, K, V> = [
  GroupByToMapReducer<T, K, V>,
  ArrayableMap<K, V>
];

type ValueAdder<T, K, V> = (
  acc: ArrayableMap<K, V>,
  key: K,
  current: T
) => void;

const reducerFactory = <T, K, V>(
  extractKey: KeyExtractor<T, K>,
  addValue: ValueAdder<T, K, V>
): GroupByToMapReducer<T, K, V> => {
  return (acc: ArrayableMap<K, V>, current: T): ArrayableMap<K, V> => {
    const key = extractKey(current);
    addValue(acc, key, current);
    return acc;
  };
};

const initialValue = <K, V>() => new ArrayableMap<K, V>();

namespace GroupBy {
  // TODO this currently only work with simple key types because Map won't consider {a:1} and {a:1} equal
  const addToArray = <K, T>(acc: ArrayableMap<K, T[]>, key: K, current: T) => {
    if (acc.has(key)) {
      acc.get(key)!.push(current);
    } else {
      acc.set(key, [current]);
    }
  };

  /**
   * Returns both the reducer _and_ the initialValue for a reduce() call. Spread the return value like so:
   * ```
   * const byLength = words.reduce(...groupBy((s: string) => s.length));
   * ```
   *
   * TODO: deduce value (<V>) from the incoming stream!? Why do we have to explicitly specify the type in extractor?
   *
   * @param by a function to extract the group-by key from the given objects
   */
  export const groupBy: <T, K>(
    by: KeyExtractor<T, K>
  ) => GroupByToMapReduceArgs<T, K, T[]> = <T, K>(by: KeyExtractor<T, K>) => {
    return [reducerFactory<T, K, T[]>(by, addToArray), initialValue<K, T[]>()];
  };
}

namespace CountBy {
  const count = <K>(acc: ArrayableMap<K, number>, key: K, current: any) => {
    const currentCount = acc.get(key) || 0;
    acc.set(key, currentCount + 1);
  };

  /**
   * Returns both the reducer _and_ the initialValue for a reduce() call. Spread the return value like so:
   * ```
   * const byLength = words.reduce(...countBy((s: string) => s.length));
   * ```
   *
   * TODO: deduce value (<V>) from the incoming stream!? Why do we have to explicitly specify the type in extractor?
   *
   * @param by a function to extract the group-by key from the given objects
   */
  export const countBy: <T, K>(
    by: KeyExtractor<T, K>
  ) => GroupByToMapReduceArgs<T, K, number> = <T, K>(
    by: KeyExtractor<T, K>
  ) => {
    return [reducerFactory<T, K, number>(by, count), initialValue<K, number>()];
  };
}

export const countBy = CountBy.countBy;
export const groupBy = GroupBy.groupBy;
// TODO provide chainable method to map the map to an object, e.g  like in
/*
    const mostCommonUncategorised2 = Array.from(
    uncategorisedRecords.reduce(
      ...countBy((r: Transaction) => r.desc)
    ),  ([key, value]) => ({desc:key, count:value}))

 */
// TODO also sorting, particularly on countBy...
