import { useEffect, useRef, useState } from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyDescription,
  ComboboxEmptyTitle,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'

interface Merchant {
  value: string
  label: string
}

const ALL: Merchant[] = [
  { value: 'tokopedia', label: 'Tokopedia' },
  { value: 'traveloka', label: 'Traveloka' },
  { value: 'gojek', label: 'Gojek' },
  { value: 'grab', label: 'Grab' },
  { value: 'shopee', label: 'Shopee' },
]

/** Stands in for an API call. */
function searchMerchants(query: string) {
  return new Promise<Merchant[]>((resolve) =>
    setTimeout(() => resolve(ALL.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))), 400),
  )
}

export default function ComboboxAsync() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Merchant[]>(ALL)
  const [loading, setLoading] = useState(false)
  const latest = useRef(0)

  useEffect(() => {
    const id = ++latest.current
    searchMerchants(query).then((found) => {
      if (id !== latest.current) return
      setResults(found)
      setLoading(false)
    })
  }, [query])

  return (
    <Combobox
      items={results}
      filter={null}
      inputValue={query}
      onInputValueChange={(next) => {
        setLoading(true)
        setQuery(next)
      }}
    >
      <ComboboxTrigger aria-label="Merchant" className="w-64">
        <ComboboxValue placeholder="Pilih merchant" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Cari merchant" aria-label="Cari merchant" />
        {loading ? (
          <ComboboxStatus>Memuat hasil…</ComboboxStatus>
        ) : (
          <ComboboxEmpty>
            <ComboboxEmptyTitle>Merchant tidak ditemukan</ComboboxEmptyTitle>
            <ComboboxEmptyDescription>Coba nama lain.</ComboboxEmptyDescription>
          </ComboboxEmpty>
        )}
        {loading ? null : (
          <ComboboxList>
            {(merchant: Merchant) => (
              <ComboboxItem key={merchant.value} value={merchant}>
                {merchant.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
