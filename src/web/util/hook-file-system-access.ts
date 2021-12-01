import * as idb from "idb-keyval";
import React from "react";

/**
 * Utilities to work with LFSA and React.
 * https://wicg.github.io/file-system-access
 * https://web.dev/file-system-access/
 */

type WellKnownDirectories =
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos";

const READ_ONLY: FileSystemHandlePermissionDescriptor = { mode: "read" };

type RequestPermissionsCallback = (() => Promise<void>) | undefined;
type PersistentDirectoryReturn = [
  // current value
  FileSystemDirectoryHandle | undefined,
  // open picker callback
  () => Promise<void>,
  // clean state and store callback
  () => void,
  // callback to request user perms
  RequestPermissionsCallback
];

const idbGet = <T>(key: string): Promise<T | undefined> => {
  console.log("Retrieving from indexeddb", key);
  return idb.get<T>(key).then((v) => {
    console.log("RETRIEVED FROM INDEXEDDB:", v);
    return v;
  });
};

const idbSet = <T>(key: string, value: T): Promise<void> => {
  console.log("Setting to indexeddb", key, value);
  return idb.set(key, value).then((v) => {
    console.log("SETTED TO INDEXEDDB:", value);
    return v;
  });
};

const idbRemove = (key: string): Promise<void> => {
  console.log("Removing from indexeddb", key);
  return idb.del(key).then((v) => {
    console.log("DELETED FROM INDEXEDDB:", v);
    return v;
  });
};

/**
 * A hook that allows
 * - picking a directory from the local filesystem
 * - storing that directory/location for future re-use (i.e when reloading app)
 * - ensures permissions are still granted when loading back from store
 * - storing that directory in React state
 *
 * @param key identifies this particular directory in the application. This is used both for storage and to enable `showDirectoryPicker` to re-open in the right location.
 *            APPARENTLY, Chrome does not allow `.` and who knows what other chars in the ID passed to `showDirectoryPicker`, so, don't.
 * @param startIn optionally, specify a starting directory if we haven't stored one for this `key` yet
 * @return [picker callback (to use on a button), ...]
 *
 * Notes: state setter not needed in return value since it's only used internally by the picker callback.
 */
export const usePersistentLocalDirectory: (
  key: string,
  startIn?: WellKnownDirectories
) => PersistentDirectoryReturn = (
  key: string,
  startIn?: WellKnownDirectories
) => {
  // initially set to undefined, so we can use useEffect with an async function for initial value
  const [handle, setHandle] = React.useState<
    FileSystemDirectoryHandle | undefined
  >();
  const [loadedDbValue, setLoadedDbValue] = React.useState<boolean>(false);
  // Get initial value, if it exists set state
  React.useEffect(() => {
    idbGet<FileSystemDirectoryHandle>(key)
      .then((h) =>
        setHandle((old) => {
          console.log("useEffect for initial value: old", old, "new:", h);
          return h;
        })
      )
      .then(() => setLoadedDbValue(true));
  }, [key]);

  React.useEffect(() => {
    // TODO unclear why this gets called so many times -- even if we disable the get effect above...
    console.log(
      "usePersistentLocalDirectory#useEffect: key:",
      key,
      "handle:",
      handle,
      "loadedDbValue:",
      loadedDbValue
    );
    if (!loadedDbValue) {
      // Only persist values if we've loaded the initial one from db (TODO this may lead to race conditions if we try to set it before it's loaded?)
      return;
    }

    if (handle === undefined) {
      // Only delete if we're done reading the initial value from the db
      //    tODo old comment This means we might get a spurious delete at startup, TODO particularly if we've not read it yet?
      idbRemove(key);
    } else {
      idbSet(key, handle);
    }
  }, [key, handle, loadedDbValue]);

  const [requestPermissions, setRequestPermissions] =
    React.useState<RequestPermissionsCallback>();
  React.useEffect(() => {
    (async () => {
      if (handle) {
        console.log("checking perms for handle");
        // Check if permission was already granted. If so, return true. TODO return what?
        const queryPerm = await handle.queryPermission(READ_ONLY);
        console.log("queryPerm:", queryPerm);
        if (queryPerm === "granted") {
          // TODO should we setRequestPermissions(undefined); ?
          console.log("was already granted");
          return; //true;
          // Request permission. If the user grants permission, return true. TODO return what? should we _unset_ if rejected?
          // const reqPerm = await handle.requestPermission(READ_ONLY);
          // console.log("reqPerm:", reqPerm);
          // if (reqPerm === "granted") {
          //   console.log("is now granted");
          //   return//true;
          // }
        } else {
          setRequestPermissions(() => {
            return async () => {
              const reqPerm = await handle.requestPermission(READ_ONLY);
              console.log("reqPerm:", reqPerm);
              setRequestPermissions(undefined);
            };
          });
        }
        console.log("not granted ... oops!?");
      } else {
        console.log("no handle yet");
      }
    })();
    // cleanup
    // return () => {
    //   setRequestPermissions(undefined);
    // }
  }, [handle]);

  const picker = async () => {
    const newHandle: any = await window.showDirectoryPicker({
      id: key,
      startIn: handle || startIn,
    });
    // todo check if old==new with isSameEntry
    setHandle((oldHandle) => newHandle);
  };

  const clearHandle = () => {
    // idbRemove(key);
    setHandle(undefined);
  };

  return [handle, picker, clearHandle, requestPermissions];
};
