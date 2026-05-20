import cv2
import numpy as np
from PIL import Image
import os

def analyze_border_design(image_path):
    """分析边框图片的设计特征"""
    try:
        # 读取图片
        img = cv2.imread(image_path)
        if img is None:
            print(f"无法读取图片: {image_path}")
            return

        # 转换为RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)

        print(f"\n=== 分析图片: {os.path.basename(image_path)} ===")
        print(f"尺寸: {img.shape[1]}x{img.shape[0]}")

        # 检测边缘
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # 查找轮廓
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        print(f"检测到 {len(contours)} 个轮廓")

        # 分析颜色分布
        colors = img_rgb.reshape(-1, 3)
        unique_colors = np.unique(colors, axis=0)
        print(f"唯一颜色数量: {len(unique_colors)}")

        # 主要颜色
        from collections import Counter
        color_counts = Counter(tuple(color) for color in colors)
        top_colors = color_counts.most_common(10)
        print("\n主要颜色 (R,G,B):")
        for i, (color, count) in enumerate(top_colors):
            percentage = (count / len(colors)) * 100
            print(f"  {i+1}. {color} - {percentage:.2f}%")

        # 保存边缘检测结果
        edge_path = image_path.replace('.', '_edges.')
        cv2.imwrite(edge_path, edges)
        print(f"\n边缘检测图已保存: {edge_path}")

    except Exception as e:
        print(f"分析出错: {e}")

# 分析所有边框相关图片
image_dir = "/d/我的项目/文件分析/mes-frontend/src/image"
border_images = [
    "mes_card_border_0.jpg",
    "边框.png",
    "边框2.png",
    "素材1.png",
    "素材2.png"
]

for img_name in border_images:
    img_path = os.path.join(image_dir, img_name)
    if os.path.exists(img_path):
        analyze_border_design(img_path)
    else:
        print(f"文件不存在: {img_path}")
