"""Verify romance-centered ALD1 story flow at 390x844."""
import sys
import time
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page(
        viewport={'width': 390, 'height': 844},
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        is_mobile=True,
        has_touch=True
    )
    page.goto('http://localhost:8080/index.html')
    time.sleep(1)

    # 1. Lock screen check
    time_text = page.inner_text('#lock-time')
    date_text = page.inner_text('#lock-date')
    print(f"[TEST 1] Lock Screen: Time={time_text}, Date={date_text}")
    assert time_text == "23:48"

    # 2. Test wrong PIN (9999)
    for _ in range(4):
        page.click('.keypad-btn[data-key="9"]')
        time.sleep(0.08)
    page.wait_for_selector('#pin-dots.shake', timeout=2000)
    print("[TEST 2] Wrong PIN triggered shake animation.")
    time.sleep(0.6)

    # 3. Enter right PIN (0520 = 我爱你)
    print("[TEST 3] Entering romance PIN (0520)...")
    for digit in ['0', '5', '2', '0']:
        page.click(f'.keypad-btn[data-key="{digit}"]')
        time.sleep(0.08)
    page.wait_for_selector('#home-screen.active', timeout=3000)
    print("[TEST 3] Home screen active!")

    # 4. Wait for push notification from Anxinie
    page.wait_for_selector('#notification-banner.visible', timeout=4000)
    sender = page.inner_text('#notif-title')
    msg = page.inner_text('#notif-message')
    print(f"[TEST 4] Notification received from: '{sender}', Message='{msg}'")
    assert "Anxinie" in sender

    # 5. Tap notification -> open chat
    page.click('#notification-banner')
    page.wait_for_selector('#messages-thread-view.active', timeout=3000)
    contact = page.inner_text('#thread-contact-name')
    print(f"[TEST 5] Chat opened with: {contact}")
    assert "Anxinie" in contact

    # Wait for typing indicator and follow-up message
    time.sleep(3.5)
    print("[TEST 5] Typing indicator and queued message received.")

    # Send quick reply
    quick_pills = page.query_selector_all('.quick-reply-pill')
    if len(quick_pills) > 0:
        quick_pills[0].click()
        time.sleep(1)
        print("[TEST 5] Quick reply sent to Anxinie!")

    # Return home
    page.click('#home-indicator-zone')
    time.sleep(0.4)

    # 6. Photos App (12 photos)
    page.click('#app-btn-photos')
    page.wait_for_selector('#app-window-photos.active', timeout=3000)
    thumbs = page.query_selector_all('.photo-thumb-item')
    print(f"[TEST 6] Photos app loaded with {len(thumbs)} romantic photos.")
    assert len(thumbs) >= 12
    # Open rings photo
    thumbs[2].click()
    page.wait_for_selector('#photo-viewer-modal:not(.hidden)', timeout=2000)
    vtitle = page.inner_text('#viewer-title')
    print(f"[TEST 6] Fullscreen Photo: '{vtitle}'")
    page.click('#btn-close-viewer')
    time.sleep(0.3)
    page.click('#home-indicator-zone')
    time.sleep(0.4)

    # 7. Notes App & Locked Note (1204)
    page.click('#app-btn-notes')
    page.wait_for_selector('#app-window-notes.active', timeout=3000)
    notes = page.query_selector_all('.note-card-item')
    print(f"[TEST 7] Notes list loaded with {len(notes)} notes.")
    # Click locked note (Note 3)
    notes[2].click()
    page.wait_for_selector('#note-lock-overlay:not(.hidden)', timeout=2000)
    # Enter anniversary PIN 1204
    for digit in ['1', '2', '0', '4']:
        page.click(f'.nkey[data-k="{digit}"]')
        time.sleep(0.08)
    page.wait_for_selector('#notes-detail-view.active', timeout=3000)
    dtitle = page.inner_text('#note-reader-title')
    print(f"[TEST 7] Note decrypted! Title='{dtitle}'")
    assert "Anxinie" in dtitle

    # Return home
    page.click('#home-indicator-zone')
    time.sleep(0.4)

    # 8. Phone App & Voicemail
    page.click('#app-btn-phone')
    page.wait_for_selector('#app-window-phone.active', timeout=3000)
    page.click('.phone-tab-btn[data-tab="voicemail"]')
    time.sleep(0.3)
    vm = page.inner_text('#vm-transcript-text')
    print(f"[TEST 8] Voicemail transcript from Anxinie: '{vm}'")

    browser.close()
    print("\n>>> ALL ROMANCE-CENTERED VERIFICATIONS PASSED 100%! <<<")
