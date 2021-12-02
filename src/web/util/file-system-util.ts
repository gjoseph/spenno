import { Logger } from "../../util/log";

export const FileTests = {
  CSV_SUFFIX: (e: FileSystemFileHandle) => /.*\.csv/.test(e.name),
};

export const collectFilesFrom = async <T>(
  dir: FileSystemDirectoryHandle,
  log: Logger,
  fileLoader: (handle: FileSystemFileHandle, file: File) => Promise<T>,
  testFile: (e: FileSystemFileHandle) => boolean
): Promise<T[]> => {
  console.log("collectFilesFrom#dir:", dir);
  const perm = await dir.queryPermission();
  if (perm !== "granted") {
    log.warn("Can't open load files from " + dir.name + ": " + perm);
    return [];
  }
  const files: T[] = [];

  for await (const e of dir.values()) {
    if (e.kind === "file" && testFile(e)) {
      const file = await e.getFile();
      files.push(await fileLoader(e, file));
    }
  }
  return files;
};
