import os
import time
from playwright.sync_api import sync_playwright

# Configuration
TARGET_URL = "https://online.fliphtml5.com/zacwj/yzkf/#p=1"
OUTPUT_DIR = "./captured_pages"
TOTAL_PAGES = 423  # Adjust this to match the actual total book page count
FLIP_DELAY = 2.5  # Seconds to let the high-res image stream in

os.makedirs(OUTPUT_DIR, exist_ok=True)

def scrape_flipbook():
    downloaded_urls = set()
    page_counter = 1

    with sync_playwright() as p:
        # Launch browser (headless=False lets you observe the flipping behavior)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # Intercept and save incoming webp images
        def handle_response(response):
            nonlocal page_counter
            url = response.url
            
            if "/files/large/" in url and (".webp" in url or ".jpg" in url):
                clean_url = url.split('?')[0]
                
                if clean_url not in downloaded_urls:
                    downloaded_urls.add(clean_url)
                    print(f"[+] Captured Page {page_counter}: {clean_url}")
                    
                    try:
                        image_data = response.body()
                        filename = f"page_{page_counter:03d}_{clean_url.split('/')[-1]}"
                        filepath = os.path.join(OUTPUT_DIR, filename)
                        
                        with open(filepath, "wb") as f:
                            f.write(image_data)
                        
                        page_counter += 1
                    except Exception as e:
                        print(f"[-] Could not save image: {e}")

        page.on("response", handle_response)

        print(f"Navigating to {TARGET_URL}...")
        # FIX: Changed 'networkidle' to 'domcontentloaded' to prevent the 30000ms timeout
        page.goto(TARGET_URL, wait_until="domcontentloaded")
        
        # Give the document layout and initial pages a few seconds to stabilize
        time.sleep(5)

        # Loop to click the next button sequentially
        for i in range(1, TOTAL_PAGES):
            print(f"Flipping page... ({i}/{TOTAL_PAGES - 1})")
            
            try:
                # Target the button directly using the aria-label attribute from your HTML
                next_button = page.locator('div[aria-label="Next page"]')
                
                if next_button.is_visible():
                    next_button.click()
                else:
                    # Fallback to arrow key if the overlay button disappears
                    page.keyboard.press("ArrowRight")
                    
            except Exception as e:
                print(f"[-] Navigation element click missed, trying fallback key: {e}")
                page.keyboard.press("ArrowRight")
            
            # Wait for the network layer to pick up the incoming image file
            time.sleep(FLIP_DELAY)

        print("\n[!] Finished scraping cycle. Check your output directory.")
        browser.close()

if __name__ == "__main__":
    scrape_flipbook()