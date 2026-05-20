import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { BaseFormFieldProps } from '@/lib/base-form-props'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MapPin, Edit, Search } from 'lucide-react'
import isEmpty from 'lodash/isEmpty'
import { GisMapCore, useMap } from '@/components/kesi/gis-map-core/gis-map-core'
import Overlay from 'ol/Overlay'
import { fromLonLat, toLonLat } from 'ol/proj'

const AMAP_KEY = 'f1430b13cf18a4cf75ca41a7bb742874'

export interface FormMapProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  value?: {
    name?: string
    lng?: number
    lat?: number
  }
  onChange?: (value: { name?: string; lng: number; lat: number } | null) => void
  placeholder?: string
  lngLat?: boolean
  positionName?: boolean
  canEdit?: boolean
  canHand?: boolean
  defaultVal?: { name?: string; lng: number; lat: number }
  showType?: 'map' | 'modal'
  disabled?: boolean
}

interface MapPickerLayerProps {
  coordinates: [number, number] | null
  onMapClick: (lng: number, lat: number) => void
  disabled?: boolean
}

const MapPickerLayer: React.FC<MapPickerLayerProps> = ({ coordinates, onMapClick, disabled = false }) => {
  const map = useMap()
  const markerRef = React.useRef<HTMLDivElement>(null)
  const overlayRef = React.useRef<Overlay | null>(null)
  const disabledRef = React.useRef(disabled)
  disabledRef.current = disabled

  React.useEffect(() => {
    if (!map || !markerRef.current) return

    const overlay = new Overlay({
      element: markerRef.current,
      positioning: 'bottom-center',
      offset: [0, -4],
      stopEvent: false,
    })
    map.addOverlay(overlay)
    overlayRef.current = overlay

    const handleMapClick = (evt: any) => {
      if (disabledRef.current) return
      const [lng, lat] = toLonLat(evt.coordinate)
      if (!lng || !lat || isNaN(lng) || isNaN(lat)) return
      onMapClick(lng, lat)
    }
    map.on('singleclick', handleMapClick)

    return () => {
      map.un('singleclick', handleMapClick)
      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current)
        overlayRef.current = null
      }
    }
  }, [map])

  React.useEffect(() => {
    if (!overlayRef.current) return
    if (coordinates && coordinates[0] != null && coordinates[1] != null) {
      overlayRef.current.setPosition(fromLonLat(coordinates))
    } else {
      overlayRef.current.setPosition(undefined)
    }
  }, [coordinates])

  return (
    <div ref={markerRef} className="pointer-events-none">
      <MapPin className="h-8 w-8 drop-shadow-md" style={{ color: '#2bb634' }} />
    </div>
  )
}

// 自定义搜索下拉组件
interface SearchDropdownProps {
  keyword: string
  onSelect: (poi: { name: string; lng: number; lat: number }) => void
  onClose: () => void
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ keyword, onSelect, onClose }) => {
  const [results, setResults] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const timerRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (!keyword.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      fetch(`https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(keyword)}&offset=10`)
        .then(res => res.json())
        .then((data: any) => {
          setResults(data.pois || [])
          setLoading(false)
        })
        .catch(() => {
          setResults([])
          setLoading(false)
        })
    }, 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [keyword])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!keyword.trim()) return null

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      {loading && (
        <div className="px-3 py-2 text-sm text-muted-foreground">搜索中...</div>
      )}
      {!loading && results.length === 0 && (
        <div className="px-3 py-2 text-sm text-muted-foreground">无结果</div>
      )}
      {results.map((poi, i) => {
        const [lng, lat] = (poi.location || '').split(',').map(Number)
        return (
          <div
            key={`${poi.id}-${i}`}
            className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
            onMouseDown={(e) => {
              e.preventDefault()
              onSelect({ name: poi.name, lng, lat })
            }}
          >
            <div className="text-sm font-medium truncate">{poi.name}</div>
            <div className="text-xs text-muted-foreground truncate">{poi.address || poi.pname}</div>
          </div>
        )
      })}
    </div>
  )
}

