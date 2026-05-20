/**
 * 边框设计测试页面
 * 用于测试和复刻 mes_card_border_0.jpg 的边框效果
 */

import React from 'react'

const BorderTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">边框设计测试</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 原始图片集合 */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">参考图片</h2>
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-2">mes_card_border_0.jpg</p>
                <img
                  src="/src/image/mes_card_border_0.jpg"
                  alt="边框参考1"
                  className="w-full h-auto rounded"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-2">边框.png</p>
                <img
                  src="/src/image/边框.png"
                  alt="边框参考2"
                  className="w-full h-auto rounded"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-2">边框2.png</p>
                <img
                  src="/src/image/边框2.png"
                  alt="边框参考3"
                  className="w-full h-auto rounded"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>

          {/* 科技感边框效果 */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">科技感边框效果 (美化版)</h2>
            <div className="space-y-6">
              {/* 方案1：使用border-image */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-3">方案1: 使用 border-image (推荐)</p>
                <div
                  className="relative p-6 bg-slate-900/50"
                  style={{
                    border: '40px solid transparent',
                    borderImageSource: 'url(/src/image/tech_border_beautiful_512.png)',
                    borderImageSlice: '80',
                    borderImageRepeat: 'stretch'
                  }}
                >
                  <h3 className="text-xl font-bold text-white mb-2">数据监控卡片</h3>
                  <p className="text-blue-200 text-sm mb-4">
                    使用美化版 border-image 实现的科技感边框效果
                  </p>
                  <div className="space-y-2">
                    <div className="h-2 bg-blue-500/30 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                    </div>
                    <p className="text-xs text-blue-300">系统运行正常</p>
                  </div>
                </div>
              </div>

              {/* 方案2：使用背景图 */}
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-blue-300 mb-3">方案2: 使用背景图 (兼容性更好)</p>
                <div
                  className="relative p-6"
                  style={{
                    background: `
                      url(/src/image/tech_border_beautiful_512.png) no-repeat,
                      linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))
                    `,
                    backgroundSize: '100% 100%, 100% 100%',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'border-box, content-box'
                  }}
                >
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">设备状态卡片</h3>
                    <p className="text-blue-200 text-sm mb-4">
                      使用美化版背景图实现的科技感边框
                    </p>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">98%</div>
                        <div className="text-xs text-blue-300">设备运行率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">正常</div>
                        <div className="text-xs text-blue-300">当前状态</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 生成的边框素材 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">美化版边框素材</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-blue-300 mb-2">预览版本 (512x512)</p>
              <img
                src="/src/image/tech_border_beautiful_512.png"
                alt="美化版科技感边框预览"
                className="w-full h-auto rounded border border-slate-700"
              />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-blue-300 mb-2">生产版本 (2048x2048)</p>
              <img
                src="/src/image/tech_border_beautiful_2048.png"
                alt="美化版科技感边框生产版"
                className="w-full h-auto rounded border border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* CSS代码展示 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">不同强度效果对比</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 轻微效果 */}
            <div>
              <p className="text-sm text-blue-300 mb-2">轻微效果</p>
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-sm border border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-shadow duration-300">
                <p className="text-white text-sm">轻微发光</p>
              </div>
            </div>

            {/* 中等效果 */}
            <div>
              <p className="text-sm text-blue-300 mb-2">中等效果</p>
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-600/15 backdrop-blur-md border-2 border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_60px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5),0_0_80px_rgba(6,182,212,0.3)] transition-shadow duration-300">
                <p className="text-white text-sm">中等发光</p>
              </div>
            </div>

            {/* 强烈效果 */}
            <div>
              <p className="text-sm text-blue-300 mb-2">强烈效果</p>
              <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border-2 border-blue-400/40 shadow-[0_0_40px_rgba(59,130,246,0.5),0_0_80px_rgba(6,182,212,0.3),0_0_120px_rgba(59,130,246,0.2)] hover:shadow-[0_0_60px_rgba(59,130,246,0.7),0_0_100px_rgba(6,182,212,0.4),0_0_150px_rgba(59,130,246,0.2)] transition-shadow duration-300">
                <p className="text-white text-sm">强烈发光</p>
              </div>
            </div>
          </div>
        </div>

        {/* 不同颜色方案 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">不同颜色方案</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 蓝青色 */}
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-blue-600/15 to-cyan-600/15 backdrop-blur-md border-2 border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_60px_rgba(6,182,212,0.2)]">
              <p className="text-white text-sm">蓝青色</p>
            </div>

            {/* 紫粉色 */}
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-600/15 to-pink-600/15 backdrop-blur-md border-2 border-purple-400/30 shadow-[0_0_30px_rgba(147,51,234,0.3),0_0_60px_rgba(236,72,153,0.2)]">
              <p className="text-white text-sm">紫粉色</p>
            </div>

            {/* 绿青色 */}
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-600/15 to-emerald-600/15 backdrop-blur-md border-2 border-green-400/30 shadow-[0_0_30px_rgba(22,163,74,0.3),0_0_60px_rgba(16,185,129,0.2)]">
              <p className="text-white text-sm">绿青色</p>
            </div>

            {/* 橙红色 */}
            <div className="relative p-4 rounded-xl bg-gradient-to-br from-orange-600/15 to-red-600/15 backdrop-blur-md border-2 border-orange-400/30 shadow-[0_0_30px_rgba(249,115,22,0.3),0_0_60px_rgba(239,68,68,0.2)]">
              <p className="text-white text-sm">橙红色</p>
            </div>
          </div>
        </div>

        {/* CSS代码展示 */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">CSS 代码参考</h2>

          {/* 方案1: border-image */}
          <div className="mb-6">
            <p className="text-sm text-cyan-400 mb-2 font-semibold">方案1: 使用 border-image (推荐)</p>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
              {`.tech-border {
  border: 40px solid transparent;
  border-image-source: url('/src/image/tech_border_512.png');
  border-image-slice: 80;  /* 九宫格切片值 */
  border-image-repeat: stretch;
  background: rgba(15, 23, 42, 0.5);
  padding: 1.5rem;
}

/* 如果使用2048x2048的大图，调整切片值 */
.tech-border-hd {
  border: 80px solid transparent;
  border-image-source: url('/src/image/tech_border_2048.png');
  border-image-slice: 320;
  border-image-repeat: stretch;
  background: rgba(15, 23, 42, 0.5);
  padding: 1.5rem;
}`}
            </pre>
          </div>

          {/* 方案2: 背景图 */}
          <div className="mb-6">
            <p className="text-sm text-cyan-400 mb-2 font-semibold">方案2: 使用背景图 (兼容性更好)</p>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
              {`.tech-border-bg {
  padding: 1.5rem;
  background:
    url('/src/image/tech_border_512.png') no-repeat,
    linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  background-size: 100% 100%, 100% 100%;
  background-origin: border-box;
  background-clip: border-box, content-box;
  border: 40px solid transparent;
}`}
            </pre>
          </div>

          {/* 传统方案 */}
          <div>
            <p className="text-sm text-cyan-400 mb-2 font-semibold">传统方案: 纯CSS发光边框</p>
            <pre className="bg-slate-800 p-4 rounded-lg text-sm text-green-400 overflow-x-auto">
              {`/* 纯CSS发光边框 (不使用图片) */
.glowing-border {
  position: relative;
  padding: 1.5rem;
  border-radius: 1rem;

  /* 背景渐变 */
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.15));

  /* 模糊背景 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  /* 边框 */
  border: 2px solid rgba(59, 130, 246, 0.3);

  /* 多层阴影实现发光效果 */
  box-shadow:
    0 0 30px rgba(59, 130, 246, 0.3),
    0 0 60px rgba(6, 182, 212, 0.2),
    0 0 90px rgba(59, 130, 246, 0.1);

  /* 悬浮增强效果 */
  transition: box-shadow 0.3s ease;
}

.glowing-border:hover {
  box-shadow:
    0 0 40px rgba(59, 130, 246, 0.5),
    0 0 80px rgba(6, 182, 212, 0.3),
    0 0 120px rgba(59, 130, 246, 0.2);
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BorderTestPage
