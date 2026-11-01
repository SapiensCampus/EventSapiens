# Contributing Code & Website Edits to EventSapiens

Thank you for your interest in improving **EventSapiens**!

---

> 📢 **Looking to submit a college event, hackathon, or symposium?**  
> You don't need to touch any code! Please follow our dedicated **[ADDING_AN_EVENT.md](ADDING_AN_EVENT.md)** guide.
>
> **This guide (`CONTRIBUTING.md`) is specifically for software developers** who want to fix bugs, build new features, enhance the UI/UX, or improve the developer tooling of the EventSapiens platform.

---

## 🛠️ Tech Stack & Philosophy

EventSapiens is built with modern web technologies:

- **Frontend Framework:** React 19
- **Language:** TypeScript (strict mode)
- **Bundler & Dev Server:** Vite 8
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/vite`)
- **Icons:** Lucide React (`lucide-react`)
- **TOML Parsing:** `smol-toml`
- **Decentralized Storage:** Flat TOML files in `events/` + JSON archive in `src/data/archived.json`

### Design Principles (Anti-Slop & Zero-Pill Discipline)
- **Palette:** Warm cream background (`#FFF8DC`) with vibrant yellow accent (`#FFDE59`) and pure black text/accents.
- **Neobrutalist Tactility:** Crisp solid borders (`border-2 border-black`), hard box shadows (`shadow-[3px_3px_0px_#000]`), and tactile active press states (`active:translate-x-[2px] active:translate-y-[2px]`).
- **Zero-Pill Discipline:** Avoid rounded pills or floating capsules. Use clean, geometric rectangular badges and sharp typography.
- **Unobtrusive Discovery:** Fast client-side filtering without heavy page reloads or jarring transitions.

---

## 🏗️ Repository Architecture

```text
eventsapiens/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── incorrect_event_info.md     # Template for event reporting
│   ├── workflows/
│   │   ├── archive-events.yml          # Monthly automated archiving cron job
│   │   └── validate-events.yml         # CI check: schema validation & TypeScript lint
│   └── pull_request_template.md        # Pull request template
├── events/                             # Active student events in individual TOML files
│   ├── _template.toml                  # Contributor template
│   ├── anna-univ-kurukshetra-2026.toml
│   ├── ssn-invente-national-symposium.toml
│   └── ...
├── scripts/
│   ├── archive-events.ts               # CLI script to transition concluded events
│   └── validate-events.ts              # Schema & date validation runner
├── src/
│   ├── components/                     # React components
│   │   ├── ContributeModal.tsx         # Interactive in-app TOML generator modal
│   │   ├── ContributeSection.tsx       # Bottom CTA banner
│   │   ├── EventCard.tsx               # Individual event card
│   │   ├── EventDetailModal.tsx        # Event modal view with calendar links
│   │   ├── EventDiscoveryBar.tsx       # Search and filter toolbar
│   │   ├── Footer.tsx                  # Community attribution & links
│   │   ├── HeroIntro.tsx               # Hero banner and call to actions
│   │   ├── MonthSection.tsx            # Chronological event grouping
│   │   ├── Navbar.tsx                  # Top navigation and mobile menu
│   │   ├── PastEventsPage.tsx          # Historical archive view
│   │   └── TamilNaduTechCard.tsx       # Attribution card to tamilnadu.tech
│   ├── data/
│   │   └── archived.json               # Concluded events historical archive
│   ├── lib/
│   │   ├── event-toml.ts               # Safe TOML generation and escaping
│   │   ├── event-utils.ts              # Date parsing, validation, and filtering
│   │   └── events-loader.ts            # Vite eager TOML loader
│   ├── hooks/                           # Shared React behavior hooks
│   ├── types/
│   │   └── event.ts                    # TypeScript types and validation schemas
│   ├── App.tsx                         # Main application root
│   ├── index.css                       # Global Tailwind styles
│   └── main.tsx                        # React DOM entry point
├── ADDING_AN_EVENT.md                  # Event submission guide for organizers
├── CONTRIBUTING.md                     # Code contributor guide (this file)
├── CODE_OF_CONDUCT.md                  # Community standards
├── LICENSE                             # MIT Open Source License
├── SECURITY.md                         # Vulnerability reporting policy
├── package.json                        # Scripts and dependencies
└── vite.config.ts                      # Vite configuration
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js:** 20.19.0 or higher (Node 22 LTS recommended)
- **Bun:** 1.4.0 or higher
- **Git**

### 2. Clone and Install

```bash
# Fork the repo on GitHub, then clone your fork:
git clone https://github.com/<your-username>/EventSapiens.git
cd EventSapiens

# Install the exact dependency versions from bun.lock
bun install --frozen-lockfile
```

### 3. Start the Development Server

```bash
bun run dev
```

The app will start at `http://localhost:5173`. Hot module reloading will automatically reflect your edits.

---

## 📜 Available NPM Scripts

| Command | Purpose |
| :--- | :--- |
| `bun run dev` | Starts the Vite dev server on `http://localhost:5173` |
| `bun run build` | Compiles TypeScript and builds production distribution in `dist/` |
| `bun run lint` | Runs TypeScript compiler in `--noEmit` mode to catch type errors |
| `bun run validate` | Validates all `.toml` files in `events/` against schema and date rules |
| `bun run archive` | CLI utility to safely move concluded events into `src/data/archived.json` |
| `bun run archive:dry-run` | Previews archiving without modifying files |
| `bun run check` | Runs validation, type checking, and a production build |

---

## 🔍 How the Data Layer Works

1. **Active Events (`events/*.toml`):**  
   All active events are stored as individual TOML files in `/events/`. They are bundled at build time using Vite's eager glob import (`src/lib/events-loader.ts`).
2. **Archived Events (`src/data/archived.json`):**  
   Events that have already taken place are archived into `archived.json`. This keeps the active `events/` directory clean and fast while retaining historical listings for students.
3. **Dynamic Date Partitioning (`src/lib/event-utils.ts`):**  
   Events are automatically categorized into "This Month" and "Upcoming Months" based on their `event_date`. Month groups are never hardcoded.

---

## 🚀 Submitting a Code Pull Request

1. **Create a Feature Branch:**
   ```bash
   git checkout -b feat/my-improvement
   # or
   git checkout -b fix/issue-description
   ```

2. **Verify Quality Before Committing:**
   ```bash
   bun run check
   ```

3. **Commit Your Changes:**
   Use clear, descriptive commit messages:
   ```bash
   git commit -m "feat(filter): add quick filter for free admission events"
   ```

4. **Push and Open a PR:**
   Push your branch to your fork and submit a Pull Request to `main`. Fill in the PR template details.

---

## 💛 Community & Support

EventSapiens is an open-source initiative brought to you by **CodeSapiens TamilNadu**, initiated by **Kee** ([Keerthana](https://www.linkedin.com/in/keerthana-m-g-12ba59256/)) and **JK** ([Jayakanth](https://www.linkedin.com/in/jayakanth-sivakumar-434851257/)).

- **WhatsApp:** [Join our community chat](https://chat.whatsapp.com/IiaPFDThmGk9UEoYzvoXWU)
- **LinkedIn:** [CodeSapiens Community](https://www.linkedin.com/company/codesapiens-community/posts/)
- **YouTube:** [@codesapiens-in](https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi)
- **Instagram:** [@codesapiens.in](https://www.instagram.com/codesapiens.in/)
- **Inspiration:** [tamilnadu.tech](https://tamilnadu.tech)
