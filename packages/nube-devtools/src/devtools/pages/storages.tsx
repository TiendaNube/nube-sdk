import Layout from '@/devtools/components/layout'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { NubeSDKEvent } from '@/contexts/nube-sdk-storage-context'
import { useNubeSDKStorage } from '@/contexts/nube-sdk-storage-context'
import { Table, TableBody, TableRow } from '@/components/ui/table'
import { TableRowItem } from '../components/table-row-item'
import { JsonViewer } from '../components/json-viewer'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

const STORAGE_KEY = 'nube-devtools-storages-page-width'

export function Storages() {
  const [selectedEvent, setSelectedEvent] = useState<NubeSDKEvent | null>(null)
  const { events, cleanup } = useNubeSDKStorage()
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop =
        tableContainerRef.current.scrollHeight - tableContainerRef.current.clientHeight
    }
  }, [events])

  const handleClearList = () => {
    setSelectedEvent(null)
    cleanup()
  }

  const parsedEventData = useMemo(() => {
    if (!selectedEvent) return {}
    return {
      ...selectedEvent.data,
      value: selectedEvent.data.value ? JSON.parse(selectedEvent.data.value) : {},
    }
  }, [selectedEvent])

  return (
    <Layout>
      <ResizablePanelGroup autoSaveId={STORAGE_KEY} storage={localStorage} direction="horizontal">
        <ResizablePanel defaultSize={40}>
          <nav className="flex items-center justify-between px-1.5 py-1 border-b">
            <span className="text-xs">
              {events.length} {events.length === 1 ? 'storage event' : 'storage events'}
            </span>
            <Button
              disabled={events.length === 0}
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleClearList}
            >
              <TrashIcon className="size-3" />
            </Button>
          </nav>
          <div
            ref={tableContainerRef}
            className="h-[calc(100%-33px)] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600"
          >
            {events.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="text-sm">No storage data found</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => {
                    chrome.devtools.inspectedWindow.reload()
                  }}
                >
                  Reload page
                </Button>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableRowItem
                        title={event.data.key}
                        isSelected={event.id === selectedEvent?.id}
                        badge1={event.data.type}
                        badge2={event.data.method}
                        event={event}
                        onSelect={setSelectedEvent}
                      />
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <div className="flex h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {selectedEvent && (
              <div className="text-sm">
                <JsonViewer className="p-2" data={parsedEventData} />
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Layout>
  )
}
