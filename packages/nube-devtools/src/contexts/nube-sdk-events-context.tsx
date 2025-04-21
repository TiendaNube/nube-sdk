import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { NubeSDKState } from '@tiendanube/nube-sdk-types'
import { v4 as uuidv4 } from 'uuid'

type MessageType = {
  action: string
  payload?: NubeSDKEventData
}

export type NubeSDKEventData = [
  data: NubeSDKState,
  eventType: string,
  action: string,
]

export type NubeSDKEvent = {
  id: string,
  data: NubeSDKEventData
}

interface NubeSDKEventsContextType {
  events: NubeSDKEvent[]
  clearEvents: () => void
}

const NubeSDKEventsContext = createContext<NubeSDKEventsContextType | undefined>(undefined)

export const NubeSDKEventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<NubeSDKEvent[]>([])

  const clearEvents = () => {
    setEvents([])
  }

  useEffect(() => {
    const listener = (
      message: MessageType,
      _: chrome.runtime.MessageSender,
      sendResponse: () => void
    ) => {
      if (message.action === 'nube-devtools-events' && message.payload) {
        setEvents((prevEvents) => {
          return [...prevEvents, {
            id: uuidv4(),
            data: message.payload as NubeSDKEventData,
          }]
        })
        // sendResponse()
        return false
      }
      return false
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  return (
    <NubeSDKEventsContext.Provider value={{ events, clearEvents }}>
      {children}
    </NubeSDKEventsContext.Provider>
  )
}

export const useNubeSDKEventsContext = () => {
  const context = useContext(NubeSDKEventsContext)
  if (context === undefined) {
    throw new Error('useNubeSDKEventsContext must be used within a NubeSDKEventsProvider')
  }
  return context
}
