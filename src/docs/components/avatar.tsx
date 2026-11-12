import { Avatar, AvatarFallback, type AvatarSize, type AvatarTone } from '@/components/ui/avatar'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/avatar.tsx?raw'

const SIZES = ['24', '28', '32', '36', '40', '48', '56'] as const
const TONES = ['primary', 'tint', 'neutral'] as const satisfies readonly AvatarTone[]
const DEFAULTS = { size: 32, tone: 'primary' }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function render(props: Record<string, PropValue>) {
  return (
    <Avatar size={Number(props.size ?? 32) as AvatarSize} tone={(props.tone ?? 'primary') as AvatarTone}>
      <AvatarFallback name={String(props.name ?? 'Budi Santoso')} />
    </Avatar>
  )
}

function code(props: Record<string, PropValue>) {
  const { name = 'Budi Santoso', size, tone } = props
  return toJsx(
    'Avatar',
    { size: size === undefined ? undefined : Number(size), tone },
    toJsx('AvatarFallback', { name }),
    DEFAULTS,
  )
}

export const doc: ComponentDoc = {
  slug: 'avatar',
  name: 'Avatar',
  group: 'Display',
  description:
    'A round picture or initials for a person, in the sidebar account, team and member rows, card holders and the profile.',
  spec: 'code-only',
  registry: 'avatar',
  baseUi: { name: 'Avatar', url: 'https://base-ui.com/react/components/avatar' },
  source: [{ path: 'components/ui/avatar.tsx', code: source }],
  playground: {
    controls: [
      { name: 'size', type: 'select', options: SIZES, default: '32' },
      { name: 'tone', type: 'select', options: TONES, default: 'primary' },
      { name: 'name', type: 'text', default: 'Budi Santoso' },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Sizes × tones',
      description: 'Type steps: 24 caption-sm, 28–36 caption-lg, 40 body-sm, 48 body-base, 56 body-lg, all semibold.',
      rows: SIZES.map((s) => ({ label: s, props: { size: s }, codeOnly: true })),
      columns: TONES.map((t) => ({ label: cap(t), props: { tone: t } })),
      render,
      code,
    },
    {
      title: 'Fallback content (32)',
      description: 'Initials from a name, from an email, and the "?" when there is nothing usable.',
      rows: TONES.map((t) => ({ label: cap(t), props: { tone: t }, codeOnly: true })),
      columns: [
        { label: 'Two words', props: { name: 'Budi Santoso' } },
        { label: 'One word', props: { name: 'Rina' } },
        { label: 'Email', props: { name: 'dewi.l@mayar.id' } },
        { label: 'Empty', props: { name: '' } },
      ],
      render,
      code,
    },
  ],
  examples: [
    { id: 'avatar/with-name', title: 'With a name', description: 'Decorative: the name next to it is the label.', codeOnly: true },
    {
      id: 'avatar/with-image',
      title: 'With an image',
      description: 'The initials show while the image loads and when it fails. A delay stops a flash on a fast load.',
      codeOnly: true,
    },
    { id: 'avatar/member-list', title: 'Member list', description: 'Neutral for an inactive member; an email when there is no name.', codeOnly: true },
  ],
  props: [
    { name: 'size', type: '24 | 28 | 32 | 36 | 40 | 48 | 56', default: '32', description: 'Diameter in px. Sets the type step.' },
    { name: 'tone', type: '"primary" | "tint" | "neutral"', default: '"primary"', description: 'Fill and text colour of the initials.' },
    { name: 'aria-hidden', type: 'boolean', default: 'true', description: 'Pass false with role="img" and aria-label when it stands alone.' },
    { name: 'AvatarImage', type: 'Avatar.Image props', description: 'src and alt. Hidden until it loads.' },
    { name: 'AvatarFallback name', type: 'string | null', description: 'A name or email. Its initials show when there are no children.' },
    { name: 'AvatarFallback delay', type: 'number', default: '0', description: 'Ms to wait before the fallback shows.' },
    { name: 'getInitials', type: '(nameOrEmail) => string', description: 'The initials rule, for use outside the avatar.' },
  ],
  guidelines: {
    do: [
      'Put the name next to the avatar. The avatar is decoration.',
      'Pass the name, else the email: name || email.',
      'Use neutral for inactive members and holder cells, tint in the admin console.',
    ],
    dont: ['Do not show a broken image icon. Let the fallback show.', 'Do not use more than two letters.'],
  },
  notes: [
    'Code-only: Avatar has no specimen on the Wonder Design System page. The Dashboard page uses avatars in "Tim"; values come from Avatar.svelte.',
    'The app avatar is initials only. This port adds AvatarImage through Base UI Avatar; the initials stay as the fallback.',
    'The app takes name and email props on the avatar; here they go to AvatarFallback as one name prop (pass name || email).',
  ],
}
