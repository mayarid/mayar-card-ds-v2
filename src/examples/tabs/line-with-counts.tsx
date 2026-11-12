import { Tabs, TabsCount, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'

export default function TabsLineWithCounts() {
  return (
    <Tabs variant="line" tone="primary" defaultValue="waiting" className="w-full gap-4">
      <TabsList aria-label="Status pengajuan">
        <TabsTab value="waiting">
          Menunggu
          <TabsCount label="pengajuan">12</TabsCount>
        </TabsTab>
        <TabsTab value="approved">
          Disetujui
          <TabsCount label="pengajuan">48</TabsCount>
        </TabsTab>
        <TabsTab value="rejected">
          Ditolak
          <TabsCount label="pengajuan">3</TabsCount>
        </TabsTab>
      </TabsList>
      <TabsPanel value="waiting" className="text-body-sm text-ink-2">
        12 pengajuan menunggu peninjauan.
      </TabsPanel>
      <TabsPanel value="approved" className="text-body-sm text-ink-2">
        48 pengajuan disetujui.
      </TabsPanel>
      <TabsPanel value="rejected" className="text-body-sm text-ink-2">
        3 pengajuan ditolak.
      </TabsPanel>
    </Tabs>
  )
}
