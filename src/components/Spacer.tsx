import { memo } from 'react'

export const Spacer = memo(
  ({ height = 0, width = 0 }:{ height?:number, width?:number }) => (
    <div style={{ height, width }} />
  )
);
