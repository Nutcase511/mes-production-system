from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math

def create_beautiful_tech_border(size=2048):
    """Create enhanced tech border with better visual design"""
    # Create transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Enhanced parameters
    border_width = int(size * 0.12)  # 更宽的边框
    inner_width = 4  # 更粗的内线
    outer_width = 12  # 更粗的外线
    corner_size = int(size * 0.18)  # 更大的切角

    # Enhanced color palette
    cyan_blue = (0, 212, 255, 255)      # 主色 #00D4FF
    deep_cyan = (0, 180, 220, 255)      # 深青色
    bright_white = (255, 255, 255, 255) # 亮白色
    glow_blue = (0, 150, 255, 255)      # 发光蓝色
    accent_cyan = (0, 230, 255, 200)    # 强调色（半透明）

    # Calculate coordinates with more dynamic cut corners
    margin = border_width
    inner_margin = margin + outer_width + 5

    # Create more interesting octagon shape with variable cut sizes
    # 上边
    top_left_cut = (corner_size, margin)
    top_mid_left = (size * 0.35, margin)
    top_mid_right = (size * 0.65, margin)
    top_right_cut = (size - corner_size, margin)

    # 右边
    right_top_cut = (size - margin, corner_size)
    right_mid_top = (size - margin, size * 0.35)
    right_mid_bottom = (size - margin, size * 0.65)
    right_bottom_cut = (size - margin, size - corner_size)

    # 下边
    bottom_right_cut = (size - corner_size, size - margin)
    bottom_mid_right = (size * 0.65, size - margin)
    bottom_mid_left = (size * 0.35, size - margin)
    bottom_left_cut = (corner_size, size - margin)

    # 左边
    left_bottom_cut = (margin, size - corner_size)
    left_mid_bottom = (margin, size * 0.65)
    left_mid_top = (margin, size * 0.35)
    left_top_cut = (margin, corner_size)

    # Outer glow line coordinates (more detailed)
    outer_coords = [
        top_left_cut, top_mid_left, top_mid_right, top_right_cut,
        right_top_cut, right_mid_top, right_mid_bottom, right_bottom_cut,
        bottom_right_cut, bottom_mid_right, bottom_mid_left, bottom_left_cut,
        left_bottom_cut, left_mid_bottom, left_mid_top, left_top_cut
    ]

    # Inner fine line coordinates
    inner_coords = [
        (corner_size + 15, inner_margin),
        (size * 0.35, inner_margin),
        (size * 0.65, inner_margin),
        (size - corner_size - 15, inner_margin),
        (size - inner_margin, corner_size + 15),
        (size - inner_margin, size * 0.35),
        (size - inner_margin, size * 0.65),
        (size - inner_margin, size - corner_size - 15),
        (size - corner_size - 15, size - inner_margin),
        (size * 0.65, size - inner_margin),
        (size * 0.35, size - inner_margin),
        (corner_size + 15, size - inner_margin),
        (inner_margin, size - corner_size - 15),
        (inner_margin, size * 0.65),
        (inner_margin, size * 0.35),
        (inner_margin, corner_size + 15)
    ]

    # Draw enhanced glow effect with multiple layers
    # Layer 1: Outer glow (largest, most diffuse)
    for i in range(50, 0, -3):
        alpha = int(30 * (i / 50))
        glow_color = (*glow_blue[:3], alpha)

        offset_coords = []
        for idx, (x, y) in enumerate(outer_coords):
            cx, cy = x, y

            # Smarter offset based on position
            if idx < 4:  # Top edge
                cy += i
            elif idx < 8:  # Right edge
                cx -= i
            elif idx < 12:  # Bottom edge
                cy -= i
            else:  # Left edge
                cx += i

            offset_coords.append((cx, cy))

        # Draw glow segments
        for i in range(len(offset_coords)):
            x1, y1 = offset_coords[i]
            x2, y2 = offset_coords[(i + 1) % len(offset_coords)]
            draw.line([(x1, y1), (x2, y2)], fill=glow_color, width=outer_width + 8)

    # Layer 2: Mid glow (more concentrated)
    for i in range(30, 0, -2):
        alpha = int(60 * (i / 30))
        glow_color = (*cyan_blue[:3], alpha)

        offset_coords = []
        for idx, (x, y) in enumerate(outer_coords):
            cx, cy = x, y
            if idx < 4:
                cy += i
            elif idx < 8:
                cx -= i
            elif idx < 12:
                cy -= i
            else:
                cx += i
            offset_coords.append((cx, cy))

        for i in range(len(offset_coords)):
            x1, y1 = offset_coords[i]
            x2, y2 = offset_coords[(i + 1) % len(offset_coords)]
            draw.line([(x1, y1), (x2, y2)], fill=glow_color, width=outer_width + 4)

    # Draw outer main line with gradient effect
    for i in range(len(outer_coords)):
        x1, y1 = outer_coords[i]
        x2, y2 = outer_coords[(i + 1) % len(outer_coords)]

        # Draw multiple lines for gradient effect
        for width in range(outer_width, outer_width - 4, -1):
            alpha = 255 if width == outer_width else 180
            color = (*cyan_blue[:3], alpha)
            draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

    # Draw inner fine line with bright white
    for i in range(len(inner_coords)):
        x1, y1 = inner_coords[i]
        x2, y2 = inner_coords[(i + 1) % len(inner_coords)]

        # Draw with slight glow
        for width in range(inner_width, inner_width - 2, -1):
            alpha = 255 if width == inner_width else 150
            color = (*bright_white[:3], alpha)
            draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

    # Enhanced top decoration block
    decor_height = 40
    decor_width = 150
    decor_top_y = margin - 20
    top_decor_x = size // 2 - decor_width // 2

    # Main rectangle
    draw.rectangle(
        [top_decor_x, decor_top_y, top_decor_x + decor_width, decor_top_y + decor_height],
        outline=cyan_blue,
        width=3
    )

    # Inner lines
    draw.rectangle(
        [top_decor_x + 8, decor_top_y + 8, top_decor_x + decor_width - 8, decor_top_y + decor_height - 8],
        outline=bright_white,
        width=1
    )

    # Enhanced glow for top decoration
    for i in range(15, 0, -2):
        alpha = int(120 * (i / 15))
        glow_color = (*cyan_blue[:3], alpha)
        draw.rectangle(
            [top_decor_x - i, decor_top_y - i, top_decor_x + decor_width + i, decor_top_y + decor_height + i],
            outline=glow_color,
            width=2
        )

    # Add tech details to top decoration
    for i in range(3):
        x = top_decor_x + 25 + i * 45
        draw.line([(x, decor_top_y + 12), (x, decor_top_y + 28)], fill=bright_white, width=2)

    # Enhanced bottom decoration block
    decor_bottom_y = size - margin + decor_height - 20
    bottom_decor_x = size // 2 - decor_width // 2

    # Main rectangle
    draw.rectangle(
        [bottom_decor_x, decor_bottom_y, bottom_decor_x + decor_width, decor_bottom_y + decor_height],
        outline=cyan_blue,
        width=3
    )

    # Inner lines
    draw.rectangle(
        [bottom_decor_x + 8, decor_bottom_y + 8, bottom_decor_x + decor_width - 8, decor_bottom_y + decor_height - 8],
        outline=bright_white,
        width=1
    )

    # Enhanced glow for bottom decoration
    for i in range(15, 0, -2):
        alpha = int(120 * (i / 15))
        glow_color = (*cyan_blue[:3], alpha)
        draw.rectangle(
            [bottom_decor_x - i, decor_bottom_y - i, bottom_decor_x + decor_width + i, decor_bottom_y + decor_height + i],
            outline=glow_color,
            width=2
        )

    # Add tech details to bottom decoration
    for i in range(3):
        x = bottom_decor_x + 25 + i * 45
        draw.line([(x, decor_bottom_y + 12), (x, decor_bottom_y + 28)], fill=bright_white, width=2)

    # Enhanced corner decorations (hexagon shapes)
    def draw_hexagon(cx, cy, radius, color, fill=False):
        points = []
        for i in range(6):
            angle = math.radians(60 * i - 30)
            x = cx + radius * math.cos(angle)
            y = cy + radius * math.sin(angle)
            points.append((x, y))

        if fill:
            draw.polygon(points, fill=color)
        else:
            draw.polygon(points, outline=color, width=2)

    # Draw corner hexagons
    corner_radius = 25
    corners = [
        (margin, corner_size),  # Top-left
        (size - margin, corner_size),  # Top-right
        (size - margin, size - corner_size),  # Bottom-right
        (margin, size - corner_size)  # Bottom-left
    ]

    for cx, cy in corners:
        # Glow
        for i in range(8, 0, -1):
            alpha = int(80 * (i / 8))
            glow_color = (*cyan_blue[:3], alpha)
            draw_hexagon(cx, cy, corner_radius + i * 2, glow_color)

        # Main hexagon
        draw_hexagon(cx, cy, corner_radius, cyan_blue, fill=True)

        # Inner detail
        draw_hexagon(cx, cy, corner_radius - 8, bright_white)

        # Center dot
        draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=bright_white)

    # Add tech lines at midpoints
    midpoints = [
        (size // 2, margin),  # Top
        (size - margin, size // 2),  # Right
        (size // 2, size - margin),  # Bottom
        (margin, size // 2)  # Left
    ]

    for mx, my in midpoints:
        # Small tech markers
        marker_size = 12
        draw.polygon([
            (mx, my - marker_size),
            (mx + marker_size, my),
            (mx, my + marker_size),
            (mx - marker_size, my)
        ], fill=accent_cyan)

        # Inner diamond
        draw.polygon([
            (mx, my - 6),
            (mx + 6, my),
            (mx, my + 6),
            (mx - 6, my)
        ], fill=bright_white)

    # Add subtle grid lines for tech feel (very light)
    grid_spacing = 40
    grid_color = (*cyan_blue[:3], 30)  # Very transparent

    # Only draw near edges for subtle effect
    for i in range(margin, margin + border_width, grid_spacing):
        # Vertical lines on sides
        if i < margin + border_width:
            draw.line([(i, corner_size), (i, size - corner_size)], fill=grid_color, width=1)
            draw.line([(size - i, corner_size), (size - i, size - corner_size)], fill=grid_color, width=1)

        # Horizontal lines on top/bottom
        if i < margin + border_width:
            draw.line([(corner_size, i), (size - corner_size, i)], fill=grid_color, width=1)
            draw.line([(corner_size, size - i), (size - corner_size, size - i)], fill=grid_color, width=1)

    # Apply final glow blur
    glow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    # Draw glow on all lines
    for i in range(len(outer_coords)):
        x1, y1 = outer_coords[i]
        x2, y2 = outer_coords[(i + 1) % len(outer_coords)]
        for alpha in [80, 60, 40, 20]:
            glow_color = (*glow_blue[:3], alpha)
            glow_draw.line([(x1, y1), (x2, y2)], fill=glow_color, width=outer_width + 12)

    # Blur and composite
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=10))
    img = Image.alpha_composite(img, glow_layer)

    return img

# Generate beautiful border
print("Generating enhanced tech border...")
border_img = create_beautiful_tech_border(2048)

output_path = "src/image/tech_border_beautiful_2048.png"
border_img.save(output_path, "PNG")
print(f"Saved to: {output_path}")

# Small preview version
small_border = create_beautiful_tech_border(512)
small_output_path = "src/image/tech_border_beautiful_512.png"
small_border.save(small_output_path, "PNG")
print(f"Preview saved to: {small_output_path}")

print("\nDone!")
print("Enhanced features:")
print("- More dynamic octagon shape with variable cut corners")
print("- Enhanced multi-layer glow effect")
print("- Brighter colors with better contrast")
print("- Hexagonal corner decorations")
print("- Tech markers at midpoints")
print("- Improved top/bottom decorations with tech details")
print("- Subtle grid lines for extra tech feel")
