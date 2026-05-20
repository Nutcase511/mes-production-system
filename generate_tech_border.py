from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def create_tech_border(size=2048):
    """Create tech border with double glow lines and cut corners"""
    # Create transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Parameters
    border_width = int(size * 0.08)
    inner_width = 3
    outer_width = 10
    corner_size = int(size * 0.15)

    # Colors
    cyan_blue = (0, 212, 255, 255)
    white = (255, 255, 255, 255)

    # Outer glow line coordinates (octagon with cut corners)
    margin = border_width
    outer_coords = [
        (corner_size, margin),
        (size - corner_size, margin),
        (size - margin, corner_size),
        (size - margin, size - corner_size),
        (size - corner_size, size - margin),
        (corner_size, size - margin),
        (margin, size - corner_size),
        (margin, corner_size),
    ]

    # Inner fine line coordinates
    inner_margin = margin + outer_width
    inner_coords = [
        (corner_size + 20, inner_margin),
        (size - corner_size - 20, inner_margin),
        (size - inner_margin, corner_size + 20),
        (size - inner_margin, size - corner_size - 20),
        (size - corner_size - 20, size - inner_margin),
        (corner_size + 20, size - inner_margin),
        (inner_margin, size - corner_size - 20),
        (inner_margin, corner_size + 20),
    ]

    # Draw outer glow effect
    for offset in range(30, 0, -2):
        alpha = int(50 * (offset / 30))
        glow_color = (*cyan_blue[:3], alpha)
        offset_coords = []
        for x, y in outer_coords:
            cx, cy = x, y
            if x < size // 2 and y < margin + 20:
                cy += offset
            elif x > size // 2 and y < margin + 20:
                cy += offset
            elif x > size - margin - 20 and y < size // 2:
                cx -= offset
            elif x > size - margin - 20 and y > size // 2:
                cx -= offset
            elif x > size // 2 and y > size - margin - 20:
                cy -= offset
            elif x < size // 2 and y > size - margin - 20:
                cy -= offset
            elif x < margin + 20 and y > size // 2:
                cx += offset
            elif x < margin + 20 and y < size // 2:
                cx += offset
            offset_coords.append((cx, cy))

        for i in range(len(offset_coords)):
            x1, y1 = offset_coords[i]
            x2, y2 = offset_coords[(i + 1) % len(offset_coords)]
            draw.line([(x1, y1), (x2, y2)], fill=glow_color, width=outer_width)

    # Draw outer main line
    for i in range(len(outer_coords)):
        x1, y1 = outer_coords[i]
        x2, y2 = outer_coords[(i + 1) % len(outer_coords)]
        draw.line([(x1, y1), (x2, y2)], fill=cyan_blue, width=outer_width)

    # Draw inner fine line
    for i in range(len(inner_coords)):
        x1, y1 = inner_coords[i]
        x2, y2 = inner_coords[(i + 1) % len(inner_coords)]
        draw.line([(x1, y1), (x2, y2)], fill=white, width=inner_width)

    # Top and bottom decoration blocks
    decor_height = 30
    decor_width = 120
    decor_top_y = margin - 15
    decor_bottom_y = size - margin + decor_height - 15

    # Top decoration
    top_decor_x = size // 2 - decor_width // 2
    draw.rectangle(
        [top_decor_x, decor_top_y, top_decor_x + decor_width, decor_top_y + decor_height],
        outline=cyan_blue,
        width=2
    )
    for i in range(10):
        alpha = int(100 * (1 - i / 10))
        glow_color = (*cyan_blue[:3], alpha)
        draw.rectangle(
            [top_decor_x - i, decor_top_y - i, top_decor_x + decor_width + i, decor_top_y + decor_height + i],
            outline=glow_color,
            width=1
        )

    # Bottom decoration
    bottom_decor_x = size // 2 - decor_width // 2
    draw.rectangle(
        [bottom_decor_x, decor_bottom_y, bottom_decor_x + decor_width, decor_bottom_y + decor_height],
        outline=cyan_blue,
        width=2
    )
    for i in range(10):
        alpha = int(100 * (1 - i / 10))
        glow_color = (*cyan_blue[:3], alpha)
        draw.rectangle(
            [bottom_decor_x - i, decor_bottom_y - i, bottom_decor_x + decor_width + i, decor_bottom_y + decor_height + i],
            outline=glow_color,
            width=1
        )

    # Corner decorations (diamonds)
    corner_decor_size = 15

    # Top-left
    draw.polygon([
        (margin, corner_size),
        (margin + corner_decor_size, corner_size - corner_decor_size),
        (margin + corner_decor_size * 2, corner_size),
        (margin + corner_decor_size, corner_size + corner_decor_size)
    ], fill=cyan_blue)

    # Top-right
    draw.polygon([
        (size - margin, corner_size),
        (size - margin - corner_decor_size, corner_size - corner_decor_size),
        (size - margin - corner_decor_size * 2, corner_size),
        (size - margin - corner_decor_size, corner_size + corner_decor_size)
    ], fill=cyan_blue)

    # Bottom-right
    draw.polygon([
        (size - margin, size - corner_size),
        (size - margin - corner_decor_size, size - corner_size - corner_decor_size),
        (size - margin - corner_decor_size * 2, size - corner_size),
        (size - margin - corner_decor_size, size - corner_size + corner_decor_size)
    ], fill=cyan_blue)

    # Bottom-left
    draw.polygon([
        (margin, size - corner_size),
        (margin + corner_decor_size, size - corner_size - corner_decor_size),
        (margin + corner_decor_size * 2, size - corner_size),
        (margin + corner_decor_size, size - corner_size + corner_decor_size)
    ], fill=cyan_blue)

    # Add glow effect
    glow_layer = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    for i in range(len(outer_coords)):
        x1, y1 = outer_coords[i]
        x2, y2 = outer_coords[(i + 1) % len(outer_coords)]
        for alpha in [100, 80, 60, 40, 20]:
            glow_color = (*cyan_blue[:3], alpha)
            glow_draw.line([(x1, y1), (x2, y2)], fill=glow_color, width=outer_width + 10)

    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=8))
    img = Image.alpha_composite(img, glow_layer)

    return img

# Generate border
print("Generating tech border...")
border_img = create_tech_border(2048)

output_path = "src/image/tech_border_2048.png"
border_img.save(output_path, "PNG")
print(f"Saved to: {output_path}")

# Small preview version
small_border = create_tech_border(512)
small_output_path = "src/image/tech_border_512.png"
small_border.save(small_output_path, "PNG")
print(f"Preview saved to: {small_output_path}")

print("\nDone!")
print("Features:")
print("- Double glow lines (outer cyan-blue, inner white)")
print("- Octagon cut corners")
print("- Top and bottom decoration blocks")
print("- Four corner diamond decorations")
print("- Glow effect")
