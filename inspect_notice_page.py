from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()

    # Capture console logs
    logs = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

    page.goto("http://localhost:3002/production/production-notice")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(5000)

    # Take a screenshot
    page.screenshot(path="d:\\我的项目\\文件分析\\mes-frontend\\notice_page.png", full_page=True)

    # Check for data-pinned attributes on the table
    pinned_cells = page.locator("[data-pinned]")
    pinned_count = pinned_cells.count()
    print(f"\n=== Pinned cells found: {pinned_count} ===")
    for i in range(pinned_count):
        cell = pinned_cells.nth(i)
        tag = cell.evaluate("el => el.tagName")
        pinned = cell.get_attribute("data-pinned")
        text = cell.text_content()
        print(f"  [{tag}] data-pinned={pinned} text='{text[:50] if text else ''}'")

    # Check all table header cells
    print("\n=== All header cells ===")
    th_cells = page.locator("table thead tr:first-child th")
    th_count = th_cells.count()
    for i in range(th_count):
        cell = th_cells.nth(i)
        pinned = cell.get_attribute("data-pinned")
        style = cell.get_attribute("style")
        text = cell.text_content()
        print(f"  th[{i}] pinned={pinned} style='{style}' text='{text[:40] if text else ''}'")

    # Check table structure
    print("\n=== Table structure ===")
    tables = page.locator("table")
    print(f"Tables found: {tables.count()}")

    # Get table columns info
    cols = page.locator("table colgroup col")
    print(f"\nColgroup cols: {cols.count()}")
    total_width = 0
    for i in range(cols.count()):
        col = cols.nth(i)
        style = col.get_attribute("style") or ""
        width_val = 0
        if "width:" in style:
            import re
            m = re.search(r'width:\s*(\d+)', style)
            if m:
                width_val = int(m.group(1))
        total_width += width_val
        print(f"  col[{i}] style='{style}' width={width_val}")
    print(f"Total column widths: {total_width}")

    # Check scroll area
    print("\n=== Scroll area ===")
    viewport = page.locator("[data-slot='scroll-area-viewport']")
    print(f"Scroll viewport found: {viewport.count()}")

    # Check data-grid-table-viewport
    print("\n=== Data grid table viewport ===")
    grid_viewport = page.locator("[data-slot='data-grid-table-viewport']")
    print(f"Grid viewport found: {grid_viewport.count()}")

    print(f"\n=== Console logs ({len(logs)} entries) ===")
    for log in logs[-20:]:
        print(f"  {log}")

    browser.close()
    print("\nDone!")