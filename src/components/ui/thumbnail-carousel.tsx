'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

export interface ThumbnailCarouselItem {
  id: number | string
  url: string
  title: string
}

const DEFAULT_ITEMS: ThumbnailCarouselItem[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=880&h=600&fit=crop',
    title: 'Mountain Summit',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=880&h=600&fit=crop',
    title: 'Alpine Landscape',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=880&h=600&fit=crop',
    title: 'Mountain Range',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=880&h=600&fit=crop',
    title: 'Mountain Wilderness',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=880&h=600&fit=crop',
    title: 'Mountain Trail',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=880&h=600&fit=crop',
    title: 'Rocky Cliffs',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=880&h=600&fit=crop',
    title: 'Forest Path',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=880&h=600&fit=crop',
    title: 'Green Hills',
  },
]

const FULL_WIDTH_PX = 120
const COLLAPSED_WIDTH_PX = 35
const GAP_PX = 2
const MARGIN_PX = 2

interface ThumbnailsProps {
  items: ThumbnailCarouselItem[]
  index: number
  setIndex: (i: number) => void
}

function Thumbnails({ items, index, setIndex }: ThumbnailsProps) {
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!thumbnailsRef.current) return
    let scrollPosition = 0
    for (let i = 0; i < index; i++) {
      scrollPosition += COLLAPSED_WIDTH_PX + GAP_PX
    }
    scrollPosition += MARGIN_PX
    const containerWidth = thumbnailsRef.current.offsetWidth
    const centerOffset = containerWidth / 2 - FULL_WIDTH_PX / 2
    scrollPosition -= centerOffset
    thumbnailsRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
  }, [index])

  return (
    <div
      ref={thumbnailsRef}
      className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex gap-0.5 h-20 pb-2" style={{ width: 'fit-content' }}>
        {items.map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            initial={false}
            animate={i === index ? 'active' : 'inactive'}
            variants={{
              active: {
                width: FULL_WIDTH_PX,
                marginLeft: MARGIN_PX,
                marginRight: MARGIN_PX,
              },
              inactive: {
                width: COLLAPSED_WIDTH_PX,
                marginLeft: 0,
                marginRight: 0,
              },
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative shrink-0 h-full overflow-hidden rounded"
            aria-label={item.title}
            aria-current={i === index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export interface ThumbnailCarouselProps {
  items?: ThumbnailCarouselItem[]
  className?: string
  imageHeight?: string
}

export default function ThumbnailCarousel({
  items = DEFAULT_ITEMS,
  className = '',
  imageHeight = 'h-[400px]',
}: ThumbnailCarouselProps) {
  const [index, setIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  useEffect(() => {
    if (!isDragging && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1
      const targetX = -index * containerWidth
      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })
    }
  }, [index, x, isDragging])

  // Reset if items change length
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - 1)))
  }, [items.length])

  return (
    <div className={`w-full max-w-3xl mx-auto p-4 lg:p-10 ${className}`}>
      <div className="flex flex-col gap-3">
        <div
          className="relative overflow-hidden rounded-lg bg-surface-container"
          ref={containerRef}
        >
          <motion.div
            className="flex"
            drag="x"
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(_e, info) => {
              setIsDragging(false)
              const containerWidth = containerRef.current?.offsetWidth || 1
              const offset = info.offset.x
              const velocity = info.velocity.x

              let newIndex = index
              if (Math.abs(velocity) > 500) {
                newIndex = velocity > 0 ? index - 1 : index + 1
              } else if (Math.abs(offset) > containerWidth * 0.3) {
                newIndex = offset > 0 ? index - 1 : index + 1
              }
              newIndex = Math.max(0, Math.min(items.length - 1, newIndex))
              setIndex(newIndex)
            }}
            style={{ x }}
          >
            {items.map((item) => (
              <div key={item.id} className={`shrink-0 w-full ${imageHeight}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            ))}
          </motion.div>

          <motion.button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-4 text-on-surface top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === 0
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
              }`}
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            disabled={index === items.length - 1}
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            className={`absolute text-on-surface right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === items.length - 1
                  ? 'opacity-40 cursor-not-allowed bg-white'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-70'
              }`}
            aria-label="Próximo"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {index + 1} / {items.length}
          </div>
        </div>

        <Thumbnails items={items} index={index} setIndex={setIndex} />
      </div>
    </div>
  )
}
