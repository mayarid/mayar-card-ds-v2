import { Add01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function ButtonWithIcon() {
  return (
    <>
      <Button>
        <Icon icon={Add01Icon} />
        Buat kartu
      </Button>
      <Button variant="secondary">
        Lanjut
        <Icon icon={ArrowRight01Icon} />
      </Button>
    </>
  )
}
