import { Kbd } from '@/components/ui/kbd'

export default function KbdShortcuts() {
  return (
    <div className="flex items-center gap-2">
      <Kbd>⌘K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd>/</Kbd>
    </div>
  )
}
