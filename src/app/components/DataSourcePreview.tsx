// DataSourcePreview stub
import React from 'react'

interface DataSourcePreviewProps {
  config?: Record<string, any>
  className?: string
}

export const DataSourcePreview: React.FC<DataSourcePreviewProps> = ({ config, className }) => {
  return (
    <div className={className}>
      <p>Data Source Preview</p>
    </div>
  )
}
