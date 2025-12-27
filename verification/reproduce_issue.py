import asyncio
from playwright.async_api import async_playwright
import time

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to the deckbuilder page
        await page.goto("http://localhost:8000/deckbuilder.html")

        # Wait for cards to load (loading indicator to disappear)
        await page.wait_for_selector("#loadingIndicator", state="hidden")

        # Get initial count of cards
        initial_cards = await page.locator(".card").count()
        print(f"Initial cards: {initial_cards}")

        # Type in search bar
        search_term = "hBP01-001"
        await page.fill("#searchBar", search_term)

        # Wait for filtering (debounce is 300ms)
        await page.wait_for_timeout(1000)

        # Get count after filtering
        filtered_cards = await page.locator(".card").count()
        print(f"Filtered cards for '{search_term}': {filtered_cards}")

        # Verify result
        if filtered_cards == 0:
            print("FAILED: No cards found after search.")
            exit(1)

        # Check if the filtered card is the correct one
        first_card_number = await page.locator(".card").first.get_attribute("data-card-number")
        if search_term not in first_card_number:
            print(f"FAILED: Search result {first_card_number} does not match {search_term}")
            exit(1)

        print("SUCCESS: Search works correctly.")

        await browser.close()

asyncio.run(run())
