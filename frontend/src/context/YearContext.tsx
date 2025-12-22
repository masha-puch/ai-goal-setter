import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

interface YearContextType {
  year: number
  setYear: (year: number) => void
}

const YearContext = createContext<YearContextType | undefined>(undefined)

interface YearProviderProps {
  children: ReactNode
}

export function YearProvider({ children }: YearProviderProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYearState] = useState<number>(() => {
    // Try to get from localStorage, default to current year
    const savedYear = localStorage.getItem('selectedYear')
    return savedYear ? parseInt(savedYear, 10) : currentYear
  })

  const setYear = (newYear: number) => {
    setYearState(newYear)
    localStorage.setItem('selectedYear', newYear.toString())
  }

  // Sync with localStorage on mount
  useEffect(() => {
    const savedYear = localStorage.getItem('selectedYear')
    if (savedYear) {
      const parsedYear = parseInt(savedYear, 10)
      if (!isNaN(parsedYear)) {
        setYearState(parsedYear)
      }
    }
  }, [])

  const value = {
    year,
    setYear,
  }

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  )
}

export function useYear() {
  const context = useContext(YearContext)
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider')
  }
  return context
}

