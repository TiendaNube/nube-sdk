import { useNubeStatus } from '../hooks/use-nube-status'
import { NavigationProvider, useNavigation } from '../contexts/navigation-context'
import { NubeSDKEventsProvider } from '@/contexts/nube-sdk-events-context'
import { NubeSDKStorageProvider } from '@/contexts/nube-sdk-storage-context'
import { Toaster } from '@/components/ui/sonner'

import { Events } from './pages/events'
import { Unavailable } from './pages/unavailable'
import { Storages } from './pages/storages'
import { Apps } from './pages/apps'
import { NubeSDKAppsProvider } from '@/contexts/nube-sdk-apps-context'

const AppContent = () => {
  const nubeStatus = useNubeStatus()
  const { currentPage } = useNavigation()

  if (!nubeStatus) {
    return <Unavailable />
  }

  switch (currentPage) {
    case 'apps':
      return <Apps />
    case 'events':
      return <Events />
    case 'storages':
      return <Storages />
    default:
      return <Apps />
  }
}

export const App = () => {
  return (
    <NavigationProvider>
      <NubeSDKEventsProvider>
        <NubeSDKStorageProvider>
          <NubeSDKAppsProvider>
            <AppContent />
            <Toaster />
          </NubeSDKAppsProvider>
        </NubeSDKStorageProvider>
      </NubeSDKEventsProvider>
    </NavigationProvider>
  )
}

export default App
