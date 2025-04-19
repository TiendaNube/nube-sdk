import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

type MessageType = {
  action: string
  info: string
}

export type NubeSDKEvent = {
  id: string,
  data: {
    key: string
    value: string
    method: string
    type: 'localStorage' | 'sessionStorage'
  }
}

interface NubeSDKStorageContextType {
  events: NubeSDKEvent[]
  cleanup: () => void
}

const NubeSDKStorageContext = createContext<NubeSDKStorageContextType | undefined>(undefined)

export const NubeSDKStorageProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<NubeSDKEvent[]>([])

  const clearLocalStorage = () => {
    setEvents([])
  }

  useEffect(() => {
    const listener = (
      message: MessageType,
      _: chrome.runtime.MessageSender,
      sendResponse: (response?: { status: boolean }) => void,
    ) => {
      if (isAction(message)) {
        const event = JSON.parse(message.info) as NubeSDKEvent['data'];
        setEvents((prevEvents) => [...prevEvents, {
          id: uuidv4(),
          data: event,
        }])
      }
      sendResponse({ status: true })
      return true
    }

    function isAction(message: MessageType) {
      return message.action === 'nubeSDKLocalStorageSetItem' && message.info
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  return (
    <NubeSDKStorageContext.Provider value={{ events, cleanup: clearLocalStorage }}>
      {children}
    </NubeSDKStorageContext.Provider>
  )
}

export const useNubeSDKStorage = () => {
  const context = useContext(NubeSDKStorageContext)
  if (context === undefined) {
    throw new Error('useNubeSDKStorage must be used within a NubeSDKStorageProvider')
  }
  return context
}