const FormMap = React.forwardRef<HTMLInputElement, FormMapProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      placeholder = '请选择位置',
      lngLat = true,
      positionName = true,
      canEdit = true,
      canHand = true,
      defaultVal,
      showType = 'modal',
      disabled = false
    } = props

    const getInit = (v: any) => {
      return isEmpty(v) ? {} : {
        center: [v.lng, v.lat],
        data: [{ coordinates: [v.lng, v.lat], type: 'Point' }]
      }
    }

    const getShowName = (v: { name?: string; lng?: number; lat?: number } | null) => {
      let result = ''
      if (v) {
        result = (positionName ? (v.name || '') : '') + (lngLat ? `(${v.lng},${v.lat})` : '')
      }
      return result
    }

    const getLocation = (callBack: (val: { lat: number; lng: number }) => void) => {
      navigator.geolocation.getCurrentPosition(
        (position) => callBack({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => { }
      )
    }

    const [visible, setVisible] = React.useState(false)
    const [displayValue, setDisplayValue] = React.useState(value ? getShowName(value) : '')
    const [inputValue, setInputValue] = React.useState(getInit(value))
    const [point, setPoint] = React.useState(value || null)
    const [handVisible, setHandVisible] = React.useState(false)

    const [handForm, setHandForm] = React.useState<{ name?: string; lng?: number; lat?: number }>(value || {})

    // 搜索状态
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [searchInputValue, setSearchInputValue] = React.useState('')

    const markerCoordinates = React.useMemo<[number, number] | null>(() => {
      const coords = inputValue?.data?.[0]?.coordinates
      if (coords && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        return [coords[0], coords[1]]
      }
      return null
    }, [inputValue])

    const [flyCenter, setFlyCenter] = React.useState<[number, number] | null>(null)

    const initialCenter = React.useMemo<[number, number]>(() => {
      if (value?.lng && value?.lat) return [value.lng, value.lat]
      if (defaultVal?.lng && defaultVal?.lat) return [defaultVal.lng, defaultVal.lat]
      return [116.391, 39.9042]
    }, [])

    const mapCenter = React.useMemo<[number, number]>(() => {
      if (flyCenter) return flyCenter
      return initialCenter
    }, [flyCenter, initialCenter])

    const showTypeRef = React.useRef(showType)
    showTypeRef.current = showType
    const onChangeRef = React.useRef(onChange)
    onChangeRef.current = onChange

    const handleMapClick = React.useCallback((lng: number, lat: number) => {
      const newVal = {
        center: [lng, lat],
        data: [{ coordinates: [lng, lat], type: 'Point' }]
      }
      setInputValue(newVal)
      const [clng, clat] = newVal.data[0].coordinates
      if (clng && clat) {
        fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&&location=${clng},${clat}`)
          .then(response => response.status === 200 ? response.json() : null)
          .then((data: any) => {
            const p = {
              name: data?.regeocode?.formatted_address || '',
              lng: clng,
              lat: clat
            }
            setPoint(p)
            setSearchInputValue(p.name || '')
            if (showTypeRef.current === 'map') {
              setDisplayValue(getShowName(p))
              onChangeRef.current?.(p)
            }
          })
          .catch(() => setPoint({ lng: clng, lat: clat }))
      }
    }, [])

    const handleSearchSelect = React.useCallback((poi: { name: string; lng: number; lat: number }) => {
      const datapoi = { name: poi.name, lng: poi.lng, lat: poi.lat }
      setInputValue(getInit(datapoi))
      setPoint(datapoi)
      setFlyCenter([poi.lng, poi.lat])
      setSearchInputValue(poi.name)
      setShowDropdown(false)
      setSearchKeyword('')
    }, [])

    // 默认值生效
    React.useEffect(() => {
      if (!displayValue && defaultVal && onChange) {
        onChange(defaultVal)
        setDisplayValue(getShowName(defaultVal))
        setInputValue(getInit(defaultVal))
      } else if (!displayValue && onChange) {
        getLocation((val) => setInputValue(getInit(val)))
      }
    }, [])

    // 同步 point.name 到搜索框
    React.useEffect(() => {
      if (point?.name && !searchInputValue) {
        setSearchInputValue(point.name)
      }
    }, [point?.name])

    const handleOk = () => {
      if (point && point.lng !== undefined && point.lat !== undefined) {
        const p: { name?: string; lng: number; lat: number } = { name: point.name, lng: point.lng, lat: point.lat }
        setDisplayValue(getShowName(p))
        onChange?.(p)
      }
      setVisible(false)
    }

    const handleHandSubmit = () => {
      if (handForm.lng && handForm.lat) {
        const newPoint = {
          name: handForm.name,
          lng: Number(handForm.lng),
          lat: Number(handForm.lat)
        } as { name?: string; lng: number; lat: number }
        setDisplayValue(getShowName(newPoint))
        onChange?.(newPoint)
        setHandVisible(false)
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (!v) {
        onChange?.(null)
        setDisplayValue('')
      }
    }

    const openModal = () => {
      if (!canEdit || disabled) return
      setVisible(true)
    }

    // 搜索框 JSX
    const searchInput = (
      <div className="relative">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            disabled={disabled}
            className="w-64"
            placeholder="输入位置进行搜索"
            value={searchInputValue}
            onChange={(e) => {
              setSearchInputValue(e.target.value)
              setSearchKeyword(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => searchInputValue && setShowDropdown(true)}
          />
        </div>
        {showDropdown && (
          <SearchDropdown
            keyword={searchKeyword}
            onSelect={handleSearchSelect}
            onClose={() => setShowDropdown(false)}
          />
        )}
      </div>
    )

    // 经纬度输入 JSX
    const lngLatInputs = (
      <>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium whitespace-nowrap">经度：</Label>
          <Input
            type="number"
            disabled={disabled}
            className="w-46"
            value={point?.lng ?? ''}
            onChange={(e) => {
              const lng = Number(e.target.value)
              if (!isNaN(lng)) {
                const p = { ...point, lng }
                setPoint(p)
                setInputValue({ center: [lng, p.lat || 0], data: [{ coordinates: [lng, p.lat || 0], type: 'Point' }] })
              }
            }}
            placeholder="经度"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium whitespace-nowrap">纬度：</Label>
          <Input
            type="number"
            disabled={disabled}
            className="w-46"
            value={point?.lat ?? ''}
            onChange={(e) => {
              const lat = Number(e.target.value)
              if (!isNaN(lat)) {
                const p = { ...point, lat }
                setPoint(p)
                setInputValue({ center: [p.lng || 0, lat], data: [{ coordinates: [p.lng || 0, lat], type: 'Point' }] })
              }
            }}
            placeholder="纬度"
          />
        </div>
      </>
    )

    // 地图 JSX
    const mapElement = (
      <GisMapCore
        width="100%"
        height={showType === 'map' ? 400 : 500}
        viewOptions={{
          position: { center: mapCenter, pick: false },
          zoom: 14,
          maxZoom: 18,
          minZoom: 3,
          animation: true,
          duration: 800,
        }}
        zoomOption={{ show: true }}
        scaleLine={{ show: false }}
      >
        <MapPickerLayer
          coordinates={markerCoordinates}
          onMapClick={handleMapClick}
          disabled={disabled}
        />
      </GisMapCore>
    )

    if (showType === 'map') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            {searchInput}
            {lngLatInputs}
          </div>
          {mapElement}
        </div>
      )
    }

    return (
      <>
        <div className="flex gap-2">
          <Input
            value={displayValue}
            ref={ref}
            onChange={handleChange}
            placeholder={placeholder}
            className="h-10 px-3 py-2"
          />
          {canEdit && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={openModal}>
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>地图选点</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {canHand && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={() => setHandVisible(true)}>
                        <Edit className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>手动输入</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
        </div>

        <Dialog open={visible} onOpenChange={setVisible}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>地图选点</DialogTitle>
            </DialogHeader>
            <div>
              <div className="mb-4 flex items-center gap-4">
                {searchInput}
                {lngLatInputs}
              </div>
              {mapElement}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVisible(false)}>取消</Button>
              <Button type="button" onClick={handleOk}>确定</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={handVisible} onOpenChange={setHandVisible}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>手动输入</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hand-name">地址</Label>
                <Input
                  id="hand-name"
                  value={handForm.name || ''}
                  onChange={(e) => setHandForm({ ...handForm, name: e.target.value })}
                  placeholder="请输入地址"
                />
              </div>
              {lngLat && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hand-lng">经度 *</Label>
                    <Input
                      id="hand-lng"
                      type="number"
                      value={handForm.lng || ''}
                      onChange={(e) => setHandForm({ ...handForm, lng: e.target.value as any })}
                      placeholder="请输入经度"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hand-lat">纬度 *</Label>
                    <Input
                      id="hand-lat"
                      type="number"
                      value={handForm.lat || ''}
                      onChange={(e) => setHandForm({ ...handForm, lat: e.target.value as any })}
                      placeholder="请输入纬度"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHandVisible(false)}>取消</Button>
              <Button type="button" onClick={handleHandSubmit} disabled={!handForm.lng || !handForm.lat}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

FormMap.displayName = 'FormMap'

export { FormMap }
