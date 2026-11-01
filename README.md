# EventSapiens

> **Namma ooru student events**  
> A shared place for students across Tamil Nadu to discover college hackathons, technical symposiums, workshops, and student developer opportunities.

[![Validate Events & Lint](https://img.shields.io/badge/CI-Validate%20Events-amber.svg)](https://github.com/CodeSapiens-in/EventSapiens/actions)

---

## 🧭 How to Contribute

We have two distinct contribution paths depending on what you're looking to do:

| What do you want to do? | Guide to follow | Technical background needed? |
| :--- | :--- | :--- |
| **List or update a college event** | 📖 **[ADDING_AN_EVENT.md](ADDING_AN_EVENT.md)** | **None!** Takes 3 minutes via browser or in-app generator. |
| **Improve website code or design** | 💻 **[CONTRIBUTING.md](CONTRIBUTING.md)** | React, TypeScript, Tailwind CSS, Vite. |

---

## ✨ Features

- **Chronological Month-Based Listings:** Clear "This Month" section followed by upcoming months, derived dynamically from each event's `event_date`.
- **Decentralized TOML Data Architecture:** Every active event lives in its own file in `events/<event-slug>.toml`. Contributors never face merge conflicts on a central JSON file.
- **Unobtrusive Discovery Controls:** Filter by mode (Online, Offline, Hybrid), category (Hackathon, Workshop, Symposium, Competition, Meetup), and instant text search.
- **Multi-Stage Hybrid Events:** Full support for hackathons with online preliminary rounds and in-person grand finales.
- **Student-First Event Details:** Full modal view with deep link URL hash support (`#event-slug`) and direct registration links.
- **Past Events Archive:** Historical view grouped chronologically by month and year from `src/data/archived.json`.
- **Built-in TOML Generator:** Interactive in-app generator helping first-time student contributors create error-free TOML files with 1-click copy or direct GitHub PR links.
- **Automated Monthly Archiving:** Idempotent CLI script and GitHub Actions cron job that safely transitions completed events into `archived.json`.
- **Neobrutalist Tactile Styling:** Warm cream background (`#FFF8DC`), yellow accent (`#FFDE59`), solid borders, crisp drop shadows, and zero-pill typographic discipline matching CodeSapiens.

---

## 🏗️ Architecture & Project Structure

```text
eventsapiens/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── incorrect_event_info.md     # Template for event reporting
│   ├── workflows/
│   │   ├── archive-events.yml          # Monthly automated archiving cron job
│   │   └── validate-events.yml         # CI check: schema validation & TypeScript lint
│   └── pull_request_template.md        # Pull request template (events & code edits)
├── events/                             # Active student events in individual TOML files
│   ├── _template.toml                  # Contributor template
│   ├── anna-univ-kurukshetra-2026.toml
│   ├── ssn-invente-national-symposium.toml
│   └── ...
├── scripts/
│   ├── archive-events.ts               # CLI script to transition concluded events
│   └── validate-events.ts              # Schema & date validation runner
├── src/
│   ├── components/                     # Modular React UI components
│   │   ├── ContributeModal.tsx         # Interactive in-app TOML generator modal
│   │   ├── ContributeSection.tsx       # Bottom CTA banner
│   │   ├── EventCard.tsx               # Individual event card
│   │   ├── EventDetailModal.tsx        # Detailed modal with calendar links
│   │   ├── EventDiscoveryBar.tsx       # Search and filter toolbar
│   │   ├── Footer.tsx                  # Attribution & community links
│   │   ├── HeroIntro.tsx               # Hero banner and call to actions
│   │   ├── MonthSection.tsx            # Chronological event grouping
│   │   ├── Navbar.tsx                  # Top navigation and mobile menu
│   │   ├── PastEventsPage.tsx          # Historical archive view
│   │   └── TamilNaduTechCard.tsx       # Attribution card to tamilnadu.tech
│   ├── data/
│   │   └── archived.json               # Concluded events historical archive
│   ├── lib/
│   │   ├── event-toml.ts               # Safe contributor TOML serialization
│   │   ├── event-utils.ts              # Date calculations, statuses, validation
│   │   └── events-loader.ts            # Vite eager TOML loader
│   ├── hooks/
│   │   └── useModalLifecycle.ts         # Shared accessible modal behavior
│   ├── types/
│   │   └── event.ts                    # TypeScript types & schemas
│   ├── App.tsx                         # Main app root
│   ├── index.css                       # Global Tailwind styles
│   └── main.tsx                        # React DOM entry point
├── ADDING_AN_EVENT.md                  # Dedicated guide for event submissions
├── CONTRIBUTING.md                     # Dedicated guide for developer code edits
├── CODE_OF_CONDUCT.md                  # Community standards
├── LICENSE                             # MIT Open Source License
├── SECURITY.md                         # Private vulnerability reporting policy
├── package.json                        # Scripts & dependencies
└── vite.config.ts                      # Vite configuration
```

---

## 🚀 Getting Started (Developers)

### Prerequisites
- Node.js 20.19+ (Node.js 22 LTS recommended)
- Bun 1.4+

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/CodeSapiens-in/EventSapiens.git
cd EventSapiens

# Install the exact locked dependencies
bun install --frozen-lockfile

# Start Vite development server
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Scripts & Tooling

| Command | Description |
| :--- | :--- |
| `bun run dev` | Starts the Vite development server on port 5173 |
| `bun run build` | Compiles TypeScript and builds the production bundle |
| `bun run lint` | Runs strict TypeScript type checking (`tsc --noEmit`) |
| `bun run validate` | Validates all active TOML files against schema, dates, and duplicate rules |
| `bun run archive` | Transitions concluded events from `events/*.toml` into `src/data/archived.json` |
| `bun run archive:dry-run` | Previews archiving without modifying files |
| `bun run check` | Runs validation, type checking, and a production build |

---

## 💛 Attribution & Community

- **Brought to you by:** [CodeSapiens TamilNadu](https://codesapiens.in)
- **Inspiration:** [TamilNadu.tech](https://tamilnadu.tech/) — an inspiring open-source initiative uniting tech community meetups across Tamil Nadu.
- **WhatsApp Community:** [Join CodeSapiens Chat](https://chat.whatsapp.com/IiaPFDThmGk9UEoYzvoXWU)
- **LinkedIn:** [CodeSapiens Community](https://www.linkedin.com/company/codesapiens-community/posts/)
- **YouTube:** [@codesapiens-in](https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi)
- **Instagram:** [@codesapiens.in](https://www.instagram.com/codesapiens.in/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
