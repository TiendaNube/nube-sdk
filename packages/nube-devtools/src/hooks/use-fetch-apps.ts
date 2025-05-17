import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";
import { getApps as getAppsScript } from "@/background/scripts/get-apps";

const RETRY_TIMEOUT_MS = 2000;

async function fetchSDKApps() {
  const data = await chrome.scripting.executeScript(
    {
      target: { tabId: chrome.devtools.inspectedWindow.tabId },
      world: "MAIN",
      func: getAppsScript,
    },
  );
  return data[0].result;
}

function mapAppsToEvents(appsData: Record<string, { id: string; registered: boolean; script: string }>): NubeSDKEvent[] {
  return Object.keys(appsData).map((key) => ({
    id: uuidv4(),
    data: appsData[key],
  }));
}

export function useFetchApps() {
  const [apps, setApps] = useState<NubeSDKEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApps = useCallback(() => {
    async function main() {
      const result = await fetchSDKApps();

      // If no data is found, wait 3 seconds and try one more time
      if (Object.keys(result).length === 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_TIMEOUT_MS));
        const retryResult = await fetchSDKApps();
        setApps(mapAppsToEvents(retryResult));
      } else {
        setApps(mapAppsToEvents(result));
      }

      setIsLoading(false);
    }

    main();
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return {
    apps,
    isLoading,
    refetch: fetchApps,
  };
}
