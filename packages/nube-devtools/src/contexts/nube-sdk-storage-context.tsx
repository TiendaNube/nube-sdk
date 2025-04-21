import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

export type NubeSDKStorageEvent = {
  method: string;
  type: 'localStorage' | 'sessionStorage';
  key: string;
  value: string | null;
}

type MessageType = {
  action: string
  payload: NubeSDKStorageEvent
}

export type NubeSDKEvent = {
  id: string,
  data: NubeSDKStorageEvent
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
      sendResponse: () => void
    ) => {
      if (message.action === 'nube-devtools-storage-events' && message.payload) {
        setEvents((prevEvents) => [...prevEvents, {
          id: uuidv4(),
          data: message.payload,
        }])
        sendResponse()
        return true
      }
      return false
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
