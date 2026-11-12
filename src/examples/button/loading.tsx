import { useState } from 'react'

import { Button } from '@/components/ui/button'

export default function ButtonLoading() {
  const [saving, setSaving] = useState(false)

  function save() {
    setSaving(true)
    window.setTimeout(() => setSaving(false), 2000)
  }

  return (
    <>
      <Button loading={saving} onClick={save}>
        Simpan perubahan
      </Button>
      <Button variant="secondary" loading loadingLabel="Memperbarui…">
        Perbarui saldo
      </Button>
    </>
  )
}
