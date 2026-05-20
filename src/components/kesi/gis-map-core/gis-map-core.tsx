import * as React from "react"
import { cn } from "@/lib/utils"
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { fromLonLat, transformExtent } from 'ol/proj'
import { Zoom, ScaleLine, defaults as defaultControls } from 'ol/control'
import 'ol/ol.css'

// Map Context 用于向子组件传递 map 实例
export interface MapContextValue {
  map: Map | null
}

export const MapContext = React.createContext<MapContextValue>({ map: null })

// Hook 用于获取 map 实例
export const useMap = () => {
  const context = React.useContext(MapContext)
  return context.map
}

export interface ViewOptions {
  position?: {
    center?: [number, number]
    pick?: boolean
  }
  resetCenter?: {
    tableData?: Array<{ id: string; _table: string }>
  }
  zoom?: number
  maxZoom?: number
  minZoom?: number
  rotation?: number
  recordRotationActive?: boolean
  resolution?: number
  animation?: boolean
  duration?: number
}

export interface ZoomOption {
  show?: boolean
  zoomInTipLabel?: string
  zoomOutTipLabel?: string
  minZoom?: number
  maxZoom?: number
}

export interface ScaleLineOption {
  show?: boolean
  minWidth?: number
  units?: 'metric' | 'us' | 'nautical' | 'imperial' | 'degrees'
  steps?: number
  bar?: boolean
  text?: boolean
}

export interface ExtentOption {
  westLon?: number
  southLat?: number
  eastLon?: number
  northLat?: number
}

export interface GisMapCoreProps {
  /**
   * 视图配置
   */
  viewOptions?: ViewOptions
  /**
   * 缩放控件配置
   */
  zoomOption?: ZoomOption
  /**
   * 比例尺配置
   */
  scaleLine?: ScaleLineOption
  /**
   * 拖拽边界范围
   */
  extentOption?: ExtentOption
  /**
   * 宽度
   */
  width?: number | string
  /**
   * 高度
   */
  height?: number | string
  /**
   * CSS 类名
   */
  className?: string
  /**
   * 子元素
   */
  children?: React.ReactNode
}

// 默认中心点坐标 (北京)
const DEFAULT_CENTER: [number, number] = [116.391, 39.9042]

// 高德地图瓦片图层
const createTileLayer = () => {
  return new TileLayer({
    source: new XYZ({
      url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}',
      crossOrigin: 'anonymous',
    }),
  })
}

