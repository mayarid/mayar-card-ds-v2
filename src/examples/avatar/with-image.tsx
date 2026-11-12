import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AvatarWithImage() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size={40} aria-hidden={false} role="img" aria-label="Siti Rahma">
        <AvatarImage src={`${import.meta.env.BASE_URL}avatars/siti.svg`} alt="" />
        <AvatarFallback name="Siti Rahma" delay={300} />
      </Avatar>
      <Avatar size={40} aria-hidden={false} role="img" aria-label="Andi Pratama">
        <AvatarImage src={`${import.meta.env.BASE_URL}avatars/gambar-tidak-ada.png`} alt="" />
        <AvatarFallback name="Andi Pratama" />
      </Avatar>
    </div>
  )
}
