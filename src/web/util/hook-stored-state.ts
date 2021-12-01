import React from "react";
import * as idb from "idb-keyval";

type ToString<T> = (value: T) => string;
type FromString<T> = (serialisedValue: string) => T;
type DefaultValueFunction<T> = () => T | undefined;

type StoredStateReturn<T> = [
  // current value
  T | undefined,
  // state dispatcher callback
  React.Dispatch<React.SetStateAction<T | undefined>>,
  // (val:T) => void ,
  // removal callback
  () => void
];

/**
 * Allows managing a state value and retrieve/store it in `window.localStorage`.
 *
 * `<T>` specifies the type of the state object; this function inherently lets it be undefined (so no need to pass `<Foo|undefined>`, `<Foo>` will do.
 *
 * Copied and adapted from https://joshwcomeau.com/react/persisting-react-state-in-localstorage/
 * Then copied from Tichu:/tichu-clients/packages/tichu-web/src/react-utils.ts
 *
 * @param key the key used to store this state in localStorage against.
 * @param defaultValue can be a value of type T, a function that returns T or undefined, or undefined.
 * @param serialise a function to serialise the value to a string, defaults to JSON.stringify
 * @param deSerialise a function to deserialise the value from a string, defaults to JSON.parse
 * @return an array of [current value, dispatcher to set the value to a new value, a function to unset and remove the value from the store]
 */
export function useLocalStorageState<T>(
  key: string,
  defaultValue: DefaultValueFunction<T> = () => undefined,
  serialise: ToString<T> = JSON.stringify,
  deSerialise: FromString<T> = JSON.parse
): StoredStateReturn<T> {
  return useStoredState(
    key,
    defaultValue,
    new LocalStorage(serialise, deSerialise)
  );
}

export function useIndexedDBStoredState<T>(
  key: string,
  defaultValue: DefaultValueFunction<T> = () => undefined
): StoredStateReturn<T> {
  return useStoredState(key, defaultValue, new IndexedDB());
}

function useStoredState<T>(
  key: string,
  defaultValue: DefaultValueFunction<T>,
  storage: StorageAbstraction<T>
): StoredStateReturn<T> {
  // always initially set to undefined, so we can use useEffect with an async function for initial value
  const [value, setValue] = React.useState<T | undefined>();
  // React.useEffect(() => {
  //   (storage.get(key) ||  defaultValue()).then(setValue);
  // }, [key, defaultValue, setValue, storage]);
  // TODO but even so the following useEffect is invoked ~8 times!?
  // }, []); // explicit empty array should be fine fuck you very much!?

  //
  React.useEffect(() => {
    // TODO unclear why this gets called so many times -- even if we disable the get effect above...
    console.log("useStoredState#useEffect: key:", key, "value:", value);
    if (value === undefined) {
      // TODO maybe we shouldn't do this anymore, since value is undefined at startup!
      // storage.remove(key);
    } else {
      storage.set(key, value);
    }
  }, [key, value, storage]);

  // different approach that i pbly tried before? ... TODO this seems to work, why did the effect not work though...
  // const storeValue= (val: T) => {
  //   // console.log("fn:", fn);
  //   // const val = fn && fn();
  //   console.log("storeValue:", val);
  //   setValue(val);
  //   if (val) {
  //     storage.set(key, val);
  //   } else {
  //     storage.remove(key);
  //   }
  // }

  const removeValue = () => {
    storage.remove(key);
    setValue(undefined);
  };
  return [value, setValue, removeValue];
}

/**
 * An interface abstracting away the specificities of localStorage vs indexedDB, so we can reuse the same React plumbing
 * code with little-to-no copy-pasta.
 */
interface StorageAbstraction<T> {
  get(key: string): Promise<T | undefined>;

  set(key: string, value: T): Promise<void>;

  remove(key: string): Promise<void>;
}

class LocalStorage<T> implements StorageAbstraction<T> {
  constructor(
    readonly serialise: (value: T) => string,
    readonly deSerialise: (serialisedValue: string) => T
  ) {}

  get(key: string): Promise<T | undefined> {
    const stickyValue = window.localStorage.getItem(key);
    // localStorage returns an explicit null rather than undefined here. We could != undefined, but I'd rather stick
    // to the correct equality check than approximate consistency.
    if (stickyValue !== null) {
      try {
        return Promise.resolve(this.deSerialise(stickyValue));
      } catch (e) {
        console.error(
          `Could not parse value for ${key}: ${stickyValue}: ${e}, restoring defaults.`
        );
        window.localStorage.removeItem(key);
      }
    }
    return Promise.resolve(undefined);
  }

  set(key: string, value: T) {
    window.localStorage.setItem(key, this.serialise(value));
    return Promise.resolve();
  }

  remove(key: string) {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
}

class IndexedDB<T> implements StorageAbstraction<T> {
  get(key: string): Promise<T | undefined> {
    console.log("Retrieving from indexeddb", key);
    const promise = idb.get<T>(key);

    return promise.then((v) => {
      console.log("RETRIEVED FROM INDEXEDDB:", v);
      return v;
    });
  }

  set(key: string, value: T) {
    console.log("Setting to indexeddb", key, value);
    return idb.set(key, value);
  }

  remove(key: string) {
    console.log("Removing from indexeddb", key);
    return idb.del(key);
  }
}
