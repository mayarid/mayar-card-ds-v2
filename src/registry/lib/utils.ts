import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/*
 * tailwind-merge must know the custom type scale. Without this it reads `text-body-sm` as a
 * colour and drops it when a `text-ink` class comes later.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display',
            'title-lg',
            'title-md',
            'title-sm',
            'body-lg',
            'body-base',
            'body-sm',
            'caption-lg',
            'caption-sm',
            'overline',
          ],
        },
      ],
      shadow: [{ shadow: ['control', 'raised', 'popover', 'toast', 'card', 'ring', 'dialog', 'drawer', 'combobox'] }],
      rounded: [{ rounded: ['card', 'media', 'panel', 'pill', 'btn'] }],
    },
  },
})

/** Joins class names and resolves Tailwind conflicts (the last class wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
