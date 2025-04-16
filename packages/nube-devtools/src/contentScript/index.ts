window.addEventListener('load', () => {
  chrome.runtime.sendMessage({ action: 'nube-devtools-inject-window-variable' }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error sending nube-devtools-inject-window-variable message:', chrome.runtime.lastError);
    }
  });
})

window.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({
    action: 'nube-devtools-inject-event-listeners',
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error sending nube-devtools-inject-event-listeners message:', chrome.runtime.lastError);
    }
  });
})

window.addEventListener('NubeSDKEvents', (event: Event) => {
  const data = JSON.stringify((event as any).detail)
  chrome.runtime.sendMessage(
    { action: 'envioDados', info: data },
    () => {},
  )
  return true
})

window.addEventListener('NubeSDKLocalStorageEvent', (event: Event) => {
  const data = JSON.stringify((event as any).detail)
  chrome.runtime.sendMessage(
    { action: 'nubeSDKLocalStorageSetItem', info: data },
    () => {},
  )
  return true
})
