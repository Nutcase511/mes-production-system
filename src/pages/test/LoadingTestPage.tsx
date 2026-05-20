/**
 * 加载动画测试页面
 * 展示不同的加载样式供选择
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function LoadingTestPage() {
  const [activeLoaders, setActiveLoaders] = useState<Record<string, boolean>>({})

  const toggleLoader = (key: string) => {
    setActiveLoaders(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">加载动画测试页面</h1>
          <p className="text-blue-200">点击按钮查看不同加载效果</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* 方案1：科技环形加载器 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">方案1：科技环形加载器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-950 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {activeLoaders.ring ? (
                  <div className="relative w-24 h-24">
                    {/* 外圈 */}
                    <div
                      className="absolute inset-0 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: '#22d3ee',
                        animation: 'spin 2s linear infinite',
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
                      }}
                    ></div>
                    {/* 中圈 */}
                    <div
                      className="absolute inset-3 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: '#3b82f6',
                        animation: 'spin 1.5s linear infinite reverse',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
                      }}
                    ></div>
                    {/* 内圈 */}
                    <div
                      className="absolute inset-6 rounded-full border-4 border-transparent"
                      style={{
                        borderTopColor: '#22c55e',
                        animation: 'spin 2s linear infinite',
                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
                      }}
                    ></div>
                    {/* 中心文字 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-cyan-400 text-xs font-bold animate-pulse">加载中</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">点击按钮查看效果</div>
                )}
              </div>
              <Button
                onClick={() => toggleLoader('ring')}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {activeLoaders.ring ? '停止' : '查看效果'}
              </Button>
            </CardContent>
          </Card>

          {/* 方案2：点阵呼吸加载器 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">方案2：点阵呼吸加载器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                {activeLoaders.dots ? (
                  <div className="flex gap-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse"
                        style={{
                          animationDelay: `${i * 0.15}s`,
                          boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)'
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="text-blue-300 text-sm">预览区域</div>
                )}
              </div>
              <Button
                onClick={() => toggleLoader('dots')}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {activeLoaders.dots ? '停止' : '查看效果'}
              </Button>
            </CardContent>
          </Card>

          {/* 方案3：能量条加载器 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">方案3：能量条加载器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                {activeLoaders.bar ? (
                  <div className="w-full px-8">
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out"
                        style={{
                          width: '60%',
                          boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
                          animation: 'loadingBar 2s ease-in-out infinite'
                        }}
                      ></div>
                    </div>
                    <div className="text-center mt-4">
                      <span className="text-cyan-400 font-mono text-lg">60%</span>
                      <p className="text-blue-200 text-xs mt-1">正在加载数据...</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-blue-300 text-sm">预览区域</div>
                )}
              </div>
              <Button
                onClick={() => toggleLoader('bar')}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {activeLoaders.bar ? '停止' : '查看效果'}
              </Button>
            </CardContent>
          </Card>

          {/* 方案4：脉冲核心加载器 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">方案4：脉冲核心加载器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                {activeLoaders.pulse ? (
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* 核心点 */}
                    <div className="absolute w-6 h-6 bg-cyan-400 rounded-full animate-pulse"></div>
                    {/* 波纹 */}
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="absolute rounded-full border-2 border-cyan-400/50"
                        style={{
                          width: '100%',
                          height: '100%',
                          animation: `ripple 2s ${i * 0.6}s ease-out infinite`
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="text-blue-300 text-sm">预览区域</div>
                )}
              </div>
              <Button
                onClick={() => toggleLoader('pulse')}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {activeLoaders.pulse ? '停止' : '查看效果'}
              </Button>
            </CardContent>
          </Card>

          {/* 方案5：方块矩阵加载器 */}
          <Card className="backdrop-blur-xl bg-blue-500/10 border-2 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-white">方案5：方块矩阵加载器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                {activeLoaders.matrix ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-500 animate-pulse"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)'
                        }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <div className="text-blue-300 text-sm">预览区域</div>
                )}
              </div>
              <Button
                onClick={() => toggleLoader('matrix')}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400"
              >
                {activeLoaders.matrix ? '停止' : '查看效果'}
              </Button>
            </CardContent>
          </Card>

          {/* 测试全部 */}
          <Card className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50">
            <CardHeader>
              <CardTitle className="text-white">测试全部</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-blue-200 text-sm text-center">
                  <p className="mb-2">点击下方按钮</p>
                  <p className="text-xs">同时查看所有效果</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const allActive = Object.keys(activeLoaders).length === 5 && Object.values(activeLoaders).every(v => v)
                  setActiveLoaders({
                    ring: !allActive,
                    dots: !allActive,
                    bar: !allActive,
                    pulse: !allActive,
                    matrix: !allActive
                  })
                }}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500"
              >
                {Object.keys(activeLoaders).length === 5 && Object.values(activeLoaders).every(v => v)
                  ? '停止全部'
                  : '启动全部'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 全局样式 */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes ripple {
            0% {
              transform: scale(0.8);
              opacity: 1;
            }
            100% {
              transform: scale(1.5);
              opacity: 0;
            }
          }

          @keyframes loadingBar {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 60%;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default LoadingTestPage
