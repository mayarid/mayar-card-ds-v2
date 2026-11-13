import { useId, useState } from 'react'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { ControlDef, PlaygroundDef, PropValue } from '@/docs/types'

import { CodeBlock } from './code-block'
import { frameClass, PreviewFrame } from './preview-frame'

function initialValues(controls: ControlDef[]) {
  return Object.fromEntries(controls.map((c) => [c.name, c.default])) as Record<string, PropValue>
}

/** Live preview and its props on one frame, with the matching code under them. */
export function Playground({ def }: { def: PlaygroundDef }) {
  const [values, setValues] = useState(() => initialValues(def.controls))
  const set = (name: string, value: PropValue) => setValues((prev) => ({ ...prev, [name]: value }))

  return (
    <div className={frameClass}>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_232px]">
        <PreviewFrame className="min-h-64">{def.render(values)}</PreviewFrame>
        <form
          aria-label="Props"
          className="flex flex-col gap-3 border-t border-border-subtle p-4 lg:border-t-0 lg:border-l"
          onSubmit={(e) => e.preventDefault()}
        >
          <p className="text-caption-lg font-medium text-muted">Props</p>
          {def.controls.map((control) => (
            <Control key={control.name} control={control} value={values[control.name]} onChange={set} />
          ))}
        </form>
      </div>
      <div className="border-t border-border-subtle">
        <CodeBlock bare code={def.code(values)} />
      </div>
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

  if (control.type === 'boolean') {
    return (
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="font-mono text-caption-lg text-ink-2">
          {label}
        </label>
        <Switch id={id} size="sm" checked={Boolean(value)} onCheckedChange={(checked) => onChange(control.name, checked)} />
      </div>
    )
  }

  if (control.type === 'select') {
    const items = control.options.map((option) => ({ value: option, label: option }))
    return (
      <div className="flex flex-col gap-1">
        <span id={id} className="font-mono text-caption-lg text-ink-2">
          {label}
        </span>
        <Select items={items} value={String(value)} onValueChange={(next) => onChange(control.name, next ?? control.default)}>
          <SelectTrigger aria-labelledby={id} size="md" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-mono text-caption-lg text-ink-2">
        {label}
      </label>
      <Input id={id} size="md" value={String(value ?? '')} onValueChange={(next) => onChange(control.name, next)} />
    </div>
  )
}
