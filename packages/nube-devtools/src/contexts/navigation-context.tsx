import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Page = 'events' | 'storages' | 'apps'

type NavigationContextType = {
  currentPage: Page
  navigate: (page: Page) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('apps')

  const navigate = (page: Page) => {
    setCurrentPage(page)
  }

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