const GisMapCore = React.forwardRef<HTMLDivElement, GisMapCoreProps>(
  (
    {
      className,
      viewOptions = {
        position: {
          center: DEFAULT_CENTER,
          pick: false
        },
        zoom: 10,
        maxZoom: 18,
        minZoom: 3,
        rotation: 0,
        recordRotationActive: false,
        animation: true,
        duration: 1000
      },
      zoomOption = {
        show: true,
        zoomInTipLabel: '放大',
        zoomOutTipLabel: '缩小',
        minZoom: 3,
        maxZoom: 18
      },
      scaleLine = {
        show: true,
        bar: false,
        text: false
      },
      extentOption,
      width = '100%',
      height = '100%',
      children,
      ...props
    },
    ref
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const mapRef = React.useRef<HTMLDivElement>(null)
    const [mapInstance, setMapInstance] = React.useState<Map | null>(null)
    const [mapReady, setMapReady] = React.useState(false)

    // 合并 ref
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement)

    // 获取配置值
    const center = viewOptions?.position?.center || DEFAULT_CENTER
    const zoom = viewOptions?.zoom ?? 10
    const maxZoom = viewOptions?.maxZoom ?? 18
    const minZoom = viewOptions?.minZoom ?? 3
    const rotation = viewOptions?.rotation ?? 0
    const animation = viewOptions?.animation ?? true
    const duration = viewOptions?.duration ?? 1000

    // 初始化地图
    React.useEffect(() => {
      if (!mapRef.current || mapInstance) return

      // 构建视图配置
      const viewConfig: Record<string, unknown> = {
        center: fromLonLat(center),
        zoom,
        maxZoom,
        minZoom,
        rotation: (rotation * Math.PI) / 180, // 角度转弧度
      }

      // 处理边界范围
      if (extentOption) {
        const { northLat, eastLon, southLat, westLon } = extentOption
        if (northLat && eastLon && southLat && westLon) {
          const fixedExtent = [
            Math.min(westLon, eastLon),
            southLat,
            Math.max(westLon, eastLon),
            northLat
          ]
          viewConfig.extent = transformExtent(fixedExtent, 'EPSG:4326', 'EPSG:3857')
        }
      }

      // 创建地图实例
      const map = new Map({
        target: mapRef.current,
        layers: [createTileLayer()],
        view: new View(viewConfig),
        controls: defaultControls({
          zoom: false,
          attribution: false,
          rotate: false,
        }),
      })

      // 添加缩放控件
      if (zoomOption?.show) {
        map.addControl(new Zoom({
          zoomInTipLabel: zoomOption.zoomInTipLabel || '放大',
          zoomOutTipLabel: zoomOption.zoomOutTipLabel || '缩小',
        }))
      }

      // 添加比例尺
      if (scaleLine?.show) {
        map.addControl(new ScaleLine({
          units: scaleLine.units || 'metric',
          bar: scaleLine.bar || false,
          text: scaleLine.text || false,
          minWidth: scaleLine.minWidth,
          steps: scaleLine.steps,
        }))
      }

      setMapInstance(map)
      setMapReady(true)

      // 监听容器大小变化
      const resizeObserver = new ResizeObserver(() => {
        map.updateSize()
      })
      if (mapRef.current) {
        resizeObserver.observe(mapRef.current)
      }

      return () => {
        resizeObserver.disconnect()
        if (map) {
          map.setTarget(undefined)
          setMapInstance(null)
        }
      }
    }, [])

    // 更新中心位置
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const view = mapInstance.getView()
      const newCenter = fromLonLat(center)
      
      if (animation) {
        view.animate({ center: newCenter, duration })
      } else {
        view.setCenter(newCenter)
      }
    }, [center[0], center[1], mapReady])

    // 更新缩放级别
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const view = mapInstance.getView()
      
      if (animation) {
        view.animate({ zoom, duration })
      } else {
        view.setZoom(zoom)
      }
    }, [zoom, mapReady])

    // 更新最大/最小缩放
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const view = mapInstance.getView()
      view.setMaxZoom(maxZoom)
      view.setMinZoom(minZoom)
    }, [maxZoom, minZoom, mapReady])

    // 更新旋转角度
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const view = mapInstance.getView()
      const radians = (rotation * Math.PI) / 180
      
      if (animation) {
        view.animate({ rotation: radians, duration })
      } else {
        view.setRotation(radians)
      }
    }, [rotation, mapReady])

    // 更新缩放控件
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const controls = mapInstance.getControls().getArray()
      const zoomControl = controls.find((c: unknown) => c instanceof Zoom)

      if (!zoomOption?.show && zoomControl) {
        mapInstance.removeControl(zoomControl)
      } else if (zoomOption?.show && !zoomControl) {
        mapInstance.addControl(new Zoom({
          zoomInTipLabel: zoomOption.zoomInTipLabel || '放大',
          zoomOutTipLabel: zoomOption.zoomOutTipLabel || '缩小',
        }))
      }
    }, [zoomOption?.show, mapReady, mapInstance])

    // 更新比例尺
    React.useEffect(() => {
      if (!mapInstance || !mapReady) return
      const controls = mapInstance.getControls().getArray()
      const scaleLineControl = controls.find((c: unknown) => c instanceof ScaleLine)

      if (scaleLineControl) {
        mapInstance.removeControl(scaleLineControl)
      }

      if (scaleLine?.show) {
        mapInstance.addControl(new ScaleLine({
          units: scaleLine.units || 'metric',
          bar: scaleLine.bar || false,
          text: scaleLine.text || false,
          minWidth: scaleLine.minWidth,
          steps: scaleLine.steps,
        }))
      }
    }, [scaleLine?.show, scaleLine?.units, scaleLine?.bar, scaleLine?.text, mapReady, mapInstance])

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative overflow-hidden",
          className
        )}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height
        }}
        {...props}
      >
        {/* OpenLayers 地图容器 */}
        <div 
          ref={mapRef} 
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />

        {/* 子元素容器 - 通过 Context 传递 map 实例 */}
        {children && (
          <MapContext.Provider value={{ map: mapInstance }}>
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="pointer-events-auto">
                {mapReady ? children : null}
              </div>
            </div>
          </MapContext.Provider>
        )}
      </div>
    )
  }
)

GisMapCore.displayName = "GisMapCore"

export { GisMapCore }
