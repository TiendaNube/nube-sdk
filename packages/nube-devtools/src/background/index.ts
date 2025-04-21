import {
  handleDevToolsVerifyNubeSdkStatus,
  handleDevToolsInjectWindowVariable,
  handleDevToolsResendEvent,
  handleDevToolsEvents,
  handleDevToolsGetApps,
  handleDevToolsHighlightElement,
  handleDevToolsScrollToElement,
  handleDevToolsGetComponents,
} from './nube-dev-tools'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'nube-devtools-inject-window-variable') {
    if (sender.tab?.id !== undefined) {
      handleDevToolsInjectWindowVariable(sender.tab.id)
    }
    return true
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
        tabId: sender.tab.id,
      })
    }
    return false
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

  if (message.action === 'nube-devtools-get-components') {
    handleDevToolsGetComponents({
      tabId: message.payload.tabId,
      sendResponse,
    })
    return true
  }

  if (message.action === 'nube-devtools-highlight-element') {
    handleDevToolsHighlightElement({
      tabId: message.payload.tabId,
      id: message.payload.id,
      type: message.payload.type,
      color: message.payload.color,
      sendResponse,
    })
    return true
  }

  if (message.action === 'nube-devtools-scroll-to-element') {
    handleDevToolsScrollToElement({
      tabId: message.payload.tabId,
      id: message.payload.id,
      sendResponse,
    })
  }
})
