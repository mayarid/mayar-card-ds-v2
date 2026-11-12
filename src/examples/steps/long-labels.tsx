import { Step, Steps } from '@/components/ui/steps'

export default function StepsLongLabels() {
  return (
    <Steps current={3} className="w-72">
      <Step>Informasi perusahaan</Step>
      <Step>Pemilik manfaat</Step>
      <Step>Dokumen pendukung</Step>
      <Step>Tinjauan akhir</Step>
    </Steps>
  )
}
