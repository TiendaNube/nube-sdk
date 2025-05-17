import { useCallback, useEffect, useState } from "react";
import type { NubeSDKComponent } from "@/background/types";
import { getComponents as getComponentsScript } from "@/background/scripts";

const REFRESH_DELAY_MS = 2000;

type ComponentsData = {
  [key: string]: Record<string, NubeSDKComponent>;
};

export const useGetComponents = () => {
  const [components, setComponents] = useState<ComponentsData>({});
  const [isLoading, setIsLoading] = useState(true);

  const getComponents = useCallback(async () => {
    const result = await chrome.scripting.executeScript<[], ComponentsData>({
      target: { tabId: chrome.devtools.inspectedWindow.tabId },
      world: "MAIN",
      func: getComponentsScript,
    });

    return result[0].result;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await getComponents();

      if (Object.keys(result).length === 0) {
        await new Promise(resolve => setTimeout(resolve, REFRESH_DELAY_MS));
        return refresh();
      }

      setComponents(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [getComponents]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    components,
    refresh,
    isLoading,
  };
};
