import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/button'

type CustomButtonProps = {
  children: React.ReactNode
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  className?: string
}

const CustomButton = ({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}: CustomButtonProps) => {
  return (
    <Button
      size="sm"
      className={`flex items-center w-full justify-start p-0 h-[24px] rounded-none ${className}`}
      variant="ghost"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Button>
  )
}

export type LeafNode = {
  type: string
  children: string
  __internalId: string
}

export type TreeNode = {
  type: string
  children?: Array<TreeNode | LeafNode> | TreeNode | LeafNode
  __internalId?: string
}

type TreeViewProps = {
  data: Record<string, TreeNode | LeafNode>
  onSelectNode?: (node: TreeNode | LeafNode) => void
}

const componentNames = {
  box: 'Box',
  col: 'Column',
  img: 'Image',
  field: 'Field',
  fragment: 'Fragment',
  row: 'Row',
  txt: 'Text',
  check: 'Checkbox',
  txtarea: 'Textarea',
  button: 'Button',
}

const isTreeNode = (node: TreeNode | LeafNode): node is TreeNode => {
  return 'children' in node && (Array.isArray(node.children) || typeof node.children === 'object')
}

const TreeNode: FC<{
  node: TreeNode | LeafNode
  index: number
  onSelectNode?: (node: TreeNode | LeafNode) => void
}> = ({ node, index, onSelectNode }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const title = useMemo(() => {
    return componentNames[node.type as keyof typeof componentNames] || node.type
  }, [node.type])

  const handleHighlight = (type: 'enter' | 'leave') => {
    chrome.runtime.sendMessage({
      action: 'nube-devtools-highlight-element',
      payload: {
        tabId: chrome.devtools.inspectedWindow.tabId,
        id: node.__internalId,
        title,
        type,
        color: 'blue',
      },
    })
  }

  const handleOnClick = () => {
    chrome.runtime.sendMessage({
      action: 'nube-devtools-scroll-to-element',
      payload: {
        tabId: chrome.devtools.inspectedWindow.tabId,
        id: node.__internalId,
      },
    })
  }

  if (!isTreeNode(node)) {
    return (
      <CustomButton
        className="hover:bg-[rgba(111,168,220,0.15)] dark:hover:bg-[rgba(111,168,220,0.15)]"
        onClick={() => {
          onSelectNode?.(node)
          handleOnClick()
        }}
        onMouseEnter={() => handleHighlight('enter')}
        onMouseLeave={() => handleHighlight('leave')}
      >
        <span style={{ paddingLeft: `${index * 12 + 16}px` }} className="text-[12px]">
          {title}
        </span>
      </CustomButton>
    )
  }

  const children = Array.isArray(node.children)
    ? node.children
    : node.children
      ? [node.children]
      : []

  return (
    <>
      <CustomButton
        onClick={() => {
          onSelectNode?.(node)
          handleOnClick()
        }}
        onMouseEnter={() => handleHighlight('enter')}
        onMouseLeave={() => handleHighlight('leave')}
        className="hover:bg-[rgba(111,168,220,0.15)] dark:hover:bg-[rgba(111,168,220,0.15)]"
      >
        <div style={{ paddingLeft: `${index * 12}px` }} className="flex items-center">
          <ExpandableNode
            isExpanded={isExpanded}
            onClick={() => {
              handleToggle()
            }}
          >
            <span className="text-[12px] text-light">
              {componentNames[node.type as keyof typeof componentNames] || node.type}
            </span>
          </ExpandableNode>
        </div>
      </CustomButton>
      {isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.__internalId}
              node={child}
              index={index + 1}
              onSelectNode={onSelectNode}
            />
          ))}
        </div>
      )}
    </>
  )
}

const ExpandableNode = ({
  children,
  onClick,
  isExpanded,
}: {
  children: React.ReactNode
  onClick: () => void
  isExpanded?: boolean
}) => {
  return (
    <div className="flex items-center">
      <div
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick()
          }
        }}
        role="button"
        tabIndex={0}
        className="px-1 cursor-pointer"
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      {children}
    </div>
  )
}

export const TreeView: FC<TreeViewProps> = ({ data, onSelectNode }) => {
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})

  const handleToggle = (slot: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [slot]: !prev[slot],
    }))
  }

  const handleHighlight = (slot: string, type: 'enter' | 'leave') => {
    chrome.runtime.sendMessage({
      action: 'nube-devtools-highlight-element',
      payload: {
        tabId: chrome.devtools.inspectedWindow.tabId,
        id: `nube-sdk-slot-${slot}`,
        title: slot,
        type,
        color: 'green',
      },
    })
  }

  const handleOnClick = (slot: string) => {
    chrome.runtime.sendMessage({
      action: 'nube-devtools-scroll-to-element',
      payload: {
        tabId: chrome.devtools.inspectedWindow.tabId,
        id: `nube-sdk-slot-${slot}`,
      },
    })
  }

  return (
    <>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <CustomButton
            className="hover:bg-[rgba(124,219,110,0.15)] dark:hover:bg-[rgba(124,219,110,0.15)]"
            onMouseEnter={() => handleHighlight(key, 'enter')}
            onMouseLeave={() => handleHighlight(key, 'leave')}
            onClick={() => handleOnClick(key)}
          >
            <ExpandableNode onClick={() => handleToggle(key)} isExpanded={isExpanded[key]}>
              <span className="text-[13px] font-bold">{key}</span>
            </ExpandableNode>
          </CustomButton>
          {isExpanded[key] && <TreeNode node={value} index={1} onSelectNode={onSelectNode} />}
        </div>
      ))}
    </>
  )
}
