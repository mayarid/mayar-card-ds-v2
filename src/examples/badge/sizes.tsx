import { Badge } from '@/components/ui/badge'

export default function BadgeSizes() {
  return (
    <>
      <Badge variant="brand" size="sm">
        Baru
      </Badge>
      <Badge variant="brand">Baru</Badge>
      <Badge variant="brand" size="lg">
        Baru
      </Badge>
    </>
  )
}
