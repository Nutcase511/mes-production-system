# 边框设计测试页面说明

## 概述

这个测试页面用于展示和测试纯CSS实现的发光边框效果，参考了 `mes_card_border_0.jpg` 的设计。

## 访问方式

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 在浏览器中打开：
   ```
   http://localhost:3004/test/border
   ```
   （如果3004端口被占用，Vite会自动选择下一个可用端口）

## 页面内容

### 1. 原始参考图片
显示原始的 `mes_card_border_0.jpg` 图片，作为设计参考。

### 2. CSS复刻效果
使用纯CSS复刻的边框效果，包括：
- **渐变发光边框**：使用多层box-shadow实现发光效果
- **圆角设计**：使用rounded-xl实现圆角
- **悬浮感**：hover时增强发光效果
- **背景渐变**：半透明渐变背景
- **毛玻璃效果**：使用backdrop-blur实现

### 3. 不同强度效果对比
展示三种不同强度的发光效果：
- **轻微效果**：适合细微的视觉提示
- **中等效果**：适合常规的卡片样式
- **强烈效果**：适合重点强调的内容

### 4. 不同颜色方案
展示四种不同的颜色方案：
- 蓝青色（默认）
- 紫粉色
- 绿青色
- 橙红色

### 5. CSS代码参考
提供了完整的CSS代码示例，可以直接复制使用。

## 推荐的CSS配置

```css
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
    0 0 30px rgba(59, 130, 246, 0.3),  /* 内层蓝光 */
    0 0 60px rgba(6, 182, 212, 0.2),  /* 外层青光 */
    0 0 90px rgba(59, 130, 246, 0.1);  /* 远层扩散光 */
  
  /* 悬浮增强效果 */
  transition: box-shadow 0.3s ease;
}

.glowing-border:hover {
  box-shadow: 
    0 0 40px rgba(59, 130, 246, 0.5),
    0 0 80px rgba(6, 182, 212, 0.3),
    0 0 120px rgba(59, 130, 246, 0.2);
}
```

## Tailwind CSS版本

如果使用Tailwind CSS，可以使用以下类名组合：

```jsx
<div className="
  relative p-6 rounded-xl 
  bg-gradient-to-br from-blue-600/15 to-cyan-600/15 
  backdrop-blur-md 
  border-2 border-blue-400/30 
  shadow-[0_0_30px_rgba(59,130,246,0.3),0_0_60px_rgba(6,182,212,0.2)]
  hover:shadow-[0_0_40px_rgba(59,130,246,0.5),0_0_80px_rgba(6,182,212,0.3)]
  transition-shadow duration-300
">
  {/* 内容 */}
</div>
```

## 自定义颜色

要改变颜色方案，只需修改以下值：
- 背景渐变颜色：`from-xxx-600/15 to-yyy-600/15`
- 边框颜色：`border-xxx-400/30`
- 阴影颜色：`rgba(red, green, blue, alpha)`

例如，使用紫粉色：
```jsx
bg-gradient-to-br from-purple-600/15 to-pink-600/15 
border-2 border-purple-400/30 
shadow-[0_0_30px_rgba(147,51,234,0.3),0_0_60px_rgba(236,72,153,0.2)]
```

## 性能提示

1. **避免过度使用**：过多的box-shadow会影响性能，建议只在关键UI元素使用
2. **适当降低强度**：对于大量卡片，可以使用"轻微效果"配置
3. **考虑响应式**：在移动设备上可以减少发光强度以提升性能

## 浏览器兼容性

- 现代浏览器完全支持
- 需要backdrop-filter支持（IE不支持）
- box-shadow在所有现代浏览器中都支持

## 文件位置

- 测试页面：`src/pages/test/BorderTestPage.tsx`
- 参考图片：`src/image/mes_card_border_0.jpg`
- 路由配置：`src/router.tsx`

## 下一步

1. 访问测试页面，查看不同效果
2. 根据实际需求选择合适的强度和颜色
3. 将CSS类应用到项目中其他组件
4. 根据反馈调整参数
