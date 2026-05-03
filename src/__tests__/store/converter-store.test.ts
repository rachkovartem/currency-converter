import { describe, it, expect, beforeEach } from 'vitest'
import { useConverterStore, createConverterStore, ConverterStoreContext } from '@/store/converter-store'

// Reset store before each test
beforeEach(() => {
  useConverterStore.setState({
    rows: ['USD', 'EUR', 'GBP', 'JPY'],
    activeCode: 'USD',
    activeValue: '100',
    favorites: ['EUR'],
    recents: [],
    layout: 'list',
    density: 'compact',
    showFlags: true,
    sparklines: true,
    pickerOpen: false,
    historyPair: null,
    showRecents: false,
    settingsOpen: false,
  })
})

describe('initial state', () => {
  it('has 4 rows: USD, EUR, GBP, JPY', () => {
    const { rows } = useConverterStore.getState()
    expect(rows).toEqual(['USD', 'EUR', 'GBP', 'JPY'])
  })

  it('initial density is compact', () => {
    const { density } = useConverterStore.getState()
    expect(density).toBe('compact')
  })

  it('_hasHydrated does not exist on state', () => {
    const state = useConverterStore.getState()
    expect('_hasHydrated' in state).toBe(false)
  })

  it('updatedAt is a number (not Date)', () => {
    const { updatedAt } = useConverterStore.getState()
    expect(typeof updatedAt).toBe('number')
  })
})

describe('addCurrency()', () => {
  it('appends new currency code', () => {
    useConverterStore.getState().addCurrency('CHF')
    expect(useConverterStore.getState().rows).toContain('CHF')
  })

  it('does not add duplicate', () => {
    useConverterStore.getState().addCurrency('USD')
    const { rows } = useConverterStore.getState()
    expect(rows.filter(c => c === 'USD')).toHaveLength(1)
  })
})

describe('removeCurrency()', () => {
  it('removes the currency', () => {
    useConverterStore.getState().removeCurrency('EUR')
    expect(useConverterStore.getState().rows).not.toContain('EUR')
  })

  it('no-op when only 1 row remains', () => {
    useConverterStore.setState({ rows: ['USD'] })
    useConverterStore.getState().removeCurrency('USD')
    expect(useConverterStore.getState().rows).toEqual(['USD'])
  })

  it('switches active code when active row is removed', () => {
    useConverterStore.setState({ activeCode: 'EUR' })
    useConverterStore.getState().removeCurrency('EUR')
    const { activeCode, rows } = useConverterStore.getState()
    expect(activeCode).toBe(rows[0])
    expect(activeCode).not.toBe('EUR')
  })
})

describe('toggleFavorite()', () => {
  it('adds then removes favorite', () => {
    useConverterStore.setState({ favorites: [] })
    useConverterStore.getState().toggleFavorite('USD')
    expect(useConverterStore.getState().favorites).toContain('USD')
    useConverterStore.getState().toggleFavorite('USD')
    expect(useConverterStore.getState().favorites).not.toContain('USD')
  })
})

describe('setLayout()', () => {
  it('toggles between list and grid', () => {
    useConverterStore.getState().setLayout('grid')
    expect(useConverterStore.getState().layout).toBe('grid')
    useConverterStore.getState().setLayout('list')
    expect(useConverterStore.getState().layout).toBe('list')
  })
})

describe('pickRecent()', () => {
  it('adds missing currencies and sets active code and value', () => {
    useConverterStore.setState({ rows: ['USD'] })
    useConverterStore.getState().pickRecent({ from: 'GBP', to: 'JPY', amount: 50, ts: Date.now() })
    const { rows, activeCode, activeValue } = useConverterStore.getState()
    expect(rows).toContain('GBP')
    expect(rows).toContain('JPY')
    expect(activeCode).toBe('GBP')
    expect(activeValue).toBe('50')
  })
})

describe('setDensity()', () => {
  it("setDensity('comfortable') changes density", () => {
    useConverterStore.getState().setDensity('comfortable')
    expect(useConverterStore.getState().density).toBe('comfortable')
  })
})

