import { Tabs, TabsCount, TabsList, TabsTab } from '@/components/ui/tabs'

export default function TabsUnreadCount() {
  return (
    <Tabs variant="line" countTone="primary" defaultValue="all">
      <TabsList aria-label="Notifikasi">
        <TabsTab value="all">
          Semua
          <TabsCount label="belum dibaca">4</TabsCount>
        </TabsTab>
        <TabsTab value="tx">
          Transaksi
          <TabsCount label="belum dibaca">2</TabsCount>
        </TabsTab>
        <TabsTab value="system">Sistem</TabsTab>
      </TabsList>
    </Tabs>
  )
}
