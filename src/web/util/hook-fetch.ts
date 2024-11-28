import React from "react";

function makePath(path: string) {
  const baseurl = import.meta.env.BASE_URL;
  if (baseurl.endsWith("/")) {
    return baseurl.slice(0, -1) + path;
  } else {
    return baseurl + path;
  }
}

export function useFetch<T>(
  path: string,
  initialStateFactory: () => T,
  responseTransformer: (fetchResult: string) => T,
): [state: T, loaded: boolean, error: boolean, reload: () => void] {
  const [value, setValue] = React.useState<T>(initialStateFactory);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  // TODO we may want a bit more detail than a boolean here
  const [error, setError] = React.useState<boolean>(false);

  const doTheFetch = () => {
    console.log("Loading", path, "at", makePath(path));
    fetch(makePath(path))
      .then((res) => res.text())
      .then(
        (result) => {
          setValue((old) => responseTransformer(result));
          setLoaded((old) => true);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("fetch error:", typeof error, error);
          setError((old) => error);
          setLoaded((old) => true);
        },
      );
  };
  React.useEffect(doTheFetch, [responseTransformer, path]);
  return [value, loaded, error, doTheFetch];
}
