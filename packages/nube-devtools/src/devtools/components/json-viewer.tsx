import ReactJsonView from '@microlink/react-json-view'
import { useDevToolsTheme } from '@/contexts/devtools-theme-context'

interface JsonViewerProps {
  data: object
  className?: string
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  const { theme } = useDevToolsTheme()

  return (
    <div className={className}>
      <ReactJsonView
        src={data}
        theme={theme === 'dark' ? 'monokai' : 'rjv-default'}
        collapsed={2}
        displayDataTypes={false}
        iconStyle="circle"
        enableClipboard={false}
        style={{
          backgroundColor: 'transparent',
        }}
      />
    </div>
  )
}
