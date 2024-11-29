import React, { ReactNode, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ProgressIndicator } from "../util-comps/ProgressIndicator";

export type AddFile = (filename: string, contents: string) => void;
const onDropDelegateToAddFile =
  (addFile: AddFile, onStart: () => void, onUploaded: () => void) =>
  (acceptedFiles: File[]) => {
    onStart();
    console.debug(
      "onDrop#acceptedFiles:",
      acceptedFiles.map((f) => f.name),
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

const minimalBaseStyle = {
  padding: 0,
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "transparent",
  borderStyle: "dashed",
  // backgroundColor: "#fafafa",
  // color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
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

// for some reason I can't spell WrappedComponent as wrappedComponent or isn't happy
export const withDropZone =
  <P extends object>(
    WrappedComponent: React.ComponentType<P>,
  ): React.FC<P & FileDropProps> =>
  // eslint-disable-next-line react/display-name
  ({ addFile, minimal, ...props }: FileDropProps) => (
    <FileDrop addFile={addFile} minimal={minimal}>
      <WrappedComponent {...(props as P)} />
    </FileDrop>
  );

type FileDropProps = {
  addFile: AddFile;
  minimal: boolean;
  children: ReactNode;
};
export const FileDrop: React.FC<FileDropProps> = (props) => {
  const onDrop = useMemo(
    () =>
      onDropDelegateToAddFile(
        props.addFile,
        () => setInProgress(() => true),
        () => setInProgress(() => false),
      ),
    [props.addFile],
  );
  // COPIED FROM https://react-dropzone.js.org/#section-styling-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: { "text/csv": [".txt", ".csv", ".tsv"] },
    noClick: true,
    onDropAccepted: onDrop,
  });

  const style = useMemo(
    () => ({
      ...(props.minimal ? minimalBaseStyle : baseStyle),
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [props.minimal, isDragActive, isDragReject, isDragAccept],
  );

  // if we set to false, 2 parallel uploads might cancel each other?
  const [inProgress, setInProgress] = useState<boolean>(false);

  // in minimal mode, only render children when not in progress
  const shouldRenderChildren = !props.minimal || !inProgress;

  const progressType = props.minimal ? "small" : "withBackdrop";
  let progressIndicator = [
    // we know full well there's only one here, but React wants a key, boohoo
    <ProgressIndicator inProgress={inProgress} type={progressType} key={-1} />,
  ];
  if (inProgress && !props.minimal) {
    progressIndicator.push(<p key={-2}>Uploading [filename here]</p>);
  }

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {shouldRenderChildren ? props.children : null}
      {progressIndicator}
    </div>
  );
};
