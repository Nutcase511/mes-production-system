import React, { useEffect, useState } from 'react'
import { useModelList, useModelGetItems } from '@airiot/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'

export type AggregateType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'group'

export interface AggregateField {
  name: string
  label: string
  type: 'number' | 'string' | 'date'
  aggregate?: AggregateType[]
}

export interface AggregateResult {
  field: string
  label: string
  type: AggregateType
  value: number | string
  formatted: string
  change?: number
  changeType?: 'up' | 'down' | 'neutral'
}

export interface GroupAggregateResult {
  group: string
  groupLabel: string
  aggregates: {
    [key: string]: AggregateResult
  }
  count: number
}

interface ViewDataAggregateProps {
  modelId?: string
  fields?: AggregateField[]
  aggregateTypes?: AggregateType[]
  groupBy?: string
  showChange?: boolean
  showChart?: boolean
  layout?: 'grid' | 'list' | 'compact'
  refreshInterval?: number
  className?: string
  onRefresh?: () => void
  onFieldClick?: (field: string, value: any) => void
}

const ViewDataTableAggregate: React.FC<ViewDataAggregateProps> = ({
  modelId,
  fields = [],
  aggregateTypes = ['count', 'sum', 'avg'],
  groupBy,
  layout = 'grid',
  refreshInterval = 0,
  className = '',
  onFieldClick,
}) => {

  const { getItems } = useModelGetItems()

  const [results, setResults] = useState<AggregateResult[]>([])
  const [groupResults, setGroupResults] = useState<GroupAggregateResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAggregates, setSelectedAggregates] = useState<AggregateType[]>(aggregateTypes)

  useEffect(() => {
    loadAggregates()
  }, [modelId, fields, selectedAggregates, groupBy])

  useEffect(() => {
    if (refreshInterval > 0) {
      const timer = setInterval(loadAggregates, refreshInterval)
      return () => clearInterval(timer)
    }
  }, [refreshInterval])

  const loadAggregates = async () => {
    setLoading(true)
    try {
      const data = await getItems({
        modelId,
        limit: 1000
      })

      if (groupBy) {
        calculateGroupAggregates(data?.items || [])
      } else {
        calculateAggregates(data?.items || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const calculateAggregates = (data: any[]) => {
    const newResults: AggregateResult[] = []

    fields.forEach((field) => {
      if (field.aggregate) {
        field.aggregate.forEach((type) => {
          if (selectedAggregates.includes(type)) {
            const result = calculateAggregate(data, field, type)
            if (result) {
              newResults.push(result)
            }
          }
        })
      } else {
        selectedAggregates.forEach((type) => {
          if (type !== 'group') {
            const result = calculateAggregate(data, field, type)
            if (result) {
              newResults.push(result)
            }
          }
        })
      }
    })

    setResults(newResults)
  }

  const calculateAggregate = (
    data: any[],
    field: AggregateField,
    type: AggregateType
  ): AggregateResult | null => {
    const values = data.map((item) => item[field.name]).filter((v) => v != null)

    if (values.length === 0) return null

    let value: number
    let formatted: string

    switch (type) {
      case 'count':
        value = values.length
        formatted = value.toLocaleString()
        break
      case 'sum':
        if (field.type !== 'number') return null
        value = values.reduce((sum, v) => sum + Number(v), 0)
        formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        break
      case 'avg':
        if (field.type !== 'number') return null
        value = values.reduce((sum, v) => sum + Number(v), 0) / values.length
        formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        break
      case 'min':
        if (field.type !== 'number') return null
        value = Math.min(...values.map((v) => Number(v)))
        formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        break
      case 'max':
        if (field.type !== 'number') return null
        value = Math.max(...values.map((v) => Number(v)))
        formatted = value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        break
      default:
        return null
    }

    return {
      field: field.name,
      label: field.label,
      type,
      value,
      formatted: `${formatted}`,
    }
  }

  const calculateGroupAggregates = (data: any[]) => {
    const groups = new Map<string, any[]>()

    data.forEach((item) => {
      const groupValue = groupBy ? item[groupBy] : '未分组'
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(item)
    })

    const newGroupResults: GroupAggregateResult[] = []

    groups.forEach((groupData, groupValue) => {
      const aggregates: { [key: string]: AggregateResult } = {}

      fields.forEach((field) => {
        selectedAggregates.forEach((type) => {
          if (type !== 'group') {
            const result = calculateAggregate(groupData, field, type)
            if (result) {
              aggregates[`${field.name}_${type}`] = result
            }
          }
        })
      })

      newGroupResults.push({
        group: groupValue,
        groupLabel: groupValue,
        aggregates,
        count: groupData.length,
      })
    })

    newGroupResults.sort((a, b) => b.count - a.count)
    setGroupResults(newGroupResults)
  }

  const getAggregateIcon = (type: AggregateType) => {
    switch (type) {
      case 'sum':
      case 'avg':
      case 'count':
        return <BarChart3 className="w-4 h-4" />
      case 'min':
        return <TrendingDown className="w-4 h-4" />
      case 'max':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getAggregateLabel = (type: AggregateType) => {
    const labelMap: Record<AggregateType, string> = {
      count: '计数',
      sum: '总和',
      avg: '平均',
      min: '最小值',
      max: '最大值',
      group: '分组'
    }
    return labelMap[type] || type
  }

  const renderAggregateCard = (result: AggregateResult) => {
    return (
      <Card
        key={`${result.field}_${result.type}`}
        className={onFieldClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        onClick={() => onFieldClick?.(result.field, result.value)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>{result.label}</span>
            <Badge variant="outline" className="text-xs">
              {getAggregateLabel(result.type)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{result.formatted}</div>
            {getAggregateIcon(result.type)}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderGroupResult = (groupResult: GroupAggregateResult) => {
    return (
      <Card key={groupResult.group}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>{groupResult.groupLabel}</span>
            <Badge variant="secondary">{groupResult.count} 条</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.values(groupResult.aggregates).slice(0, 3).map((agg) => (
              <div key={`${agg.field}_${agg.type}`} className="flex justify-between text-sm">
                <span className="text-slate-600">{agg.label} ({getAggregateLabel(agg.type)})</span>
                <span className="font-medium">{agg.formatted}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (groupBy && groupResults.length > 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">数据分组统计</h3>
          <div className="flex items-center gap-2">
            <Select value={selectedAggregates.join(',')} onValueChange={(v) => setSelectedAggregates(v.split(',') as AggregateType[])}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="选择聚合类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count">计数</SelectItem>
                <SelectItem value="sum">总和</SelectItem>
                <SelectItem value="avg">平均</SelectItem>
                <SelectItem value="min,max">最小/最大</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadAggregates} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupResults.map((groupResult) => renderGroupResult(groupResult))}
        </div>
      </div>
    )
  }

  if (layout === 'list') {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">数据统计</h3>
          <Button variant="outline" size="icon" onClick={loadAggregates} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="space-y-3">
          {results.map((result) => (
            <Card key={`${result.field}_${result.type}`}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAggregateIcon(result.type)}
                    <div>
                      <div className="text-sm text-slate-600">{result.label}</div>
                      <div className="text-xs text-slate-500">{getAggregateLabel(result.type)}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold">{result.formatted}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (layout === 'compact') {
    return (
      <div className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">数据统计</h3>
          <Button variant="outline" size="icon" onClick={loadAggregates} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {results.map((result) => (
            <Badge key={`${result.field}_${result.type}`} variant="secondary" className="px-3 py-2">
              <span className="mr-2">{result.label}:</span>
              <span className="font-bold">{result.formatted}</span>
            </Badge>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">数据统计</h3>
        <Button variant="outline" size="icon" onClick={loadAggregates} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result) => renderAggregateCard(result))}
      </div>
    </div>
  )
}

export { ViewDataTableAggregate }
