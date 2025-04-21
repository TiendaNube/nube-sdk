import type { NubeSDKStorageEvent } from "@/contexts/nube-sdk-storage-context";

window.addEventListener('load', () => {
  chrome.runtime.sendMessage({ action: 'nube-devtools-inject-window-variable' }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error sending nube-devtools-inject-window-variable message:', chrome.runtime.lastError);
    }
  });
})

window.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({
    action: 'nube-devtools-events-listener',
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error sending nube-devtools-events-listener message:', chrome.runtime.lastError);
    }
  });
  return false
})

interface NubeSDKEventDetail {
  data: unknown[];
}

window.addEventListener('NubeSDKEvents', ((event) => {
  const payload = event as CustomEvent<NubeSDKEventDetail>;
  chrome.runtime.sendMessage(
    { action: 'nube-devtools-events', payload: payload.detail },
    () => {},
  )
}) as EventListener)

window.addEventListener('NubeSDKStorageEvents', ((event: Event) => {
  const customEvent = event as CustomEvent<NubeSDKStorageEvent>;
  chrome.runtime.sendMessage(
    { action: 'nube-devtools-storage-events', payload: customEvent.detail },
    () => {},
  )
}) as EventListener)