describe('setShowFlags()', () => {
  it('setShowFlags(false) changes showFlags to false', () => {
    useConverterStore.getState().setShowFlags(false)
    expect(useConverterStore.getState().showFlags).toBe(false)
  })

  it('setShowFlags(true) changes showFlags to true', () => {
    useConverterStore.setState({ showFlags: false })
    useConverterStore.getState().setShowFlags(true)
    expect(useConverterStore.getState().showFlags).toBe(true)
  })
})

describe('setSparklines()', () => {
  it('setSparklines(false) changes sparklines to false', () => {
    useConverterStore.getState().setSparklines(false)
    expect(useConverterStore.getState().sparklines).toBe(false)
  })
})

describe('openSettings() / closeSettings()', () => {
  it('openSettings sets settingsOpen to true', () => {
    useConverterStore.getState().openSettings()
    expect(useConverterStore.getState().settingsOpen).toBe(true)
  })

  it('closeSettings sets settingsOpen to false', () => {
    useConverterStore.setState({ settingsOpen: true })
    useConverterStore.getState().closeSettings()
    expect(useConverterStore.getState().settingsOpen).toBe(false)
  })
})

describe('createConverterStore() factory', () => {
  it('creates an independent store instance', () => {
    const store = createConverterStore()
    // The factory store is independent from _defaultStore
    store.setState({ activeCode: 'GBP' })
    // _defaultStore was reset to USD in beforeEach
    expect(useConverterStore.getState().activeCode).toBe('USD')
    expect(store.getState().activeCode).toBe('GBP')
  })

  it('applies initialState overrides over defaults', () => {
    const store = createConverterStore({ rows: ['CHF', 'NOK'], activeCode: 'CHF', layout: 'grid' })
    const state = store.getState()
    expect(state.rows).toEqual(['CHF', 'NOK'])
    expect(state.activeCode).toBe('CHF')
    expect(state.layout).toBe('grid')
    // Defaults that were not overridden remain
    expect(state.activeValue).toBe('100')
  })

  it('works with empty initialState', () => {
    const store = createConverterStore()
    expect(store.getState().rows).toEqual(['USD', 'EUR', 'GBP', 'JPY'])
  })

  it('works with partial initialState', () => {
    const store = createConverterStore({ activeValue: '999' })
    expect(store.getState().activeValue).toBe('999')
    expect(store.getState().rows).toEqual(['USD', 'EUR', 'GBP', 'JPY'])
  })
})

describe('ConverterStoreContext', () => {
  it('is exported and not null', () => {
    expect(ConverterStoreContext).toBeTruthy()
  })
})

describe('useConverterStore static methods (backward-compat)', () => {
  it('has setState', () => {
    expect(typeof useConverterStore.setState).toBe('function')
  })

  it('has getState', () => {
    expect(typeof useConverterStore.getState).toBe('function')
  })

  it('has subscribe', () => {
    expect(typeof useConverterStore.subscribe).toBe('function')
  })
})

describe('updateRates()', () => {
  it('updates rates and sets updatedAt as a number', () => {
    const before = useConverterStore.getState().updatedAt
    const newRates: Record<string, number> = { USD: 1, EUR: 0.95 }
    useConverterStore.getState().updateRates(newRates)
    const { rates, updatedAt } = useConverterStore.getState()
    expect(rates).toEqual(newRates)
    expect(typeof updatedAt).toBe('number')
    expect(updatedAt).toBeGreaterThanOrEqual(before)
  })
})

describe('openPicker() / closePicker()', () => {
  it('openPicker sets pickerOpen to true', () => {
    useConverterStore.getState().openPicker()
    expect(useConverterStore.getState().pickerOpen).toBe(true)
  })

  it('closePicker sets pickerOpen to false', () => {
    useConverterStore.setState({ pickerOpen: true })
    useConverterStore.getState().closePicker()
    expect(useConverterStore.getState().pickerOpen).toBe(false)
  })
})
