import { UsageBar } from '@/components/ui/usage-bar'

const budgets = [
  { name: 'Iklan', used: 30 },
  { name: 'Langganan', used: 62 },
  { name: 'Perjalanan', used: 80 },
  { name: 'Operasional', used: 95 },
  { name: 'Hiburan', used: 112 },
]

export default function UsageBarRamp() {
  return (
    <ul className="flex w-80 flex-col gap-3">
      {budgets.map((b, i) => (
        <li key={b.name} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-body-sm">
            <span className="text-ink-2">{b.name}</span>
            <span className="font-medium text-ink tabular-nums">{b.used}%</span>
          </div>
          {/* The numbers are printed above, so the bar is decorative. */}
          <UsageBar value={b.used} style={{ '--bar-delay': `${i * 40}ms` } as React.CSSProperties} />
        </li>
      ))}
    </ul>
  )
}
