
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to the deckbuilder page
        await page.goto("http://localhost:8000/deckbuilder.html")

        # Wait for cards to load (loading indicator to disappear)
        await page.wait_for_selector("#loadingIndicator", state="hidden")

        # Type in search bar
        search_term = "hBP01-001"
        await page.fill("#searchBar", search_term)

        # Wait for filtering
        await page.wait_for_timeout(1000)

        # Screenshot
        await page.screenshot(path="verification/search_verification.png")

        await browser.close()

asyncio.run(run())
