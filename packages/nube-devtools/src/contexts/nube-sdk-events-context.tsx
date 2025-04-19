import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { NubeSDKState } from '@tiendanube/nube-sdk-types'
import { v4 as uuidv4 } from 'uuid'

type MessageType = {
  action: string
  info?: string
}

type EnvioDadosMessage = {
  action: 'envioDados'
  info: string
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
      sendResponse: (response?: { status: boolean }) => void
    ) => {
      if (isEnvioDadosMessage(message)) {
        const event = JSON.parse(message.info) as NubeSDKEventData;
        setEvents((prevEvents: NubeSDKEvent[]) => {
          return [...prevEvents, {
            id: uuidv4(),
            data: event,
          }]
        })
        sendResponse({ status: true });
      }
    }

    function isEnvioDadosMessage(message: MessageType): message is EnvioDadosMessage {
      return message.action === 'envioDados' && 'info' in message
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
