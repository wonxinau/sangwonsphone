# Sangwon's Phone • ALD1 Idol Romance (Interactive Phone Web App)

A mobile-first, data-driven interactive smartphone web app centering on the secret idol romance between **Lee Sangwon** (23, Korean) and **Zhou Anxin** ("Anxinie", 20, Chinese), both members of the fictional K-pop boy group **ALD1**. 

Visitors "snoop" on Sangwon's phone, discovering late-night practice room texts, secret anniversary promises, unreleased duo love songs, tender backstage polaroids, and doting care packages from his older sister (**Jiwoo Noona**).

---

## 💖 Characters & Lore

- **Lee Sangwon (이상원, 23)**: Main dancer & vocalist in ALD1. Calm, deeply devoted, and fiercely protective of Anxin.
- **Zhou Anxin / Anxinie (周安心 / 안신이, 20)**: Lead vocal in ALD1. Ethereal, playful, and affectionate. Sangwon calls him *Anxinie* (안신이).
- **Jiwoo Noona (이지우, 27)**: Sangwon's older sister. Incredibly doting, sends boxes of mom's braised beef ribs and red ginseng to the dorm, strictly orders Sangwon to share with Anxinie, and secretly cheers for their relationship.
- **Manager Park**: ALD1's busy road manager scheduling music show pre-recordings and tour rehearsals.
- **ALD1**: 6-member boy group currently on their 1st World Tour.

---

## 📱 Interactive Highlights

1. **Lock Screen**:
   - Fixed fake clock: `23:48`, Friday, December 4th.
   - **PIN:** `0520` (Iconic romantic number: *520 = 我爱你 / I love you*).
   - Tap "Hint" or "Autofill PIN" for immediate testing.
   - Wrong PIN shakes with red warning animation; correct PIN unlocks to Home Screen.
2. **Home Screen & Notification**:
   - 2 seconds after unlocking, a notification banner slides down from top:
     > *"1 new message from Anxinie 🤍: Hyung, are you almost done at the studio? I left your favorite peach tea in the fridge..."*
   - Tapping it opens their private romantic chat directly!
3. **Messages App**:
   - **Anxinie 🤍**: Private romantic messages with typing indicator animation (`"Anxinie is typing..."`), follow-up texts, and quick-reply pills allowing you to reply back.
   - **Jiwoo Noona 💕**: Doting sister messages sending homemade galbi, red ginseng, and teasing them about airport fancams.
   - **ALD1 Chaos Dorm 🎤**: Group chat banter about peach tea and practice room antics.
4. **Photos App (56 Romantic Memories)**:
   - Dynamic tab filtering: **Library** (all 56 photos), **Favorites**, and **Anxinie 🤍**.
   - 3-column square thumbnail grid with authentic idol romance memories:
     - Practice room mirror rehearsals & back hugs by the keyboard
     - Small studio room couch giggles & candid snapshots sent by Anxinie
     - Matching beanies and silver promise rings (`1204`)
     - Tokyo Tower midnight date & convenience store runs
     - In-flight airplane shoulder naps & wired earphone guides
     - Backstage encore celebrations, cheek hearts, and shadow kisses
     - Matching boyfriend tees & cozy dorm sweater moments
   - Interactive Fullscreen Viewer with photo counter, dates, locations, secret captions, info toggle, and swipe / arrow key navigation.
5. **Notes App & Secret 500-Day Diary**:
   - Note 1: ALD1 World Tour vocal setlist & duo stage notes.
   - Note 2: "Little things to remember about Anxinie 🤍" (hates cucumbers, loves peach tea, tomato egg noodles when homesick).
   - Note 3 (**LOCKED**): *"Private Diary - For Anxinie (500 Days)"*.
     - **Passcode:** `1204` (Their secret rooftop confession anniversary: December 4th).
     - Decrypts Sangwon's heartfelt private letter to Anxinie.
   - Note 4: Noona's care package note & vitamin instructions.
6. **Phone & Voicemail**:
   - Missed calls from Anxinie and Noona.
   - Interactive Voicemail from Anxinie with audio waveform and sweet transcript:
     > *"Hyung... you didn't answer, so you must still be in the recording booth polishing the vocals. It's almost midnight. Come home safely, okay? I left the warm light on for you in our room... love you."*

---

## 🖼️ How to Add Your Own Pictures

You can easily add as many pictures as you want without touching any code!

### Step 1: Put your images in `assets/photos/`
Save your picture (PNG, JPG, or WEBP) into:
```text
sangwon-phone/assets/photos/
```
*(For example: `photo_13.jpg`, `concert_selfie.png`, `anxin_cute.jpg`)*

### Step 2: Add an entry to `data/config.json`
Open [`data/config.json`](data/config.json) and add an item to the `"photos"` array:
```json
{
  "id": "photo_13",
  "url": "assets/photos/photo_13.jpg",
  "thumb": "assets/photos/photo_13.jpg",
  "title": "Late Night Convenience Store Run",
  "caption": "Sneaking out at 3 AM with oversized bucket hats to buy ice cream.",
  "date": "December 05, 2026, 03:15 AM",
  "location": "CU Convenience Store, Cheongdam"
}
```
The Photos app will automatically load it into the 3-column grid and fullscreen viewer!

---

## ⚙️ How to Customize Messages, Names, & PINs

- **Lock Screen PIN**: Open [`data/config.json`](data/config.json) and change `"pin": "0520"`.
- **Secret Note PIN**: Open [`data/config.json`](data/config.json) and change `"pin": "1204"` under note 3.
- **Messages & Contacts**: Open [`data/chats.json`](data/chats.json) to edit or add new conversations, messages, and typing triggers.

---

## 🚀 Running Locally & Deploying

### Running Locally:
```bash
python -m http.server 8080
```
Then visit: **`http://localhost:8080`**

### Deploying to GitHub Pages or Cloudflare Pages:
Push this folder to a GitHub repository and turn on **GitHub Pages** (Settings > Pages > Branch: `main`, Folder: `/ (root)`). No build step required!
