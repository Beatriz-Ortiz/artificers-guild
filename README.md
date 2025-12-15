# 🎮 Artificer’s Guild — Interactive CV

> An interactive, D&D-inspired pixel art game that represents my professional journey as a Full Stack Developer.  
> Not a traditional résumé — a playable experience.

---

## 🧙‍♀️ What is Artificer’s Guild?

**Artificer’s Guild** is a web-based interactive CV built as a small RPG-style experience.  
Instead of scrolling through a PDF, visitors explore a pixel-art world where each part of my curriculum is represented as a location, system or interaction.

This project is intentionally designed to show **how I think, design and build software**, not just what technologies I know.

---

## 🗺️ The World

The hub is inspired by classic RPGs and Dungeons & Dragons:

- 🏛️ **Guild Hall** → Professional experience & education
- 🔮 **Spellbook** → Technical skills & tools
- 🔨 **Forge** → Projects & products
- 🌀 **Portal** → Contact, links & recruiter mode

Each building opens a different section of the CV through an interactive UI.

---

## ✨ Why this project?

Traditional CVs are:

- static
- generic
- limited in how much personality they convey

This project aims to:

- demonstrate frontend architecture
- show product and UX thinking
- combine creativity with engineering
- stand out without sacrificing clarity

Yes, it’s overkill for a CV.  
That’s exactly the point.

---

## 🧩 Features

- 🎮 RPG-style interactive hub
- 🎨 Custom pixel-art assets
- 🌍 Bilingual content (ES / EN)
- 🧱 Modular architecture (React + Phaser)
- 📜 Recruiter Mode (classic CV view)
- 💾 Data-driven content (JSON-based)
- ⚙️ Clean separation between UI and game logic

---

## 🛠️ Tech Stack

**Frontend**

- React
- TypeScript
- Vite

**Game / Interaction**

- Phaser 3

**UI / UX**

- Custom pixel-art UI
- Asset-based design system

**Other**

- LocalStorage
- JSON-driven content
- Modular scene management

---

## 📁 Project Structure

```text
src/
 ├─ game/        # Phaser scenes and game logic
 ├─ ui/          # React UI (panels, recruiter mode)
 ├─ data/        # CV content (ES / EN)
 ├─ i18n/        # Language handling
 └─ assets/      # Pixel art (characters, buildings, UI)

public/
 └─ assets/      # Game-ready pixel art assets
```
