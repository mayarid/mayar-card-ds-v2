import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'

export default function TabsSegmented() {
  return (
    <Tabs defaultValue="all" className="w-full max-w-md gap-3">
      <TabsList aria-label="Kartu">
        <TabsTab value="all">Semua kartu</TabsTab>
        <TabsTab value="mine">Kartu saya</TabsTab>
        <TabsTab value="frozen">Dibekukan</TabsTab>
      </TabsList>
      <TabsPanel value="all" className="text-body-sm text-ink-2">
        12 kartu aktif di tim ini.
      </TabsPanel>
      <TabsPanel value="mine" className="text-body-sm text-ink-2">
        3 kartu atas nama Anda.
      </TabsPanel>
      <TabsPanel value="frozen" className="text-body-sm text-ink-2">
        Tidak ada kartu yang dibekukan.
      </TabsPanel>
    </Tabs>
  )
}
