import { Tabs, TabsHeader, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'

const CHANNELS = [
  { value: 'atm', label: 'ATM', steps: ['Masukkan kartu ATM dan PIN.', 'Pilih Transfer › Virtual Account.', 'Masukkan nomor VA, lalu konfirmasi.'] },
  { value: 'mbanking', label: 'm-BCA', steps: ['Buka m-BCA dan pilih m-Transfer.', 'Pilih BCA Virtual Account.', 'Masukkan nomor VA dan PIN.'] },
  { value: 'klikbca', label: 'KlikBCA', steps: ['Masuk ke KlikBCA.', 'Pilih Transfer Dana › Virtual Account.', 'Masukkan nomor VA dan KeyBCA.'] },
]

export default function TabsWithHeader() {
  return (
    <Tabs size="sm" defaultValue="atm" className="w-full max-w-md">
      <TabsHeader>
        <h4 className="text-body-sm font-semibold text-ink">Cara transfer ke BCA</h4>
        <TabsList aria-label="Cara transfer ke BCA">
          {CHANNELS.map((channel) => (
            <TabsTab key={channel.value} value={channel.value}>
              {channel.label}
            </TabsTab>
          ))}
        </TabsList>
      </TabsHeader>
      {CHANNELS.map((channel) => (
        <TabsPanel key={channel.value} value={channel.value}>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-body-sm text-ink-2">
            {channel.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </TabsPanel>
      ))}
    </Tabs>
  )
}
