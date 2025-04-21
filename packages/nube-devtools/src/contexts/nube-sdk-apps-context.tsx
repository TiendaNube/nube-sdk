import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface NubeSDKEvent {
  id: string
  data: {
    id: string
    registered: boolean
    script: string
  }
}

type NubeSDKAppsContextType = {
  apps: NubeSDKEvent[]
  getApps: () => void
  isLoading: boolean
}

type NubeSDKAppsResponse = {
  status: boolean
  apps: {
    [key: string]: NubeSDKEvent['data']
  }
}

const NubeSDKAppsContext = createContext<NubeSDKAppsContextType | undefined>(undefined)

export const NubeSDKAppsProvider = ({ children }: { children: ReactNode }) => {
  const [apps, setApps] = useState<NubeSDKEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getApps = useCallback(() => {
    setIsLoading(true)
    chrome.runtime.sendMessage(
      {
        action: 'nube-devtools-get-apps',
        payload: {
          tabId: chrome.devtools.inspectedWindow.tabId,
        }
      },
      (response: NubeSDKAppsResponse) => {
        if (response.status && response.apps) {
          const apps = Object.keys(response.apps).map((key) => {
            return {
              id: uuidv4(),
              data: response.apps[key],
            }
          })
          setApps(apps)
        } else {
          setApps([])
        }
        setIsLoading(false)
      },
    )
  }, [])

  useEffect(() => {
    getApps()
  }, [getApps])

  return (
    <NubeSDKAppsContext.Provider value={{ apps, getApps, isLoading }}>{children}</NubeSDKAppsContext.Provider>
  )
}

export const useNubeSDKAppsContext = () => {
  const context = useContext(NubeSDKAppsContext)
  if (context === undefined) {
    throw new Error('useNubeSDKAppsContext must be used within a NubeSDKAppsProvider')
  }
  return context
}
