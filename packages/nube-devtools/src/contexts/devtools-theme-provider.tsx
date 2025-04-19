import { getBrowserTheme } from '@/utils/utils'
import { createContext, useContext, useEffect, useState } from 'react'

export type BrowserTheme = 'dark' | 'light'

type DevToolsThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: BrowserTheme
  storageKey?: string
}

type DevToolsThemeProviderState = {
  theme: BrowserTheme
  setTheme: (theme: BrowserTheme) => void
}

const initialState: DevToolsThemeProviderState = {
  theme: getBrowserTheme(),
  setTheme: () => null,
}

const DevToolsThemeProviderContext = createContext<DevToolsThemeProviderState>(initialState)

export function DevToolsThemeProvider({
  children,
  defaultTheme = getBrowserTheme(),
  storageKey = 'nube-devtools-ui-theme',
  ...props
}: DevToolsThemeProviderProps) {
  const [theme, setTheme] = useState<BrowserTheme>(defaultTheme)

  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as BrowserTheme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (newTheme: BrowserTheme) => {
      setTheme(newTheme)
    },
  }

  return (
    <DevToolsThemeProviderContext.Provider {...props} value={value}>
      {children}
    </DevToolsThemeProviderContext.Provider>
  )
}

export const useDevToolsTheme = () => {
  const context = useContext(DevToolsThemeProviderContext)

  if (context === undefined)
    throw new Error('useDevToolsTheme must be used within a DevToolsThemeProvider')

  return context
}
