'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export interface GalleryItem {
  common: string
  binomial: string
  photo: {
    url: string
    text: string
    pos?: string
    by: string
  }
}

interface CircularGalleryProps {
  items: GalleryItem[]
  /** Raio base desktop (px). Mobile escala automaticamente. */
  radius?: number
  header?: ReactNode
}

/**
 * Galeria circular HORIZONTAL (eixo Y): scroll desliza esquerda ↔ direita.
 * Cards grandes e screenshots em object-contain para máxima legibilidade.
 */
export function CircularGallery({
  items,
  radius: radiusProp = 420,
  header,
}: CircularGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(radiusProp)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setRadius(Math.min(radiusProp, 280))
      else if (w < 1024) setRadius(Math.min(radiusProp, 360))
      else setRadius(radiusProp)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [radiusProp])

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  const rotateY = useTransform(scrollYProgress, [0, 1], [0, -360])
  const n = Math.max(items.length, 1)
  const step = 360 / n

  return (
    <div
      ref={trackRef}
      className="relative w-full"
      style={{ height: `${Math.max(n * 50, 260)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-surface-container-low">
        {header && (
          <div className="absolute top-16 sm:top-20 left-0 right-0 z-30 px-4 text-center pointer-events-none">
            {header}
          </div>
        )}

        <div
          className="relative w-full flex-1 flex items-center justify-center mt-6"
          style={{
            perspective: '1600px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <motion.div
            className="relative w-0 h-0 will-change-transform"
            style={{
              rotateY,
              transformStyle: 'preserve-3d',
            }}
          >
            {items.map((item, i) => {
              const angle = step * i
              return (
                <div
                  key={`${item.common}-${i}`}
                  className="absolute left-0 top-0"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  }}
                >
                  <article
                    className="w-[min(78vw,340px)] sm:w-[360px] md:w-[400px] -translate-x-1/2 -translate-y-1/2
                      rounded-2xl overflow-hidden border-2 border-white/80 bg-white
                      shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Screenshot grande e legível */}
                    <div className="relative w-full h-[200px] sm:h-[230px] md:h-[250px] bg-[#eef2ef] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.photo.url}
                        alt={item.photo.text}
                        className="absolute inset-0 w-full h-full object-contain object-top p-1"
                        loading="eager"
                        draggable={false}
                      />
                    </div>
                    <div className="px-4 py-3 text-left border-t border-outline-variant/30 bg-white">
                      <p className="text-base font-bold text-on-surface leading-tight">
                        {item.common}
                      </p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        {item.binomial}
                      </p>
                    </div>
                  </article>
                </div>
              )
            })}
          </motion.div>
        </div>

        <p className="absolute bottom-6 left-0 right-0 text-center text-sm font-medium text-on-surface-variant z-30">
          Role para deslizar as telas →
        </p>
      </div>
    </div>
  )
}
