import { Badge } from '@/components/ui/badge'

export default function BadgeStatus() {
  return (
    <>
      <Badge variant="success">Aktif</Badge>
      <Badge variant="warning">Menunggu</Badge>
      <Badge variant="danger">Diblokir</Badge>
      <Badge>Draft</Badge>
      <Badge variant="well">Belum</Badge>
    </>
  )
}
