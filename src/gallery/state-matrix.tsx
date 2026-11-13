import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

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

/**
 * Variant × state grid. Interaction states are forced with `data-force-state`, so every state is
 * visible at once. Each cell copies its own usage snippet.
 */
export function StateMatrix({ def }: { def: MatrixDef }) {
  const cell = def.cellWidth ?? 128
  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-ring">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <caption className="sr-only">{def.title}</caption>
          <thead>
            <tr className="border-b border-border-subtle bg-canvas">
              <th scope="col" className="sticky left-0 z-1 h-10 bg-canvas px-4 text-left">
                <span className="sr-only">Variant</span>
              </th>
              {def.columns.map((col) => (
                <th key={col.label} scope="col" className="h-10 px-3 text-left" style={{ minWidth: cell }}>
                  <AxisLabel item={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {def.rows.map((row) => (
              <tr key={row.label} className="border-b border-border-subtle last:border-b-0">
                <th scope="row" className="sticky left-0 z-1 bg-surface px-4 py-3 text-left">
                  <AxisLabel item={row} />
                </th>
                {def.columns.map((col) => {
                  const props = { ...row.props, ...col.props }
                  return (
                    <td key={col.label} className="px-3 py-3 align-middle">
                      <MatrixCell
                        label={`${row.label}, ${col.label}`}
                        code={def.code(props)}
                      >
                        {def.render(props, col.force ?? row.force)}
                      </MatrixCell>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
          'absolute -top-1 -right-1 inline-flex size-6 items-center justify-center rounded-md bg-surface text-ink-2 shadow-control outline-none',
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
