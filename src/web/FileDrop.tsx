import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SimpleProgressIndicator } from "./util-comps/Progress";

export type AddFile = (filename: string, contents: string) => void;
const onDropDelegateToAddFile =
  (addFile: AddFile, onStart: () => void, onUploaded: () => void) =>
  (acceptedFiles: File[]) => {
    onStart();
    console.debug(
      "onDrop#acceptedFiles:",
      acceptedFiles.map((f) => f.name)
    );
    acceptedFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onabort = () => console.warn(file.name, "reading was aborted");
      reader.onerror = () => console.warn(file.name, "reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result as string;
        addFile(file.name, binaryStr);
        onUploaded();
      };
      reader.readAsText(file);
    });
  };
const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};
const baseStyle = {
  // flex: 1,
  // display: 'flex',
  // flexDirection: 'column',
  // alignItems: 'center',
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};
export const FileDrop: React.FC<{ addFile: AddFile }> = (props) => {
  const onDrop = useMemo(
    () =>
      onDropDelegateToAddFile(
        props.addFile,
        () => setInProgress(() => true),
        () => setInProgress(() => false)
      ),
    [props.addFile]
  );
  // COPIED FROM https://react-dropzone.js.org/#section-styling-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: ["text/csv"],
    noClick: true,
    onDropAccepted: onDrop,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  // if we set to false, 2 parallel uploads might cancel each other?
  const [inProgress, setInProgress] = useState<boolean>(false);

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {props.children}
      <SimpleProgressIndicator inProgress={inProgress} />
      {inProgress ? <p>Uploading [filename here]</p> : null}
    </div>
  );
};
