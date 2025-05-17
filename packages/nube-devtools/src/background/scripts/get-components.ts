import type { NubeSDKComponent } from "../types";

export const getComponents = () => {
  if (window.nubeSDK) {
    const apps = window.nubeSDK.getState().apps;
    return Object.keys(apps).reduce<
      Record<string, Record<string, NubeSDKComponent>>
    >((acc, appId) => {
      const slots = apps[appId]?.ui?.slots;
      if (slots) {
        acc[appId] = slots;
      }
      return acc;
    }, {});
  }
  return {};
};
