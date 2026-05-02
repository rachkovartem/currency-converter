'use client'

import { Plus } from 'lucide-react'
import { useConverterStore } from '@/store/converter-store'

export function AddCurrencyButton() {
  const openPicker = useConverterStore(s => s.openPicker)

  return (
    <button
      data-testid="add-currency-btn"
      onClick={openPicker}
      style={{
        marginTop: 12,
        width: '100%',
        border: '1.5px dashed var(--cc-card-border)',
        background: 'transparent',
        cursor: 'pointer',
        padding: '14px',
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        color: 'var(--cc-text-muted)',
        fontFamily: 'inherit',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <Plus size={16} />
      Add Currency
    </button>
  )
}
