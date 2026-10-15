import { useEffect, useState } from "react";

/** Keep server-rendered controls disabled until their handlers are attached. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
