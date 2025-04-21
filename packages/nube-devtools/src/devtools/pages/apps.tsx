import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Table, TableBody, TableRow } from '@/components/ui/table'
import Layout from '@/devtools/components/layout'
import type { NubeSDKEvent } from '@/contexts/nube-sdk-apps-context'
import { useNubeSDKAppsContext } from '@/contexts/nube-sdk-apps-context'
import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { TableRowItem } from '../components/table-row-item'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'nube-devtools-apps-panel-size'

type NubeSDKAppsResponse = {
  status: boolean
  apps: {
    [key: string]: NubeSDKEvent['data']
  }
}

export function Apps() {
  const { apps, setApps } = useNubeSDKAppsContext()
  const [selectedApp, setSelectedApp] = useState<NubeSDKEvent | null>(null)

  const getApps = useCallback(() => {
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
      },
    )
  }, [setApps])

  useEffect(() => {
    getApps()
  }, [getApps])

  const handleOnSelect = (event: NubeSDKEvent) => {
    setSelectedApp(event)
  }

  const isDevMode = (script: string) => {
    return script.includes('localhost') || script.includes('127.0.0.1')
  }

  return (
    <Layout>
      <ResizablePanelGroup autoSaveId={STORAGE_KEY} storage={localStorage} direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px]">
            <div className="flex items-center">
              <SidebarTrigger />
            </div>
            <span className="text-xs">
              {apps.length} {apps.length === 1 ? 'app' : 'apps'}
            </span>
          </nav>
          {apps.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <p className="text-sm">No apps found</p>
              <Button
                variant="outline"
                size="sm"
                className="h-5 px-2 text-xs"
                onClick={() => {
                  getApps()
                }}
              >
                Reload page
              </Button>
            </div>
          ) : (
            <Table>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableRowItem
                      isSelected={app.id === selectedApp?.id}
                      title={app.data.id}
                      badge1={isDevMode(app.data.script) ? 'dev mode' : undefined}
                      event={app}
                      onSelect={handleOnSelect}
                    />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          {selectedApp && (
            <div className="p-4">
              <div className="space-y-1 pb-4">
                <h4 className="text-sm font-medium leading-none">ID</h4>
                <Input
                  className="w-auto"
                  defaultValue={selectedApp.data.id}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
              <div className="space-y-1 pb-4">
                <h4 className="text-sm font-medium leading-none">Registered</h4>
                <Input
                  className="w-auto"
                  defaultValue={selectedApp.data.registered ? 'true' : 'false'}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Script</h4>
                <div className="flex items-center gap-2">
                  <Textarea
                    className="w-auto max-w-[300px]"
                    defaultValue={selectedApp.data.script}
                    onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                  />
                </div>
              </div>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  )
}
