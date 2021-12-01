import React from "react";
import { useIndexedDBStoredState } from "./hook-stored-state";

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

type PersistentDirectoryReturn = [
  // current value
  FileSystemDirectoryHandle | undefined,
  // open picker callback
  () => Promise<void>,
  // clean state and store callback
  () => void
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
  const [handle, setHandle, clearHandle] =
    useIndexedDBStoredState<FileSystemDirectoryHandle>(key);

  // TODO
  const [needsPerms, setNeedsPerm] = React.useState<boolean>();

  // React.useEffect(() => {
  //   (async () => {
  //     if (handle) {
  //       console.log("checking perms for handle");
  //       // Check if permission was already granted. If so, return true. TODO return what?
  //       const queryPerm = await handle.queryPermission(READ_ONLY);
  //       console.log("queryPerm:", queryPerm);
  //       if (queryPerm === "granted") {
  //         console.log("was already granted");
  //         return //true;
  //         // } else if (queryPerm==="prompt") {
  //
  //         // Request permission. If the user grants permission, return true. TODO return what? should we _unset_ if rejected?
  //         // const reqPerm = await handle.requestPermission(READ_ONLY);
  //         // console.log("reqPerm:", reqPerm);
  //         // if (reqPerm === "granted") {
  //         //   console.log("is now granted");
  //         //   return//true;
  //         // }
  //       } else {
  //         setNeedsPerm(true);
  //       }
  //       console.log("not granted ... oops!?")
  //     } else {
  //       console.log("no handle yet");
  //     }
  //   })();
  // }, [ handle]);

  const picker = async () => {
    const newHandle: any = await window.showDirectoryPicker({
      id: key,
      startIn: handle || startIn,
    });
    setHandle(newHandle);
  };

  // TODO pbly needs to be an effect? depending on handle...
  const requestPermissions =
    handle &&
    (async () => {
      // if (handle) {
      const reqPerm = await handle.requestPermission(READ_ONLY);
      console.log("reqPerm:", reqPerm);
      // } else {
      //   console.log("nothing to request perms for")
      // }
    });

  return [handle, picker, clearHandle]; // needsPerms, requestPermissions];
};
