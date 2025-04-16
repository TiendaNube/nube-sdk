import {
  handleDevToolsVerifyNubeSdkStatus,
  handleDevToolsInjectWindowVariable,
  handleDevToolsResendEvent,
  handleDevToolsEvents,
  handleDevToolsGetApps,
} from './nube-dev-tools'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'nube-devtools-inject-window-variable') {
    if (sender.tab?.id !== undefined) {
      handleDevToolsInjectWindowVariable(sender.tab.id)
      return true
    }
  }

  if (message.action === 'nube-devtools-verify-nube-sdk-status') {
    handleDevToolsVerifyNubeSdkStatus({
      sendResponse,
      tabId: message.payload.tabId,
    })
    return true
  }

  if (message.action === 'nube-devtools-events-listener') {
    if (sender.tab?.id !== undefined) {
      handleDevToolsEvents({
        sendResponse,
        tabId: sender.tab.id,
      })
      return true
    }

    return true
  }

  if (message.action === 'nube-devtools-resend-event') {
    handleDevToolsResendEvent(sendResponse, message.payload)
    return true
  }

  if (message.action === 'nube-devtools-get-apps') {
    handleDevToolsGetApps({
      tabId: message.payload.tabId,
      sendResponse,
    })
    return true
  }
})
