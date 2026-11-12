import { Checkbox } from '@/components/ui/checkbox'

const DOCUMENTS = ['KTP', 'Selfie dengan KTP', 'NPWP', 'Akta perusahaan', 'NIB', 'Rekening koran']

export default function CheckboxTileGrid() {
  return (
    <fieldset className="grid w-full max-w-md grid-cols-2 gap-2">
      <legend className="mb-2 text-body-sm font-medium text-ink">Dokumen yang perlu diunggah ulang</legend>
      {DOCUMENTS.map((doc, i) => (
        <Checkbox key={doc} variant="tile" name="dokumen" value={doc} defaultChecked={i === 1}>
          {doc}
        </Checkbox>
      ))}
    </fieldset>
  )
}
