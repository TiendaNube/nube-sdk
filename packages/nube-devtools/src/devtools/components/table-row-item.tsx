import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { Repeat } from 'lucide-react'

type Event<T> = {
  id: string
  data: T
}

type TableRowItemProps<T> = {
  event: Event<T>
  title: string
  badge1?: string
  badge2?: string
  isSelected: boolean
  onSelect: (event: Event<T>) => void
  onResend?: (event: Event<T>) => void
}

export function TableRowItem<T>({
  event,
  onSelect,
  isSelected,
  onResend,
  title: text,
  badge1,
  badge2,
}: TableRowItemProps<T>) {
  const [isHighlighted, setIsHighlighted] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHighlighted(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const handleResend = () => {
    if (onResend) {
      onResend(event)
    }
  }

  return (
    <TableCell
      className={`p-0 transition-colors duration-1000 ${isHighlighted ? 'bg-amber-500/20' : ''}`}
    >
      <div className="flex items-center justify-between w-full">
        <Button
          onClick={() => onSelect(event)}
          variant="ghost"
          className={`relative cursor-pointer flex-1 justify-start rounded-none ${isSelected ? 'shadow-[inset_2px_0_0_0_rgb(180,83,9)]' : ''}`}
        >
          {text}
          {badge1 && (
            <Badge className="text-[10px] px-1 py-0.5" variant="outline">
              {badge1}
            </Badge>
          )}
          {badge2 && (
            <Badge className="text-[10px] px-1 py-0.5" variant="outline">
              {badge2}
            </Badge>
          )}
        </Button>
        {onResend && (
          <Button variant="outline" onClick={handleResend} size="sm" className="h-6 w-6 p-0 absolute right-2">
            <Repeat className="h-3 w-3 transition-all duration-300 ease-in-out" />
          </Button>
        )}
      </div>
    </TableCell>
  )
}
