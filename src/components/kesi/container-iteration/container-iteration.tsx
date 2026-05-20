import { ReactNode } from 'react'
import { IterationContext } from '@airiot/client'

// Props interface
export interface IterationProps {
  children: ReactNode
  iterationList: any[]
}

// Iteration Container Component
export function Iteration({
  children,
  iterationList = [],
}: IterationProps) {
  return (
    <>
      {iterationList.map((item, index) => (
        <IterationContext.Provider key={index} value={{ value: item, index } as any}>
          {children}
        </IterationContext.Provider>
      ))}
    </>
  )
}
