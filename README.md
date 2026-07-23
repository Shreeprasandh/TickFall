# ⏱️ TickFall

> **An asymmetric split-screen action game built with native JavaScript and HTML5 Canvas.**
> *A high-stakes 1v1 battle of descent versus pursuit where two players fight over a single shared clock.*

---

## 📖 Overview

**TickFall** is a split-screen 1v1 action web game inspired by vertical faller mechanics — reinvented as an asymmetric battle over time itself.

- **Left Panel:** **CIPHER** (The Thief) — Descends from Floor 40 toward the ground exit with the stolen diamond.
- **Right Panel:** **VALE** (The Detective) — Ascends from Floor 1 toward the bomb room to diffuse the device and arrest Cipher.
- **Center Clock:** One shared **bomb countdown timer**. Cipher's actions accelerate the clock toward detonation, while Vale's actions delay it to gain time for the arrest.

---

## ✨ Key Features

- **Asymmetric Split-Screen Engine:** Two simultaneous render panels running on a fixed 60 FPS physics loop.
- **Dynamic Time Frames:** Selectable 7-minute (Short), 14-minute (Standard), or 21-minute (Extended) match limits with scaling timer thresholds and Sudden Death mechanics.
- **60+ Interactive Objects:** Across 18 distinct floor themes (Office, Gym, Server Room, Art Gallery, Nightclub, Laboratory, etc.), featuring destructibles, traps, vehicles, and hidden vaults.
- **Realistic Operative Abilities:** 6 unique tools per role, including Carbon Wires, Signal Jammers, Crowbar Dashes, Stun Batons, Infrared Scanners, and Radio Bursts.
- **Procedural Motivic Piano Music Engine:** Zero audio files used for music. Real-time Web Audio API synthesis generating an evolving E minor pentatonic theme that scales smoothly with match intensity.
- **In-Run Economy & Store:** Earn Heist Chips mid-run to buy single-use tools at **The Fence** (a shady NPC appearing every 8 floors). Convert chips to Vault Coins post-match to unlock cosmetic visors, outfits, and trails.
- **Solo Bot AI:** Train against an adaptive AI bot with 3 difficulty levels (Easy, Medium, Hard) across both roles.
- **Real-Time 1v1 Multiplayer:** Low-latency online multiplayer with room code sharing powered by PartyKit WebSockets.
- **Responsive Controls:** Complete support for PC Keyboard (with same-keyboard co-op) and Mobile Touch Controls (virtual D-pad & gesture swipes).

---

## 🎮 Controls

### 🕵️ Cipher (Thief — Left Panel)
| Action | PC Key | Mobile Gesture |
|--------|--------|----------------|
| Move Left / Right | `A` / `D` or `←` / `→` | Virtual D-Pad |
| Jump | `W` / `↑` / `Space` | Tap Jump Button / Swipe Up |
| Floor Stomp | `S` / `↓` | Tap Stomp Button / Swipe Down |
| Interact with Object | `E` | Contextual Button |
| Use Ability | `Q` | Ability Icon |

### 👮 Vale (Detective — Right Panel)
| Action | PC Key | Mobile Gesture |
|--------|--------|----------------|
| Move Left / Right | `←` / `→` | Virtual D-Pad |
| Jump / Motorized Grapple | `↑` / `Space` | Tap Jump Button |
| Slide Under Obstacles | `↓` | Tap Slide Button |
| Interact / Arrest Stunned Thief | `Enter` / `/` | Contextual Button |
| Use Ability | `Shift` | Ability Icon |

---

## 🛠️ Tech Stack

- **Core Logic:** Vanilla JavaScript (ES Modules, Zero External Game Libraries)
- **Rendering:** Dual HTML5 Canvas API with layer caching and dampening camera lerp
- **Audio:** Web Audio API (real-time oscillator synthesis + ConvolverNode reverb)
- **Styling:** Modern Vanilla CSS (Custom Properties, Glassmorphism, Responsive Grid)
- **Multiplayer Backend:** PartyKit (Cloudflare Workers WebSocket infrastructure)
- **Storage:** LocalStorage (Scores, Achievements, Vault Coins, Settings)

---

## ⚙️ Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shreeprasandh/TickFall.git
   cd TickFall
   ```

2. **Serve the project:**
   Since native ES Modules are used, run a local development server (e.g. VS Code Live Server, `npx serve`, or `python -m http.server`):
   ```bash
   npx serve ./
   ```

3. **Open in browser:**
   Navigate to `http://localhost:3000` or your local server address.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
