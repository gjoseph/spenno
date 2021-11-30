import React from "react";

/**
 * Copied and adapted from https://medium.com/the-non-traditional-developer/checking-the-network-connection-with-a-react-hook-ec3d8e4de4ec
 * Then copied from Tichu:/tichu-clients/packages/tichu-web/src/react-utils.ts
 */
export function useNetworkAvailability() {
  const [isOnline, setNetwork] = React.useState(window.navigator.onLine);
  const updateNetwork = () => {
    setNetwork(window.navigator.onLine);
  };
  React.useEffect(() => {
    window.addEventListener("offline", updateNetwork);
    window.addEventListener("online", updateNetwork);
    return () => {
      window.removeEventListener("offline", updateNetwork);
      window.removeEventListener("online", updateNetwork);
    };
  });
  return isOnline;
}
