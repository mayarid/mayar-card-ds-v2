import { Button } from '@/components/ui/button'

export default function ButtonAsLink() {
  return (
    <>
      <Button render={<a href="#sign-in" />}>Masuk</Button>
      <Button variant="link" render={<a href="#help" />}>
        Butuh bantuan?
      </Button>
      <Button variant="link-muted">Kirim ulang kode</Button>
    </>
  )
}
