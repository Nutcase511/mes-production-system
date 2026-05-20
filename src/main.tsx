import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initAiriotClient } from '@/lib/airiot-client'
import { registerModels } from '@/models'

// 初始化AIRIOT客户端（使用官方SDK）
initAiriotClient()

// 注册所有 Model 模型定义
registerModels()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
