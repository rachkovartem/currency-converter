'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  height?: string
}

export function BottomSheet({ open, onClose, children, height = '78%' }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 75,
              background: 'rgba(0,0,0,0.35)',
            }}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 80,
              height,
              background: 'var(--cc-sheet-bg)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              border: '0.5px solid var(--cc-card-border)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
              <div
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 3,
                  background: 'var(--cc-text-subtle)',
                  opacity: 0.5,
                }}
              />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
