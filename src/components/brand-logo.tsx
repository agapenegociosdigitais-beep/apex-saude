import Image from 'next/image'
import Link from 'next/link'

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'hero'

const SIZES: Record<Size, { w: number; h: number; className: string }> = {
  sm: { w: 120, h: 40, className: 'h-8 w-auto' },
  md: { w: 160, h: 52, className: 'h-10 w-auto' },
  lg: { w: 200, h: 64, className: 'h-14 w-auto' },
  xl: { w: 280, h: 90, className: 'h-20 w-auto max-w-[240px]' },
  hero: { w: 360, h: 120, className: 'h-28 w-auto max-w-[280px] sm:h-32 sm:max-w-[320px]' },
}

interface BrandLogoProps {
  size?: Size
  href?: string | null
  className?: string
  priority?: boolean
  /** Fundo escuro: mantém ouro (sem invert). Transparente oficial. */
  onDark?: boolean
}

/** Logo oficial ÁPEX (PNG transparente dourada). */
export function BrandLogo({
  size = 'md',
  href = '/',
  className = '',
  priority = false,
  onDark = false,
}: BrandLogoProps) {
  const s = SIZES[size]
  const img = (
    <Image
      src="/brand/logo-oficial.png"
      alt="ÁPEX Saúde"
      width={s.w}
      height={s.h}
      priority={priority}
      className={`${s.className} object-contain ${onDark ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]' : ''} ${className}`}
    />
  )

  if (href === null) return img
  return (
    <Link href={href} className="inline-flex items-center shrink-0" aria-label="ÁPEX Saúde — início">
      {img}
    </Link>
  )
}
