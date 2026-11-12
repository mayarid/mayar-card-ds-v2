import { Button } from '@/components/ui/button'

export default function ButtonPill() {
  return (
    <>
      <Button shape="pill">Primary</Button>
      <Button shape="pill" variant="secondary">
        Secondary
      </Button>
      <Button shape="pill" variant="tertiary">
        Tertiary
      </Button>
    </>
  )
}
