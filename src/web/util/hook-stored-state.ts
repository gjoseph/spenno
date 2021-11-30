import React from "react";

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
export function useStoredState<T>(
  key: string,
  defaultValue?: () => T | undefined,
  serialise: (value: T) => string = JSON.stringify,
  deSerialise: (serialisedValue: string) => T = JSON.parse
): [
  T | undefined,
  React.Dispatch<React.SetStateAction<T | undefined>>,
  () => void
] {
  const [value, setValue] = React.useState<T | undefined>(() => {
    const stickyValue = window.localStorage.getItem(key);
    // localStorage returns an explicit null rather than undefined here. We could != undefined, but I'd rather stick
    // to the correct equality check than approximate consistency.
    if (stickyValue !== null) {
      try {
        return deSerialise(stickyValue);
      } catch (e) {
        console.error(
          `Could not parse value for ${key}: ${stickyValue}: ${e}, restoring defaults.`
        );
        window.localStorage.removeItem(key);
      }
    }
    return defaultValue && defaultValue();
  });

  React.useEffect(() => {
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, serialise(value));
    }
  }, [key, value]);

  const removeValue = () => {
    window.localStorage.removeItem(key);
    setValue(undefined);
  };
  return [value, setValue, removeValue];
}
