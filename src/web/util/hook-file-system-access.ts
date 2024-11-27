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

type OpenPickerCallback = () => Promise<void>;
type RequestPermissionsCallback = () => Promise<void>;
type ClearStateAndStoreCallback = () => void;
type RequestPermissionsCallbackStatus = {
  callback?: RequestPermissionsCallback | undefined;
  status: PermissionState | "loading";
};
type PersistentDirectoryReturn = [
  FileSystemDirectoryHandle | undefined,
  OpenPickerCallback,
  RequestPermissionsCallbackStatus,
  ClearStateAndStoreCallback,
];

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
 * @return [the current handle as a state variable,
 *          a callback function to trigger the browser's directory picker,
 *          a tuple representing the state of permissions and an optional callback to prompt user,
 *          and a callback to clear both state and store ]
 *
 * Notes: state setter not needed in return value since it's only used internally by the picker callback.
 */
export const usePersistentLocalDirectory: (
  key: string,
  startIn?: WellKnownDirectories,
) => PersistentDirectoryReturn = (
  key: string,
  startIn?: WellKnownDirectories,
) => {
  // initially set to undefined, so we can use useEffect with an async function for initial value
  const [handle, setHandle] = React.useState<
    FileSystemDirectoryHandle | undefined
  >();
  const [loadedDbValue, setLoadedDbValue] = React.useState<boolean>(false);
  // Get initial value, if it exists set state
  React.useEffect(() => {
    idb
      .get<FileSystemDirectoryHandle>(key)
      .then((h) =>
        setHandle((old) => {
          console.log("useEffect for initial value: old", old, "new:", h);
          return h;
        }),
      )
      .then(() => setLoadedDbValue(true));
  }, [key]);

  React.useEffect(() => {
    if (!loadedDbValue) {
      // Only persist values if we've loaded the initial one from db (TODO this may lead to race conditions if we try to set it before it's loaded?)
      return;
    }

    if (handle === undefined) {
      idb.del(key);
    } else {
      idb.set(key, handle);
    }
  }, [key, handle, loadedDbValue]);

  const [requestPermissions, setRequestPermissions] =
    React.useState<RequestPermissionsCallbackStatus>({ status: "loading" });
  // the filesystem API is async, so can't initialise state right away, check permissions in an effect instead
  React.useEffect(() => {
    (async () => {
      if (handle) {
        console.log("checking perms for handle");
        const queryPerm = await handle.queryPermission(READ_ONLY);
        console.log("queryPerm:", queryPerm);
        if (queryPerm === "granted") {
          console.log("was already granted");
          setRequestPermissions({ status: "granted" });
          return;
        } else {
          setRequestPermissions({
            status: "prompt",
            callback: async () => {
              const reqPerm = await handle.requestPermission(READ_ONLY);
              if (reqPerm === "granted") {
                setRequestPermissions({ status: "granted" });
              } else {
                setRequestPermissions({ status: reqPerm });
                console.log(
                  `requested permissions for ${handle}, but got ${reqPerm}`,
                );
              }
            },
          });
        }
      } else {
        console.log("no handle yet");
      }
    })();
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

  return [handle, picker, requestPermissions, clearHandle];
};
