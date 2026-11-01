# Adding an Event to EventSapiens

> **A guide for student organizers, symposium teams, club leads, and campus ambassadors.**  
> You do **not** need to know React, TypeScript, or coding to list your college event on EventSapiens. Adding an event takes less than 3 minutes!

If you want to contribute code, fix bugs, or improve the website itself, please see **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## 🧭 Ways to Add Your Event

Choose whichever method is easiest for you:

### Method 1: In-Browser via GitHub (No terminal needed — Recommended)

1. **Fork the Repository:** Click the **Fork** button at the top right of [EventSapiens on GitHub](https://github.com/CodeSapiens-in/EventSapiens).
2. **Navigate to Events:** In your fork, go into the `events/` folder.
3. **Create a New File:** Click **Add file** → **Create new file**.
4. **Name Your File:** Use lowercase kebab-case ending with `.toml`:
   ```text
   events/<college-or-event-name>.toml
   ```
   *Examples:*  
   - `events/anna-univ-kurukshetra-2026.toml`  
   - `events/ssn-invente-hackathon-2026.toml`  
   - `events/psg-tech-kriya-fest.toml`
5. **Paste Your Event TOML:** Use the [schema template below](#-event-toml-template) and fill in your details.
6. **Open a Pull Request:** Click **Commit changes**, then click **Contribute** → **Open Pull Request**.
7. Our automated GitHub Actions bot validates your file within seconds. Once approved, your event goes live!

---

### Method 2: Using the Website TOML Generator

1. Visit [EventSapiens](https://eventsapiens.in) in your browser.
2. Scroll to the **"Host an event for students? Add it here"** section or click **Contribute**.
3. Fill out the interactive event form (title, dates, college/organizer, venue, registration URL).
4. Click **Generate TOML** — you can copy the generated file or click the direct GitHub button to create the file with pre-filled content.
5. Submit the Pull Request on GitHub.

---

### Method 3: Via Git CLI (For Developers)

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/EventSapiens.git
cd EventSapiens

# 2. Create a new branch
git checkout -b add-event-<event-name>

# 3. Create your event file inside events/
cp events/_template.toml events/my-college-hackathon.toml
# Edit events/my-college-hackathon.toml with your favorite editor

# 4. Validate your TOML file syntax and dates
bun install --frozen-lockfile
bun run validate

# 5. Commit, push, and open a PR
git add events/my-college-hackathon.toml
git commit -m "feat(event): add My College Hackathon 2026"
git push origin add-event-<event-name>
```

---

## 📝 Event TOML Template

Copy this template into your new file in `events/<your-event-slug>.toml`:

```toml
title = "Kurukshetra '26: International Techno-Management Fest"
description = "UNESCO-patronized technical festival hosted by CEG Tech Forum featuring 24-hour hackathons, robotics challenges, coding sprints, and industry masterclasses."
organizer = "CEG Tech Forum, Anna University"
category = "Symposium"
mode = "Hybrid"

# Date format: YYYY-MM-DD
event_date = "2026-11-20"
end_date = "2026-11-23"

# Registration details
registration_deadline = "2026-11-15"
registration_url = "https://kurukshetra.org.in/register"
fee = "Free to ₹150"

# Location (required for Offline and Hybrid events)
city = "Chennai"
venue = "CEG Campus, Anna University, Guindy"

# Tags for search and discovery
tags = ["Anna University", "Kurukshetra", "Hackathon", "Robotics", "Symposium"]
website = "https://kurukshetra.org.in"
contact_email = "support@kurukshetra.org.in"
```

---

## 📋 Field Specification

### Required Fields

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `title` | string | Full public name of the event | `"Invente 2026: SSN National Tech Fest"` |
| `description` | string | Clear summary of rounds, tracks, topics, or eligibility | `"A 36-hour collegiate hackathon focused on..."` |
| `organizer` | string | College name, student department, or student community | `"SSN College of Engineering"` |
| `category` | string | Choose one: `Hackathon`, `Workshop`, `Symposium`, `Conference`, `Competition`, `Meetup` | `"Hackathon"` |
| `mode` | string | Choose one: `Online`, `Offline`, or `Hybrid` | `"Offline"` |
| `event_date` | string | Start date formatted strictly as `YYYY-MM-DD` | `"2026-11-14"` |

### Optional Fields

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `end_date` | string | Last date if the event spans multiple days (`YYYY-MM-DD`) | `"2026-11-16"` |
| `registration_deadline` | string | Last date students can register (`YYYY-MM-DD`) | `"2026-11-08"` |
| `registration_url` | string | Direct link to Devfolio, Unstop, Google Form, or event portal | `"https://unstop.com/o/..."` |
| `city` | string | City where event is held (required for Offline/Hybrid) | `"Chennai"`, `"Coimbatore"`, `"Madurai"`, `"Trichy"` |
| `venue` | string | Specific hall, campus, or lab name | `"Turing Auditorium, Dept of CSE"` |
| `fee` | string | Registration cost or free admission | `"Free"` or `"₹200 per team"` |
| `tags` | array | Keywords for search filtering | `["Web3", "AI", "Students", "Tamil Nadu"]` |
| `website` | string | Official festival or club landing page | `"https://mycollegefest.in"` |
| `contact_email` | string | Student coordinator or faculty inquiry email | `"fest@college.edu"` |

---

## 🔀 Multi-Stage Hybrid Events

If your event has multiple phases (such as an online abstract submission followed by an in-person campus grand finale), use `[[stages]]`:

```toml
title = "Tamil Nadu Student Innovation Challenge"
description = "A statewide innovation sprint for engineering and polytechnic students."
organizer = "EDII Tamil Nadu"
category = "Competition"
mode = "Hybrid"
event_date = "2026-11-10"
end_date = "2026-11-28"

[[stages]]
name = "Stage 1: Online Ideation & Abstract Submission"
date = "2026-11-10"
mode = "Online"

[[stages]]
name = "Stage 2: Regional Pitch & Mentorship"
date = "2026-11-18"
mode = "Online"

[[stages]]
name = "Stage 3: 24h State Finale"
date = "2026-11-28"
mode = "Offline"
venue = "EDII Campus, Chennai"
```

---

## ⚠️ Important Guidelines & Rules

1. **One Event Per File:** Never append your event to someone else's file. Every single event belongs in its own `.toml` file under `events/`.
2. **File Naming:** Filenames must be lowercase, use hyphens instead of spaces, and end with `.toml` (e.g. `events/mit-samhita-2026.toml`).
3. **Never Edit `src/data/archived.json`:** When an event ends, our automated monthly archiving workflow safely moves it to the archive. Manual edits to this file will cause CI validation errors.
4. **Date Format:** Always write dates in ISO format (`YYYY-MM-DD`). For example, `2026-11-05`. Never use `05/11/2026` or `Nov 5`.
5. **No Broken Links:** Ensure your registration URL or website link is working and accessible without login barriers.
6. **Legitimate Student Events Only:** Events must be targeted at students, collegiate developers, polytechnic colleges, or campus communities.

---

## 🤝 Need Help or Want to Chat?

If you run into any trouble creating your file or opening a PR:
- Join the **CodeSapiens WhatsApp Community**: [chat.whatsapp.com/IiaPFDThmGk9UEoYzvoXWU](https://chat.whatsapp.com/IiaPFDThmGk9UEoYzvoXWU)
- Connect with us on **LinkedIn**: [linkedin.com/company/codesapiens-community](https://www.linkedin.com/company/codesapiens-community/posts/)
- Open a GitHub Issue: [github.com/CodeSapiens-in/EventSapiens/issues](https://github.com/CodeSapiens-in/EventSapiens/issues)
