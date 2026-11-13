import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { useLayoutEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import type { MatrixAxisItem, MatrixDef } from '@/docs/types'
import { cn } from '@/lib/utils'

import { useCopy } from './use-copy'

function AxisLabel({ item }: { item: MatrixAxisItem }) {
  return (
    <span className="inline-flex items-center text-caption-lg font-medium whitespace-nowrap text-ink-2">
      {item.label}
    </span>
  )
}

/* The row label column, in px, when the grid fits as a table. */
const LABEL_WIDTH = 120

/**
 * Fits the grid to its frame: a table when every column has room, else one block per row with
 * the cells wrapped under it. The grid never scrolls sideways.
 */
function useFitsAsTable(columns: number, cell: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [fits, setFits] = useState(true)
  // Width the table needs. Starts from the cell widths; grows if a cell turns out wider.
  const needed = useRef(LABEL_WIDTH + columns * cell)

  useLayoutEffect(() => {
    needed.current = LABEL_WIDTH + columns * cell
    const el = ref.current
    if (!el) return
    const measure = () => {
      // jsdom reports 0; keep the table there.
      const width = el.clientWidth
      if (width > 0) setFits(width >= needed.current)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [columns, cell])

  // A cell can be wider than `cellWidth` says. If the table overflows, remember its real width and stack.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !fits || el.clientWidth === 0) return
    const cells = [...el.querySelectorAll('td')]
    const widest = Math.max(0, ...cells.map((td) => td.scrollWidth - td.clientWidth))
    if (el.scrollWidth > el.clientWidth + 1 || widest > 1) {
      needed.current = Math.max(needed.current, el.scrollWidth, el.clientWidth + widest * columns + 1)
      setFits(false)
    }
  }, [fits, columns])

  return { ref, fits }
}

/**
 * Variant × state grid. Interaction states are forced with `data-force-state`, so every state is
 * visible at once. Each cell copies its own usage snippet.
 */
export function StateMatrix({ def }: { def: MatrixDef }) {
  const cell = def.cellWidth ?? 128
  const { ref, fits } = useFitsAsTable(def.columns.length, cell)

  const renderCell = (row: MatrixAxisItem, col: MatrixAxisItem) => {
    const props = { ...row.props, ...col.props }
    return (
      <MatrixCell label={`${row.label}, ${col.label}`} code={def.code(props)}>
        {def.render(props, col.force ?? row.force)}
      </MatrixCell>
    )
  }

  return (
    <div ref={ref} data-layout={fits ? 'table' : 'stacked'} className="overflow-hidden rounded-xl bg-surface shadow-ring">
      {fits ? (
        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">{def.title}</caption>
          <colgroup>
            <col style={{ width: LABEL_WIDTH }} />
            {def.columns.map((col) => (
              <col key={col.label} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-border-subtle bg-canvas">
              <th scope="col" className="h-10 px-4 text-left">
                <span className="sr-only">Variant</span>
              </th>
              {def.columns.map((col) => (
                <th key={col.label} scope="col" className="h-10 px-2 text-left">
                  <AxisLabel item={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {def.rows.map((row) => (
              <tr key={row.label} className="border-b border-border-subtle last:border-b-0">
                <th scope="row" className="px-4 py-3 text-left">
                  <AxisLabel item={row} />
                </th>
                {def.columns.map((col) => (
                  <td key={col.label} className="px-2 py-3 align-middle">
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul aria-label={def.title} className="flex flex-col">
          {def.rows.map((row) => (
            <li key={row.label} className="flex flex-col gap-3 border-b border-border-subtle px-4 py-4 last:border-b-0">
              <span className="text-body-sm font-medium text-ink">{row.label}</span>
              {/* Cells take their own width and wrap. Only a cell wider than the frame scrolls, inside itself. */}
              <ul aria-label={row.label} className="flex flex-wrap gap-x-6 gap-y-4">
                {def.columns.map((col) => (
                  <li key={col.label} className="flex max-w-full min-w-0 flex-col gap-1.5" style={{ minWidth: `min(${cell}px, 100%)` }}>
                    <AxisLabel item={col} />
                    <div className="-m-1 max-w-[calc(100%+8px)] overflow-x-auto p-1">{renderCell(row, col)}</div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MatrixCell({ children, code, label }: { children: React.ReactNode; code: string; label: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="group/cell relative flex min-h-10 items-center">
      {/* `inert`: forced-state specimens are pictures of a state, not live controls. */}
      <div inert className="flex items-center">
        {children}
      </div>
      <button
        type="button"
        onClick={() => void copy(code)}
        aria-label={copied ? `Copied ${label}` : `Copy code: ${label}`}
        className={cn(
          'absolute top-0 right-0 inline-flex size-6 items-center justify-center rounded-md bg-surface text-ink-2 shadow-control outline-none',
          'opacity-0 transition-opacity duration-(--motion-quick) group-hover/cell:opacity-100 focus-visible:opacity-100 focus-visible:outline-focus',
          'pointer-coarse:opacity-100',
          copied && 'text-success-text opacity-100',
        )}
      >
        <Icon icon={copied ? Tick02Icon : Copy01Icon} size={14} />
      </button>
    </div>
  )
}
