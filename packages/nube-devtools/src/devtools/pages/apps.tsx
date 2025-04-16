import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Table, TableBody, TableRow } from '@/components/ui/table'
import Layout from '@/devtools/components/layout'
import type { NubeSDKEvent } from '@/contexts/nube-sdk-apps-context'
import { useNubeSDKAppsContext } from '@/contexts/nube-sdk-apps-context'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { TableRowItem } from '../components/table-row-item'

const STORAGE_KEY = 'nube-devtools-apps-panel-size'

export function Apps() {
  const { apps, getApps, isLoading } = useNubeSDKAppsContext()
  const [selectedApp, setSelectedApp] = useState<NubeSDKEvent | null>(null)

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
            <span className="text-xs">
              {apps.length} {apps.length === 1 ? 'app' : 'apps'}
            </span>
          </nav>
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Loading apps...</p>
            </div>
          ) : apps.length === 0 ? (
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
