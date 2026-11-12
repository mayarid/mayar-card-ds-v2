import { useId, useState } from 'react'

import type { ControlDef, PlaygroundDef, PropValue } from '@/docs/types'

import { CodeBlock } from './code-block'
import { PreviewFrame } from './preview-frame'

function initialValues(controls: ControlDef[]) {
  return Object.fromEntries(controls.map((c) => [c.name, c.default])) as Record<string, PropValue>
}

export function Playground({ def }: { def: PlaygroundDef }) {
  const [values, setValues] = useState(() => initialValues(def.controls))
  const set = (name: string, value: PropValue) => setValues((prev) => ({ ...prev, [name]: value }))

  return (
    <div className="flex flex-col gap-3">
      <div className="grid overflow-hidden rounded-2xl bg-surface shadow-ring lg:grid-cols-[minmax(0,1fr)_240px]">
        <PreviewFrame className="min-h-64 rounded-none shadow-none">{def.render(values)}</PreviewFrame>
        <form
          aria-label="Props"
          className="flex flex-col gap-3 border-t border-border-subtle bg-canvas p-4 lg:border-t-0 lg:border-l"
          onSubmit={(e) => e.preventDefault()}
        >
          <p className="text-overline text-muted uppercase">Props</p>
          {def.controls.map((control) => (
            <Control key={control.name} control={control} value={values[control.name]} onChange={set} />
          ))}
        </form>
      </div>
      <CodeBlock code={def.code(values)} />
    </div>
  )
}

function Control({
  control,
  value,
  onChange,
}: {
  control: ControlDef
  value: PropValue
  onChange: (name: string, value: PropValue) => void
}) {
  const id = useId()
  const label = control.label ?? control.name
  const field =
    'h-8 w-full rounded-md bg-surface px-2.5 text-body-sm text-ink shadow-control outline-none focus-visible:outline-focus'

  if (control.type === 'boolean') {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-2 text-body-sm text-ink-2">
        <span className="font-mono text-caption-lg">{label}</span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(control.name, e.target.checked)}
          className="size-4 accent-primary"
        />
      </label>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-caption-lg text-ink-2">
        {label}
      </label>
      {control.type === 'select' ? (
        <select id={id} value={String(value)} onChange={(e) => onChange(control.name, e.target.value)} className={field}>
          {control.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} value={String(value ?? '')} onChange={(e) => onChange(control.name, e.target.value)} className={field} />
      )}
    </div>
  )
}
