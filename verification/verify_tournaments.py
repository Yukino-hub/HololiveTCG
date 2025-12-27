from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:8000/tournaments.html")

        # Wait for the rows to populate (they are loaded via fetch)
        page.wait_for_selector("#tournamentsTable tbody tr")

        rows = page.locator("#tournamentsTable tbody tr")
        count = rows.count()

        print(f"Found {count} rows in the tournament table.")

        if count > 0:
            print("Verification PASSED: Table is populated.")
        else:
            print("Verification FAILED: Table is empty.")

        page.screenshot(path="verification/tournaments_verification.png")
        browser.close()

if __name__ == "__main__":
    run()
