import React from "react";

export function useFetch<T>(
  path: string,
  initialStateFactory: () => T,
  responseTransformer: (fetchResult: string) => T
): [T, boolean, boolean] {
  const [value, setValue] = React.useState<T>(initialStateFactory);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  // TODO we may want a bit more detail than a boolean here
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + path)
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
        }
      );
  }, [responseTransformer, path]);
  return [value, loaded, error];
}
