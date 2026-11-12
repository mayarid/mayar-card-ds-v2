import { useState } from 'react'

import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'

export default function TabsFill() {
  const [mode, setMode] = useState('fixed')

  return (
    <Tabs fill value={mode} onValueChange={(value) => setMode(String(value))} className="w-full max-w-sm gap-3">
      <TabsList aria-label="Jumlah">
        <TabsTab value="fixed">Nominal tetap</TabsTab>
        <TabsTab value="range">Rentang</TabsTab>
      </TabsList>
      <TabsPanel value="fixed" className="text-body-sm text-ink-2">
        Masukkan satu nominal.
      </TabsPanel>
      <TabsPanel value="range" className="text-body-sm text-ink-2">
        Masukkan nominal terendah dan tertinggi.
      </TabsPanel>
    </Tabs>
  )
}
