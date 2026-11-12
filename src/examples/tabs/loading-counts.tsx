import { Tabs, TabsCount, TabsList, TabsTab } from '@/components/ui/tabs'

export default function TabsLoadingCounts() {
  return (
    <div aria-busy="true" className="w-full">
      <Tabs variant="line" defaultValue="waiting">
        <TabsList aria-label="Antrean KYC">
          <TabsTab value="waiting">
            Menunggu
            <TabsCount loading />
          </TabsTab>
          <TabsTab value="review">
            Ditinjau
            <TabsCount loading />
          </TabsTab>
          <TabsTab value="done">
            Selesai
            <TabsCount loading />
          </TabsTab>
        </TabsList>
      </Tabs>
    </div>
  )
}
