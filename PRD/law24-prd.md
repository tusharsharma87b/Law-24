# Law24 — Product Requirements Document
> **Version:** 2.0 — Full Execution  
> **Platform:** Mobile App · React Native (Expo) · iOS + Android  
> **Design Reference:** Cred (premium dark UI) · Astroyogi (per-minute expert model)  
> **Status:** Engineering Ready  
> **Date:** April 2026  
> **Classification:** Confidential

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Design System & Screen Resolutions](#2-design-system--screen-resolutions)
3. [Information Architecture & Navigation](#3-information-architecture--navigation)
4. [Screen-by-Screen Specifications](#4-screen-by-screen-specifications)
5. [Payment Gateway — Indian Users](#5-payment-gateway--indian-users)
6. [Lawyer Profile — Full Specification](#6-lawyer-profile--full-specification)
7. [NyayaAI Engine Specification](#7-nyayaai-engine-specification)
8. [Case OS — Full Specification](#8-case-os--full-specification)
9. [Multilingual Support — Lawyer & User Languages](#9-multilingual-support--lawyer--user-languages)
10. [AI Training Data — Indian Law Sources](#10-ai-training-data--indian-law-sources)
11. [Regional Law Coverage](#11-regional-law-coverage)
12. [Technical Architecture](#12-technical-architecture)
13. [API Specifications](#13-api-specifications)
14. [Security & Compliance](#14-security--compliance)
15. [Subscription & Monetization](#15-subscription--monetization)
16. [Notification System](#16-notification-system)
17. [Development Phases & Timeline](#17-development-phases--timeline)
18. [Success Metrics & KPIs](#18-success-metrics--kpis)
19. [Risk Register](#19-risk-register)

---

## 1. Product Overview

**Law24** is a mobile-first AI legal assistant and lawyer marketplace that makes legal help instant, affordable, and accessible to every Indian — regardless of language, location, or income.

### Two Core Products

| Product | What It Does |
|---------|-------------|
| **NyayaAI** | AI legal assistant — takes plain-language input, classifies the legal issue, predicts success probability, gives legal basis grounded in Indian case law, and recommends step-by-step actions |
| **Lawyer Marketplace** | Verified lawyer discovery, profile viewing, and consultation via chat (per-minute billing like Astroyogi) or call booking |

### Primary User Flow

```
Login (OTP / Google / Email / Truecaller)
  → Home (NyayaAI Hub + Live Experts + Top Rated)
  → Describe Issue → NyayaAI Analysis (prediction + legal basis + actions)
  → Find Matched Lawyers → Lawyer Profile (cases won, courts, languages, fees)
  → Book Consultation → Payment (UPI / Wallet / Card)
  → Chat (per-minute) or Booked Call
  → Case OS (dashboard for ongoing case)
      → Timeline + Docs + AI Chat + Lawyer tab
  → Profile (wallet, subscription, activity)
```

### Design Philosophy

- **Dark premium UI** like Cred — deep navy backgrounds, gold CTAs, clean type, zero clutter
- **Expert marketplace UX** like Astroyogi — per-minute billing, live expert status, quick connect
- **Trust signals everywhere** — verified badges, Bar Council IDs, win rates, court history, language filters

---

## 2. Design System & Screen Resolutions

### 2.1 Target Device Resolutions

Engineers must test and ensure pixel-perfect rendering across all of the following:

| Device | Logical Resolution | Pixel Density | Priority |
|--------|-------------------|---------------|----------|
| iPhone SE 3rd Gen | 375 × 667 pt | @2x | Medium |
| iPhone 13 Mini | 375 × 812 pt | @3x | High |
| iPhone 13 / 14 | 390 × 844 pt | @3x | **Primary iOS** |
| iPhone 14 Plus | 428 × 926 pt | @3x | High |
| iPhone 14 Pro | 393 × 852 pt | @3x | High |
| iPhone 14 Pro Max / 15 Pro Max | 430 × 932 pt | @3x | High |
| iPhone 15 / 15 Pro | 393 × 852 pt | @3x | **Primary iOS** |
| Samsung Galaxy S23 / S24 | 393 × 851 pt | @2.625x | **Primary Android** |
| Samsung Galaxy A54 | 360 × 800 pt | @2x | High India |
| Samsung Galaxy A14 | 360 × 780 pt | @2x | Medium India |
| Google Pixel 7 | 412 × 915 pt | @2.625x | Medium |
| OnePlus 11 / 12 | 412 × 919 pt | @3x | Medium |
| Redmi Note 12 (popular in India) | 393 × 873 pt | @2.75x | **High India** |
| Realme / Oppo mid-range | 360 × 800 pt | @2x | High India |

### 2.2 Safe Areas

```
iOS:
  Status bar (notch devices):         44 pt
  Status bar (Dynamic Island):        59 pt
  Bottom home indicator:              34 pt
  Minimum touch target:               44 × 44 pt

Android:
  Status bar:                         24–27 dp
  Navigation bar (gesture mode):      0 dp
  Navigation bar (3-button):          48 dp
  Minimum touch target:               48 × 48 dp
```

### 2.3 Color Tokens

```
Backgrounds
  bg-primary:       #0D1117    main screen background
  bg-secondary:     #161B22    card / panel background
  bg-tertiary:      #1C2128    input fields
  bg-elevated:      #21262D    elevated cards
  bg-overlay:       rgba(0,0,0,0.7)

Accents
  gold:             #F5A623    primary CTA, highlights
  gold-dim:         #C9A84C    secondary accents
  gold-subtle:      rgba(245,166,35,0.12)
  blue:             #3B7DD8    info, links, active states
  blue-subtle:      rgba(59,125,216,0.12)

Text
  text-primary:     #F0F6FC    main text
  text-secondary:   #8B949E    subtext, labels
  text-tertiary:    #484F58    placeholders, disabled
  text-inverse:     #0D1117    text on gold buttons

Semantic
  success:          #3FB950
  warning:          #D29922
  danger:           #F85149
  info:             #58A6FF

Borders
  border:           #30363D    default
  border-subtle:    #21262D    dividers
  border-active:    #F5A623    focused inputs
```

### 2.4 Typography Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display-xl` | 32 pt | 700 | 1.2 | Hero titles |
| `display-lg` | 28 pt | 700 | 1.25 | Screen main titles |
| `display-md` | 24 pt | 600 | 1.3 | Section headers |
| `heading` | 20 pt | 600 | 1.35 | Card titles, result titles |
| `subheading` | 17 pt | 500 | 1.4 | Sub-sections, lawyer names |
| `body-lg` | 16 pt | 400 | 1.6 | Primary body text |
| `body` | 14 pt | 400 | 1.6 | Standard body |
| `body-sm` | 13 pt | 400 | 1.5 | Secondary body |
| `caption` | 12 pt | 400 | 1.4 | Labels, metadata |
| `micro` | 11 pt | 400 | 1.3 | Badges, timestamps |

**Font family:** `DM Sans` (primary) + `DM Serif Display` (hero titles) — both on Google Fonts.

### 2.5 Spacing (8-pt grid)

```
xs: 4   sm: 8   md: 12   lg: 16   xl: 20
2xl: 24   3xl: 32   4xl: 40   5xl: 48   6xl: 64
```

### 2.6 Component Specs

| Component | Height | Border Radius | Background | Notes |
|-----------|--------|---------------|------------|-------|
| Primary Button | 52 pt | 12 pt | gold (#F5A623) | Text: text-inverse, 600 weight |
| Secondary Button | 52 pt | 12 pt | transparent | Border 1pt gold, text: gold |
| Ghost Button | 44 pt | 8 pt | transparent | Text: gold, no border |
| Text Input | 56 pt | 10 pt | bg-tertiary | Border 1pt; active: border-active (gold) |
| OTP Input Box | 52 × 56 pt | 10 pt | bg-tertiary | 1 digit per box, 6 boxes, gap 10pt |
| Card | auto | 16 pt | bg-secondary | Padding 16pt all sides |
| Chip / Tag | 32 pt | 100 pt | bg-elevated | Padding 0 14pt |
| Avatar (list) | 48 pt circle | 50% | bg-elevated | Initials fallback |
| Avatar (profile) | 80 pt circle | 50% | bg-elevated | Verified badge overlay |
| Bottom Nav | 56 pt + safe area | — | bg-secondary | Border-top 1pt border-subtle |
| Bottom Sheet | auto | 24 pt top only | bg-secondary | Drag handle: 4 × 32 pt centered |
| Badge | 20 pt | 100 pt | varies | Font micro 11pt |

---

## 3. Information Architecture & Navigation

### 3.1 Bottom Tab Navigation (5 Tabs)

```
Tab 1: Home        (house icon)       NyayaAI hub + expert discovery
Tab 2: Activity    (clock icon)       notifications + consultation history
Tab 3: Cases       (briefcase icon)   Case OS dashboard
Tab 4: Documents   (file icon)        all uploaded docs
Tab 5: Profile     (person icon)      wallet, subscription, settings
```

### 3.2 Full Screen Map

```
App
├── Auth Flow (no tab bar)
│   ├── Splash Screen
│   ├── Login Screen
│   └── OTP Verification Screen
│
├── Tab 1: Home
│   ├── Home Screen (NyayaAI Hub)
│   ├── NyayaAI Chat / Analysis Screen
│   │   └── Save to Case OS
│   ├── Find a Lawyer Screen (AI-matched)
│   ├── Lawyer Listing Screen
│   └── Lawyer Profile Screen
│       ├── Overview Tab
│       ├── Cases Tab (win rate, case types)
│       ├── Courts Tab
│       ├── Reviews Tab
│       └── Contact Tab
│           ├── Chat Screen (per-minute billing)
│           └── Call Booking Screen
│
├── Tab 2: Activity
│   ├── Notification Feed
│   └── Notification Settings Screen
│
├── Tab 3: Cases (Case OS)
│   ├── Case OS Dashboard
│   ├── Case Timeline Screen
│   ├── Case Docs Screen
│   ├── Case AI Chat Screen
│   └── Case Lawyer Screen
│
├── Tab 4: Documents
│   ├── All Documents
│   ├── Folder View
│   └── Document Viewer
│
└── Tab 5: Profile
    ├── Profile Screen
    ├── Wallet Screen
    ├── Payment Screen
    ├── Subscription Screen
    ├── Transaction History
    └── Settings Screen
```

---

## 4. Screen-by-Screen Specifications

### 4.1 Splash Screen

- Duration: 2 seconds
- Background: bg-primary (#0D1117)
- Center: LAW24 logo (gold wordmark, 120pt wide)
- Below: *"Legal Help Made Simple."* (body-lg, text-secondary)
- Bottom: version string (micro, text-tertiary)
- Logic: if valid auth token exists → skip to Home

---

### 4.2 Login Screen *(Image 1)*

**Top to bottom layout:**

```
[Status Bar]
[LAW24 — gold wordmark, center, 32pt]
["Legal Help Made Simple." — display-lg, white, center]
["Describe your issue. Get clear legal guidance." — body, text-secondary, center]
[32pt gap]
["MOBILE NUMBER" — caption label, left-aligned]
[Input: "+91 | Enter your mobile number" — numeric keyboard]
[16pt gap]
[Primary Button: "Continue Securely"]
[16pt gap]
["PRIVATE · SECURE · VERIFIED · LEGAL NETWORK" — micro, text-tertiary, center]
["Your information remains confidential." — micro, text-tertiary]
[24pt gap]
[Row: "Receive updates on WhatsApp" — body-sm, left | Toggle — right (default ON)]
[24pt gap]
[Divider row: "Or continue with" — caption, text-tertiary]
[Social login row: Google | Email | Truecaller — each 52pt tall, bg-elevated]
[32pt gap]
[Testimonial card: bg-elevated, border-radius 16]
  ["Helped me understand my situation clearly." — italic, body-sm]
  ["— VERIFIED USER" — caption, text-secondary]
[Footer: "By continuing you agree to our Terms and Privacy Policy." — micro]
[Footer: "© 2024 LAW24 · ENCRYPTED" — micro, text-tertiary]
```

**Validation rules:**
- 10 digits, starts with 6/7/8/9
- Empty: "Please enter your mobile number"
- Invalid: "Enter a valid 10-digit Indian mobile number"

---

### 4.3 OTP Verification Screen *(Image 2)*

```
[Back arrow — top left]
[LAW24 — center, 20pt]
[40pt gap]
["Verify your number" — display-md, white, center]
["We've sent a 6-digit code to" — body, text-secondary, center]
["+91 ••••• 3123" — body, text-primary, center]
[32pt gap]
[6 OTP input boxes — 52×56 pt each, gap 10pt, border-radius 10]
  Active: border-active (gold)
  Filled: bg-elevated, text-primary
  Error: border-danger + shake animation
[24pt gap]
[Primary Button: "Verify and Continue"]
[20pt gap]
["Resend code in 25s" — caption, countdown timer]
  After countdown: "Resend OTP" ghost button
["Change mobile number" — ghost button, gold]
[Lock icon + "Your verification is secure and encrypted." — micro, text-tertiary]
["© 2024 LAW24 · ENCRYPTED" — micro]
```

**Behavior:**
- Auto-read SMS (Android SMS Retriever API / iOS autofill)
- Auto-submit when all 6 digits filled
- Resend countdown: 30 seconds
- Max resend: 3 per session
- OTP expiry: 10 minutes

---

### 4.4 Home Screen — NyayaAI Hub *(Image 4)*

```
[Status Bar]
[Top row: "Nyaya" logo left | notification bell (unread count badge) right]
[Search bar: "Search for lawyers, expertise, or issues..." — bg-tertiary, rounded 12]
[Date + greeting: "Good morning, [Name]" — caption, text-secondary]

--- NyayaAI CARD ---
[Card: bg-secondary, border-radius 16, border 1pt gold-subtle]
  [NyayaAI icon 40pt + column:]
    ["NyayaAI" — heading, gold]
    ["Get instant legal guidance in seconds." — body-sm, text-secondary]
  [3 bullets: ✓ Understand situation | ✓ Know your rights | ✓ Actionable next steps]
  [Primary Button: "Start Case Analysis"]
  ["Trusted by 10,000+ users" — micro, text-tertiary]

--- LEGAL CATEGORIES (2×2 grid) ---
[Section header: "Legal Categories" + "See all" link]
[Family Law | Employment | Property | Criminal]
(scroll reveals: Consumer | Cyber | Business | Tax)

--- NOT SURE CARD ---
[Card: bg-elevated, border-radius 12]
  ["Not sure what you need?" — subheading]
  ["Tell us your situation in plain language..." — body-sm, text-secondary]
  [Secondary Button: "Ask with AI"]

--- LIVE EXPERTS (horizontal scroll) ---
[Section header: "Live Experts" + "See All"]
[Expert cards: avatar + green dot + name + specialization + rating + "Connect Now" button]

--- TOP RATED (horizontal scroll) ---
[Section header: "Top Rated" + "See All"]
[Lawyer cards: avatar + name + specialization + rating + "Profile" button]

[Bottom Tab Navigation]
[FAB: NyayaAI — gold circle 56pt, fixed bottom-right]
```

---

### 4.5 NyayaAI Chat & Analysis Screen *(Image 5)*

```
[Top bar: "NyayaAI · YOUR LEGAL ASSISTANT" | "New Case" top-right]
[Quick chips (horizontal scroll): "Cheque bounced" | "Lost my job" | "Property dispute" | "Insurance claim rejected"]

--- USER MESSAGE BUBBLE ---
[Right-aligned, gold-subtle bg, border-radius 16 TL/TR/BL, user's query text]

--- AI RESPONSE CARD ---
[Card: bg-secondary, border-radius 16, border 1pt gold-subtle]
  [NyayaAI icon + issue title — heading, gold]
  
  [NYAYAAI PREDICTION block:]
    ["NYAYAAI PREDICTION" — micro, uppercase, text-tertiary]
    ["70–85%" — display-lg, gold]
    ["Based on similar cases in Delhi / Bombay HC" — caption, text-secondary]
  
  [LEGAL BASIS block:]
    ["LEGAL BASIS" — micro, uppercase]
    [Plain-language explanation with Act/Section cite — body-sm]
  
  [RECOMMENDED ACTIONS block:]
    ["RECOMMENDED ACTIONS" — micro, uppercase]
    [01. action one]
    [02. action two]
    [03. action three]
  
  [Disclaimer — micro, italic, text-tertiary]

--- YOUR CASE SUMMARY CARD ---
[Card: bg-elevated]
  ["YOUR CASE SUMMARY" — caption, uppercase]
  ["Archived [date] at [time]" — micro]
  [Primary Button: "Continue with Guidance"]
[Ghost Button: "Consult Lawyer"]

--- BOTTOM INPUT BAR (fixed) ---
[Text input: "Tell your legal issue..." — bg-tertiary]
[Voice mic icon] [Send button: gold circle]
```

**AI Response JSON schema:**
```json
{
  "issue_title": "Unlawful Termination & Severance Recovery",
  "category": "Employment Law",
  "prediction_range": "70-85%",
  "legal_basis": "Termination without notice is legally considered summary dismissal under Industrial Disputes Act 1947, Section 25F...",
  "applicable_acts": [
    "Industrial Disputes Act 1947, Section 25F",
    "Payment of Gratuity Act 1972"
  ],
  "recommended_actions": [
    "Secure all written contracts and the termination letter with date",
    "Send a formal Notice of Demand via registered post",
    "File a grievance with the Department of Labour within 45 days"
  ],
  "time_sensitivity": "Action recommended within 30 days",
  "risk_level": "medium",
  "matched_cases": [
    "Delhi HC 2019 - Sharma vs TechCorp India Pvt Ltd",
    "Bombay HC 2021 - Gupta vs Infosys Ltd"
  ],
  "disclaimer": "This is legal information based on publicly available Indian case law and statutes. It is not legal advice tailored to your specific situation. Consult a licensed advocate before taking legal action."
}
```

---

### 4.6 Find a Lawyer Screen — AI Matched *(Image 3)*

```
[Top bar: "← Find a Lawyer" | "Top matches for your legal issue"]
[Search bar: "Search by name, expertise, or issue"]
[Category chips: Criminal | Divorce | Property | Employment | Consumer | More...]

--- AI INSIGHT CARD ---
["BASED ON YOUR ISSUE · NYAYAAI INSIGHT" — micro, uppercase, text-tertiary]
["Cheque Bounce" — display-md, gold]
[Stats 2×2 grid:]
  [Success Rate: 92%]  [Time-to-Matter: 1,200+]
  [Timeline: 3–6 Months]  [Chances: High]
[Bullet insights:]
  [✓ Legal notice must be sent within 30 days of dishonour]
  [✓ Recommended: Banking & Recovery Specialist]
[Warning banner: bg-warning-subtle, border-left warning]
  [⚠ Delay may weaken your legal position. Act within 30 days.]
[Primary Button: "View Best Lawyers"]
[Ghost Button: "Talk to NyayaAI"]

--- TOP LAWYERS RECOMMENDED ---
["Top Lawyers Recommended" — heading | "51 available" — caption]
[Lawyer cards — each full width, bg-secondary, border-radius 16]
  [Avatar 64pt + verified badge]
  [Name + specialization + experience]
  [Stats: cases | response time]
  [Languages spoken]
  [Pricing: ₹999/session]
  [Row: "View Profile" button | "Talk to Lawyer" button]
```

---

### 4.7 Lawyer Listing Screen

**Filter bottom sheet options:**

| Filter | Type | Values |
|--------|------|--------|
| Category | Multi-select chips | 12 legal categories |
| Location | Search + GPS + remote toggle | City / state |
| Experience | Range slider | 0–25+ years |
| Fee per session | Dual slider | ₹0 – ₹10,000 |
| Chat rate | Dual slider | ₹10 – ₹100/min |
| Languages | Multi-select | 22 Indian + English |
| Rating | Star picker | 3★+ / 4★+ / 4.5★+ |
| Availability | Toggle | Now / This Week |
| Court | Multi-select | SC / HC name / District |
| Gender | Optional | Any / Male / Female |

**Sort:** Best Match · Top Rated · Lowest Fee · Fastest Response · Most Cases

**Lawyer card in list:**
```
[Avatar 56pt | Online green dot if live]
[Name — subheading | Verified badge]
[Specialization · X years exp — body-sm, text-secondary]
[Stars ★★★★★ | rating number | total reviews]
[Languages: Hindi · English + "+2 more" chip]
[Fee: "₹999/session" or "₹25/min chat"]
[Action row: "View Profile" | "Connect Now"]
```

---

### 4.8 Lawyer Profile Screen *(Full Specification)*

**5 internal tabs:** Overview | Cases | Courts | Reviews | Contact

#### Tab 1 — Overview

```
[Back | three-dot menu (report / share)]
[Avatar 80pt circle + gold verified badge overlay]
["Adv. Anjali Kapoor" — display-md, white]
["Senior Advocate · High Court" — body, text-secondary]
["Bar Council: BAR/KAR/2015/4821" — caption, text-tertiary]
["Bengaluru, Karnataka · Also serves remotely" — caption]

[Stats row — 4 cards:]
  [Cases Won: 94%] [Total Cases: 340+] [Experience: 9 yrs] [Avg Response: <5 min]

[Languages section:]
  ["Speaks" — caption, uppercase]
  [Chip row: Kannada | English | Hindi | Telugu]

[Specializations:]
  ["Specializes in" — caption]
  [Tag chips: Property Law | Landlord-Tenant | Civil | RERA]

[Bio — body text, 3–5 sentences]

[Fees card: bg-elevated, border gold-subtle]
  [Chat (per minute):   ₹25 / min]
  [30-min Video Call:   ₹1,200]
  [60-min Video Call:   ₹2,000]
  [Document Review:     ₹500 / document]
  [In-person:           ₹2,500 / hour]

[Availability — 7-day strip, available slots gold-highlighted]
```

#### Tab 2 — Cases

```
[Stats row: Total 340 | Won 94% | Lost 4% | Settled 2%]

[Case type breakdown — horizontal bar chart:]
  Property:    29%  ████████
  Criminal:    22%  ██████
  Employment:  18%  █████
  Family:      16%  ████
  Consumer:    10%  ███
  Other:        5%  █

[Recent Cases list:]
  Each row:
    [Case name + year (anonymized)]
    [Court: Karnataka High Court]
    [Result: WON / SETTLED / ONGOING badge]
    [1-line summary]
    [Acts cited: chip row]

["Case details shared with user consent. Names anonymized." — micro, italic]
```

#### Tab 3 — Courts

```
[Courts Practiced In — card list:]
  Each court card:
    [Court name — subheading]
    [Active since: 2015]
    [Cases filed: 120+]
    [Enrollment number]

[Jurisdiction — states list]

[Bar Council Enrollments:]
  [Bar Council of Karnataka: KAR/4821/2015]
  [Supreme Court of India AOR: SC/AOR/2019/1234]
```

#### Tab 4 — Reviews

```
[Summary:]
  [4.9 ★ — display-lg, gold]
  [Bar breakdown: 5★ 89% | 4★ 8% | 3★ 2% | below 1%]
  [Total: 112 reviews]

[Filter row: All | Chat | Call | In-person]

[Review cards:]
  [Initial avatar | Star rating | Date]
  [Review text]
  [Case type tag]
  ["X people found this helpful" link]
```

#### Tab 5 — Contact

```
--- CHAT CONSULTATION ---
[Card: bg-secondary, border gold-subtle]
  ["Start Chat Consultation" — heading]
  ["₹25 / minute" — display-md, gold]
  ["Minimum 10 minutes (₹250)" — caption, text-secondary]
  [Online status: 🟢 Available Now]
  [Primary Button: "Start Chat — ₹25/min"]

--- CALL BOOKING ---
[Card: bg-secondary]
  ["Book a Call Session" — heading]
  [Option chips: 30 min – ₹1,200 | 60 min – ₹2,000]
  [Date picker → time slot grid]
  [Primary Button: "Book & Pay"]

--- DOCUMENT REVIEW ---
[Card: bg-elevated]
  [Upload document for lawyer review]
  [Fee: ₹500 / document | Turnaround: 24–48 hrs]
  [Secondary Button: "Upload Document"]

--- EMERGENCY CONTACT ---
[Card: Premium Pro badge]
  ["For urgent legal matters"]
  ["Available 24/7 for Premium Pro members"]
```

---

### 4.9 Case OS Dashboard *(Image 6)*

```
[Back | "Matrimonial — Main Case" | three-dot menu]

[Case chips: 498A | Section 125 | Section 9]

[2×2 metadata grid:]
  [Case Type: Criminal Revision]  [Success Probability: 82%]
  [Urgency: 🔴 Critical]          [Current Stage: Evidence]

[Stage progress (horizontal):]
  Filing → Trial → Judgment → Closed
  [Active: gold circle + connecting gold line to next]

--- AI NEXT STRATEGY ---
[Card: bg-secondary, border-left 3pt gold]
  [Robot icon + "AI Next Strategy" — heading, gold]
  [Strategy text paragraph]
["What should you do next?" — caption]
[Gold action button: "Review Rejection Letter →"]

--- QUICK ACTIONS (2×2 grid) ---
[Add Docs]      [Call Lawyer]
[Manage Docs    [Final Step:
 12 pending]     Sign affidavit]

[Bottom tabs: Overview | Timeline | Docs | AI Chat | Lawyer]
```

---

### 4.10 Case Timeline Screen *(Images 7 & 8)*

```
[Case name + ID header]
["25 MAR" — display-lg, gold]
["Critical — Requires Action Today" — danger badge]
[Quick actions row: "Add Note" | "Add Doc"]

[Vertical timeline — connecting line:]
  Each event card:
    [Date + time — caption]
    [Color dot: gold=action | blue=info | green=done | red=urgent]
    [Event title — subheading]
    [Description text — body-sm]
    [Attached doc chips]
    [People: lawyer, judge names]
    [Next action tag if any]

[Notice Served card — distinct gold-bordered card]
```

---

### 4.11 Notification Settings Screen *(Image 9)*

```
[Back | "Settings" | gear icon]
["Notifications" — display-md]
["Configure how the silent advocate communicates..." — body, text-secondary]

[CASE ALERTS section:]
  [Toggle: Hearing reminders — "Alerts on court dates, meetings and shifts"]
  [Toggle: Action required — "Tasks requiring your immediate legal signature"]
  [Toggle: Deadline alerts — "Filing windows and discovery closings"]

[AI ALERTS section:]
  [Toggle: AI suggestions — PREMIUM PRO badge]
  ["Analysis of opposing counsel filings and trends"]

[COMMUNICATION section:]
  [Toggle: WhatsApp / SMS — "Direct briefings via encrypted messaging channel"]

[Privacy & Security card: bg-elevated]
  [Lock icon]
  ["Privacy & Security"]
  ["Ensure your notification preferences align with regional data protection standards."]

[Primary Button: "Save Settings"]
[Bottom nav: Dockets | Alerts | Chat | Settings]
```

---

### 4.12 Profile, Wallet & Subscription Screen *(Image 10)*

```
[Back | "Profile" | three-dot menu]

[Avatar 80pt circle + verified badge]
["Anjali Singh" — display-md]
["anjali.singh@corporate.law" — body, text-secondary]
[Badge row: "PREMIUM MEMBER" gold chip | "CLIENT ID: #621" gray chip]

--- WALLET & SUBSCRIPTION ---
[Subscription card: bg-secondary, border gold-subtle]
  ["CURRENT PLAN" — micro, uppercase, text-tertiary]
  ["Premium Member" — heading, gold]
  ["Expiry: 12 Jan 2026" — caption]
  [Button: "Upgrade Plan"]

[Wallet card: bg-secondary]
  ["WALLET BALANCE" — micro, uppercase]
  ["₹2,450" — display-md, gold]
  [Row: "+ Add Money" | "Transactions"]

--- RECENT ACTIVITY ---
["RECENT ACTIVITY" + "View All"]
[Activity item — Last Call:]
  [Phone icon | "Adv. Rahul Mehta" | "Wednesday, 4:30 PM — 15 mins"]
  ["Call Again" button]
[Activity item — Last Chat:]
  [Chat icon | "Adv. Priya Sharma" | message preview]
  ["Open Chat" button]
```

---

### 4.13 Payment Screen *(New screen — full spec)*

```
[Back | "Secure Payment"]
[Lock icon row + "256-bit encrypted · powered by Razorpay" — micro, text-tertiary]

--- ORDER SUMMARY CARD ---
[Lawyer avatar + name: "Adv. Anjali Kapoor"]
[Consultation type: "30-min Video Call" / "Chat (per-minute — ₹25/min)"]
[Amount: ₹1,200 / OR "Minimum wallet load: ₹250 for chat"]
[Line items: consultation fee + GST if applicable]

--- PAYMENT METHOD ---
["Choose Payment Method" — subheading]

[UPI (recommended) — expanded section:]
  [Quick pay icons: GPay | PhonePe | Paytm | BHIM]
  [Input: "Enter UPI ID (e.g. name@upi)"]
  [Button: "Pay with UPI"]

[Law24 Wallet:]
  ["Available: ₹2,450" — show balance]
  ["Pay ₹1,200 from wallet" — if sufficient]
  ["Add ₹X to proceed" — if insufficient]

[Net Banking:]
  [Dropdown: select bank (top 10 shown + search)]

[Credit / Debit Card:]
  [Card number, expiry, CVV inputs]
  [Save card toggle (encrypted)]

[EMI (subscriptions only):]
  [EMI options from major credit cards]

[Promo code input row]

--- PAY BUTTON ---
[Primary Button: "Pay Securely — ₹1,200"]
["You will be charged after the session ends" — for per-minute chat only]
["No charges until you connect" — for per-minute chat]
```

---

## 5. Payment Gateway — Indian Users

### 5.1 Primary Gateway: Razorpay

All payments processed via **Razorpay** — India's most trusted payment infrastructure. PCI-DSS Level 1 certified. No card data touches Law24 servers.

### 5.2 Supported Payment Modes

| Mode | Description | Penetration |
|------|-------------|------------|
| **UPI** | GPay, PhonePe, Paytm, BHIM, Amazon Pay, iMobile | 85%+ India |
| **UPI Intent** | Deep-link to installed UPI apps (Android-first) | Seamless |
| **UPI Collect** | Enter VPA manually — pay from any bank | Universal |
| **PhonePe SDK** | Direct PhonePe integration | 500M+ users |
| **Google Pay** | Via Razorpay + GPay intent | Android |
| **Paytm** | Paytm wallet + UPI + Paytm Postpaid | Tier 2/3 |
| **Amazon Pay** | For Amazon users | Urban |
| **BHIM UPI** | Government BHIM app | Rural + senior |
| **Net Banking** | 50+ banks via Razorpay | All banks |
| **Credit Card** | Visa, Mastercard, RuPay, Amex | Urban premium |
| **Debit Card** | All Indian bank debit cards | Mass market |
| **RuPay Card** | Government-backed, Jan Dhan | Rural inclusion |
| **Law24 Wallet** | In-app prepaid wallet | Return users |
| **EMI** | No-cost EMI on credit cards | Premium plan buyers |
| **BNPL** | LazyPay, ZestMoney via Razorpay | Young professionals |

### 5.3 Payment Flows

#### Flow A — Per-Minute Chat Billing
```
1. User opens Lawyer Profile → "Start Chat"
2. Screen: "Minimum ₹250 required in wallet for chat"
3. If wallet insufficient → Add Money flow (UPI / card / net banking)
4. User confirms → Socket connection opened → Chat begins
5. Timer visible in chat: "₹25/min · 04:32 elapsed"
6. Deduct ₹25 from wallet every 60 seconds
7. At ₹50 remaining: warning banner "Low balance — add money to continue"
8. At ₹0: chat pauses → "Add money to continue" bottom sheet
9. Session end: receipt (duration · amount · save to transactions)
```

#### Flow B — Fixed Session Booking
```
1. User picks slot on Lawyer Profile → Contact tab
2. Order summary screen
3. Select payment method → Razorpay payment sheet (native)
4. On success: booking confirmed + push + WhatsApp + calendar event
5. On failure: retry screen with alternate options
6. Escrow: funds held until session ends → released to lawyer
```

#### Flow C — Wallet Top-Up
```
1. Profile → "+ Add Money"
2. Quick amounts: ₹250 | ₹500 | ₹1,000 | ₹2,000 | Custom
3. Select method → Pay
4. Wallet credited instantly
5. Updated balance shown + micro-animation
```

#### Flow D — Subscription
```
1. Plan selection (Free / Standard ₹199/mo / Premium Pro ₹499/mo)
2. Monthly / Annual toggle
3. Payment → Razorpay recurring subscription API
4. Auto-renewal consent screen (mandatory per RBI)
5. GST-compliant invoice emailed
```

### 5.4 Refund & Escrow Policy

| Scenario | Resolution |
|----------|-----------|
| Lawyer doesn't respond within 5 min of chat | Full auto-refund to wallet |
| Lawyer cancels booked call | Full refund to source within 24 hrs |
| User cancels > 2 hrs before | Full refund |
| User cancels < 2 hrs before | 50% refund |
| Disputed consultation | Manual review within 48 hrs |
| Technical failure mid-chat | Pro-rated refund for lost minutes |

### 5.5 Wallet Rules

| Parameter | Value |
|-----------|-------|
| Minimum load | ₹50 |
| Maximum (KYC unverified) | ₹50,000 |
| Maximum (KYC verified) | ₹2,00,000 |
| Expiry | No expiry (RBI guideline) |
| Withdrawal | To source payment method, 3–5 business days |
| KYC | Aadhaar eKYC required for wallets > ₹10,000 |

### 5.6 GST & Invoicing

- Platform commission: 18% GST on Law24's commission share
- Lawyer services: GST exempt if annual turnover < ₹20L; 18% above
- Every transaction: GST-compliant PDF invoice generated and emailed
- Business users: GST number field for input tax credit

---

## 6. Lawyer Profile — Full Specification

### 6.1 Data Model

```json
{
  "id": "LAW-4821",
  "name": "Adv. Anjali Kapoor",
  "photo_url": "https://...",
  "verified": true,
  "verified_plus": false,
  "bar_council_id": "BAR/KAR/2015/4821",
  "enrollment_date": "2015-03-12",
  "designation": "Senior Advocate",
  "experience_years": 9,
  "location": {
    "city": "Bengaluru",
    "state": "Karnataka",
    "serves_remote": true,
    "serves_states": ["Karnataka", "Tamil Nadu", "Andhra Pradesh"]
  },
  "specializations": ["Property Law", "Landlord-Tenant", "Civil Disputes", "RERA"],
  "languages": ["Kannada", "English", "Hindi", "Telugu"],
  "courts": [
    { "name": "Karnataka High Court", "enrollment_no": "KAR/HC/2015/4821", "since": 2015 },
    { "name": "Supreme Court of India", "enrollment_no": "SC/AOR/2019/1234", "since": 2019 },
    { "name": "City Civil Court Bengaluru", "since": 2015 }
  ],
  "cases": {
    "total": 340,
    "won": 320,
    "lost": 14,
    "settled": 6,
    "win_rate_percent": 94.1,
    "by_category": {
      "property": 98, "criminal": 75, "employment": 62,
      "family": 55, "consumer": 35, "other": 15
    }
  },
  "fees": {
    "chat_per_minute_inr": 25,
    "call_30min_inr": 1200,
    "call_60min_inr": 2000,
    "document_review_inr": 500,
    "in_person_per_hour_inr": 2500
  },
  "availability": {
    "is_online": true,
    "next_slot": "2026-04-18T14:00:00+05:30",
    "weekly_schedule": {}
  },
  "rating": {
    "average": 4.9,
    "total_reviews": 112,
    "breakdown": { "5": 99, "4": 9, "3": 2, "2": 1, "1": 1 }
  },
  "response_time_avg_minutes": 4,
  "subscription_tier": "verified"
}
```

### 6.2 Lawyer Verification Checklist

| Document | Verification Method |
|----------|-------------------|
| Bar Council Enrollment Certificate | OCR + State Bar Council database check |
| LLB / LLM Degree | Document upload + manual check |
| Government Photo ID (Aadhaar / PAN) | DigiLocker API |
| Active practice evidence | Vakalat copies or eCourts appearance record |
| Profile photo | Face match with ID via liveness check |

- Verification SLA: 48–72 hours
- Verified badge: gold checkmark
- Verified+ badge: rating ≥ 4.5 + 50+ cases + 6+ months active

---

## 7. NyayaAI Engine Specification

### 7.1 Processing Pipeline

```
User Input (text or voice in any Indian language)
    ↓
Language Detection — fastText / IndicLID
    ↓
Translation to English — AI4Bharat IndicTrans2
    ↓
Intent Classification — identify legal domain (12 categories)
    ↓
Entity Extraction — parties, dates, amounts, locations, acts mentioned
    ↓
Vector Search — retrieve top-5 similar Indian judgments from RAG corpus
    ↓
Statute Lookup — relevant sections from India Code database
    ↓
Prompt Assembly — system prompt + cases + statutes + user query
    ↓
GPT-4o Inference — structured JSON response
    ↓
Risk Scoring + Prediction Calibration
    ↓
Disclaimer Append — mandatory
    ↓
Translate back to user's language if needed — IndicTrans2
    ↓
Render on mobile UI
```

### 7.2 12 Legal Categories

| # | Category | Key Acts |
|---|----------|---------|
| 1 | Criminal Law | IPC, CrPC, NDPS Act, Arms Act, Prevention of Corruption Act |
| 2 | Family & Matrimonial | Hindu Marriage Act, Muslim Personal Law, Special Marriage Act, DV Act, POCSO |
| 3 | Property & Real Estate | Transfer of Property Act, RERA, Registration Act, Benami Transactions Act |
| 4 | Employment & Labour | Industrial Disputes Act 1947, Labour Codes 2020, POSH Act, Payment of Wages Act |
| 5 | Consumer Protection | Consumer Protection Act 2019, Product Liability provisions |
| 6 | Banking & Finance | Negotiable Instruments Act S.138 (Cheque Bounce), SARFAESI Act, IBC 2016 |
| 7 | Civil & Contract | Indian Contract Act 1872, Specific Relief Act, Limitation Act |
| 8 | Cyber Crime | IT Act 2000, IT Amendment Act 2008, DPDPA 2023 |
| 9 | Taxation | Income Tax Act, GST Act, Customs Act |
| 10 | Corporate & Business | Companies Act 2013, Partnership Act, LLP Act |
| 11 | Immigration | Foreigners Act, Passports Act, Citizenship Act |
| 12 | Medical & Healthcare | MTP Act, PC & PNDT Act, Consumer Protection for medical negligence |

---

## 8. Case OS — Full Specification

### 8.1 Case States

```
DRAFT → ACTIVE → IN_TRIAL → JUDGMENT_PENDING → CLOSED
                           ↘ SETTLED
                           ↘ WITHDRAWN
```

### 8.2 Internal Tabs

| Tab | Content |
|-----|---------|
| Overview | Case metadata, AI strategy, urgency, quick actions |
| Timeline | Chronological events with dates, docs, people |
| Docs | All documents organized by stage |
| AI Chat | Context-aware AI assistant scoped to this case |
| Lawyer | Assigned lawyer details, contact, billing history |

### 8.3 AI Strategy Logic

The AI reads: current stage + last filed document + upcoming hearing dates + opposing counsel's last action (user-inputted). It generates: next specific action, risk flag if deadline within 48 hrs, document to prepare, updated success probability.

---

## 9. Multilingual Support — Lawyer & User Languages

### 9.1 App UI Languages

| Language | Code | Phase |
|----------|------|-------|
| English | `en` | Phase 1 |
| Hindi | `hi` | Phase 1 |
| Marathi | `mr` | Phase 2 |
| Bengali | `bn` | Phase 2 |
| Tamil | `ta` | Phase 2 |
| Telugu | `te` | Phase 2 |
| Kannada | `kn` | Phase 2 |
| Gujarati | `gu` | Phase 2 |
| Malayalam | `ml` | Phase 3 |
| Punjabi | `pa` | Phase 3 |
| Odia | `or` | Phase 3 |
| Assamese | `as` | Phase 3 |
| Urdu | `ur` | Phase 3 |
| Bhojpuri | `bho` | Phase 3 |

### 9.2 Lawyer Language Tags

Every lawyer profile lists all consultation languages. Filter by language available on listing screen.

**Full supported language list:**
Hindi · English · Marathi · Bengali · Tamil · Telugu · Kannada · Gujarati · Malayalam · Punjabi · Odia · Assamese · Urdu · Bhojpuri · Maithili · Rajasthani · Chhattisgarhi · Haryanvi · Dogri · Sindhi · Konkani · Manipuri · Bodo · Santali · Kashmiri · Tulu · Awadhi

### 9.3 Multilingual AI Pipeline

```
User input (any Indian language)
  → Language detection: fastText
  → If not English → IndicTrans2 translation to English
  → Process in English
  → Generate response in English
  → If source language ≠ English → IndicTrans2 back-translation
  → Return in user's language
```

Voice input: OpenAI Whisper supports all 14 Phase 1/2 Indian languages for speech-to-text.

---

## 10. AI Training Data — Indian Law Sources

### 10.1 Tier 1 — Official Government Sources (Primary Corpus)

All judgments are public domain under Copyright Act 1957 Section 52(1)(q). Safe to scrape and use.

| Source | Content | URL | Format | Priority |
|--------|---------|-----|--------|----------|
| **Indian Kanoon** | 150M+ docs — SC, all 25 HCs, tribunals, district courts | https://indiankanoon.org | HTML + API | 🔴 Critical |
| **Supreme Court of India** | All SC judgments 1950–present | https://sci.gov.in | PDF | 🔴 Critical |
| **eCourts Services** | District + sub-district court orders, all states | https://services.ecourts.gov.in | PDF + API | 🔴 Critical |
| **India Code** | All Central Acts + Amendments in force | https://indiacode.nic.in | XML + PDF | 🔴 Critical |
| **NJDG** | Case pendency and disposal data, all courts | https://njdg.ecourts.gov.in | JSON API | 🟠 High |
| **Ministry of Law and Justice** | Bare Acts, Law Commission Reports | https://lawmin.gov.in | PDF | 🟠 High |
| **Law Commission of India** | 277 reports across all legal domains | https://lawcommissionofindia.nic.in | PDF | 🟠 High |
| **Gazette of India** | All central legislative notifications | https://egazette.gov.in | PDF | 🟡 Medium |
| **Ministry of Labour** | Labour law acts, circulars, judgments | https://labour.gov.in | PDF | 🟠 High |
| **Ministry of Corporate Affairs** | Company Law, NCLT orders | https://mca.gov.in | PDF | 🟠 High |
| **RBI Circulars** | Banking regulations, NBFC rules | https://rbi.org.in | PDF | 🟠 High |
| **SEBI** | Securities law, SEBI orders | https://sebi.gov.in | PDF | 🟡 Medium |

### 10.2 Tier 2 — All 25 High Courts

| High Court | State(s) | Portal |
|-----------|---------|--------|
| Supreme Court | India | https://sci.gov.in |
| Delhi | Delhi | https://delhihighcourt.nic.in |
| Bombay | Maharashtra, Goa, Dadra, Daman | https://bombayhighcourt.nic.in |
| Calcutta | West Bengal, A&N Islands | https://calcuttahighcourt.gov.in |
| Madras | Tamil Nadu, Puducherry | https://hcmadras.tn.nic.in |
| Allahabad | Uttar Pradesh | https://allahabadhighcourt.in |
| Karnataka | Karnataka | https://karnatakajudiciary.kar.nic.in |
| Andhra Pradesh | Andhra Pradesh | https://hcap.nic.in |
| Telangana | Telangana | https://hcts.gov.in |
| Kerala | Kerala, Lakshadweep | https://hckerala.nic.in |
| Gujarat | Gujarat, Dadra | https://gujarathighcourt.nic.in |
| Rajasthan | Rajasthan | https://hcraj.nic.in |
| Madhya Pradesh | Madhya Pradesh | https://mphc.gov.in |
| Chhattisgarh | Chhattisgarh | https://cghc.gov.in |
| Punjab & Haryana | Punjab, Haryana, Chandigarh | https://highcourtchd.gov.in |
| Himachal Pradesh | Himachal Pradesh | https://hphighcourt.nic.in |
| Jammu & Kashmir | J&K, Ladakh | https://jkhighcourt.nic.in |
| Uttarakhand | Uttarakhand | https://highcourtofuttarakhand.gov.in |
| Patna | Bihar | https://patnahighcourt.gov.in |
| Jharkhand | Jharkhand | https://jharkhandhighcourt.nic.in |
| Orissa | Odisha | https://orissahighcourt.nic.in |
| Gauhati | Assam, Nagaland, Mizoram, Arunachal | https://gauhati.nic.in |
| Manipur | Manipur | https://mhc.nic.in |
| Meghalaya | Meghalaya | https://meghalayahighcourt.nic.in |
| Tripura | Tripura | https://tripurahighcourt.gov.in |
| Sikkim | Sikkim | https://sikkim.gov.in/judiciary |

### 10.3 Tier 3 — Specialized Tribunals

| Tribunal | Domain | URL |
|---------|--------|-----|
| NCDRC | Consumer disputes | https://ncdrc.nic.in |
| NCLT | Corporate, insolvency | https://nclt.gov.in |
| NCLAT | Company law appeals | https://nclat.nic.in |
| ITAT | Income tax | https://itat.gov.in |
| CESTAT | Customs, excise, service tax | https://cestat.gov.in |
| SAT | Securities, SEBI orders | https://sat.gov.in |
| NGT | Environmental law | https://greentribunal.gov.in |
| CAT | Government employment | https://catindia.gov.in |
| DRT / DRAT | Loan defaults, banking recovery | https://drt.gov.in |
| TDSAT | Telecom disputes | https://tdsat.gov.in |
| Armed Forces Tribunal | Military service | https://aftlko.nic.in |
| Motor Accident Claims Tribunals (MACT) | Road accidents | via eCourts state portals |
| RERA Appellate Tribunals | Real estate | State RERA portals (all 30+) |
| Labour Courts & Industrial Tribunals | Employment | State Labour Dept portals |
| Family Courts | Divorce, custody, maintenance | via eCourts state portals |
| Lok Adalat | Alternative dispute resolution | https://nalsa.gov.in |

### 10.4 Tier 4 — Premium Legal Platforms

| Platform | URL | Access | Description |
|---------|-----|--------|-------------|
| **Manupatra** | https://manupatrafast.com | Paid + API | Most comprehensive — SC, HC, tribunal with headnotes |
| **SCC Online** | https://www.scconline.com | Paid + API | Authoritative SC/HC with editorial notes |
| **Westlaw India** | https://legalsolutions.thomsonreuters.com | Paid | International platform, deep India coverage |
| **LexisNexis India** | https://www.lexisnexis.in | Paid | Case law, practice areas, forms |
| **LiveLaw** | https://livelaw.in | Free + Premium | Daily SC/HC judgments, legal news, full-text |
| **Bar & Bench** | https://barandbench.com | Free + Premium | SC/HC judgments, legal news |
| **Legal Service India** | https://legalserviceindia.com | Free | Case summaries, bare acts, articles |
| **Advocatekhoj** | https://advocatekhoj.com | Free | District court judgments, legal articles |
| **The Wire — Legal** | https://thewire.in/law | Free | Legal analysis and commentary |
| **DAKSH India** | https://dakshindia.org | Free | Judicial performance data |

### 10.5 Open Datasets for Fine-Tuning

| Dataset | Description | Source |
|---------|-------------|--------|
| **InLegalBERT** | BERT pre-trained on Indian SC/HC corpus — use as embedding model | HuggingFace: `law-ai/InLegalBERT` |
| **OpenNyAI** | Open-source Indian legal NLP datasets and models by DAKSH | https://opennyai.org |
| **IL-TUR** | Multi-task: summarization, classification, NER on Indian legal text | GitHub: `Exploration-Lab/IL-TUR` |
| **ILDC** | 35,000 SC cases with expert summaries | GitHub: `Exploration-Lab/ILDC` |
| **ILSI** | Sentence-level annotated SC/HC judgments | Academic / GitHub |
| **FIRE Legal Track** | Judgment prediction from SC corpus | FIRE conference archives |
| **SemEval Indian Legal** | Catchphrase extraction, summarization tasks | SemEval repos |
| **LawBench India** | Legal reasoning and QA benchmarks | GitHub: `PKU-YuanGroup/LawBench` |
| **AI4Bharat IndicNLP** | Multilingual NLP for 22 Indian languages | https://ai4bharat.iitm.ac.in |
| **IndicTrans2** | State-of-art translation for 22 Indian languages | HuggingFace: `ai4bharat/indictrans2` |
| **IndicLID** | Language identification for Indian languages | HuggingFace: `ai4bharat/IndicLID` |

### 10.6 Landmark Cases — Seed Dataset (Must Include)

#### Constitutional
- Kesavananda Bharati vs State of Kerala (1973) — Basic Structure Doctrine
- Maneka Gandhi vs Union of India (1978) — Article 21 right to life
- Vishaka vs State of Rajasthan (1997) — Workplace sexual harassment
- NALSA vs Union of India (2014) — Transgender rights
- Indra Sawhney vs Union of India (1992) — OBC reservations / Mandal Commission
- Olga Tellis vs Bombay Municipal Corporation (1985) — Right to livelihood

#### Criminal
- Bachan Singh vs State of Punjab (1980) — Death penalty, rarest of rare doctrine
- State of Rajasthan vs Balchand (1977) — Bail is rule, jail is exception
- Arnesh Kumar vs State of Bihar (2014) — Arrest guidelines for 498A
- DK Basu vs State of West Bengal (1997) — Rights of arrested persons
- Lalita Kumari vs Govt of UP (2014) — Mandatory FIR registration

#### Property
- Suraj Lamp & Industries vs State of Haryana (2012) — GPA property transactions
- Savvy Homes vs NCT of Delhi (2019) — RERA applicability
- Biswabani Pvt Ltd vs Santosh Kumar Dutta (1980) — Landlord-tenant rights

#### Family
- Shayara Bano vs Union of India (2017) — Triple Talaq unconstitutional
- Mary Roy vs State of Kerala (1986) — Women's inheritance (Syrian Christian)
- Githa Hariharan vs Reserve Bank of India (1999) — Mother as natural guardian
- Joseph Shine vs Union of India (2018) — Adultery decriminalized

#### Employment
- Workmen, Hindustan Steel Ltd vs Hindustan Steel Ltd (1984) — Retrenchment
- Secretary, State of Karnataka vs Umadevi (2006) — Regularization of contract workers
- Maruti Udyog vs Ram Lal (1981) — Proper termination procedure

#### Consumer
- Lucknow Development Authority vs M.K. Gupta (1994) — Government as service provider
- Spring Meadows Hospital vs Harjol Ahluwalia (1998) — Medical negligence
- Ghaziabad Development Authority vs Balbir Singh (2004) — Builder liability

#### Banking / NI Act
- M.S. Shoes East Ltd vs Bhawani Prasad Gupta (2014) — Cheque bounce S.138
- Meters and Instruments Pvt Ltd vs Kanchan Mehta (2018) — Cheque bounce compounding
- Damodar S. Prabhu vs Sayed Babalal H. (2010) — Cheque bounce compounding guidelines

#### Cyber / Digital
- Shreya Singhal vs Union of India (2015) — Section 66A IT Act struck down
- Justice K.S. Puttaswamy vs Union of India (2017) — Right to privacy fundamental right

### 10.7 RAG Pipeline Architecture

```
INGESTION PIPELINE
  Indian Kanoon scraper → HTML parser → text chunks (512 tokens)
  India Code XML → parse Acts → section-by-section chunking
  Metadata per chunk: { court, date, judges, acts_cited, outcome, category, state, language }
      ↓
EMBEDDING
  InLegalBERT or OpenAI text-embedding-3-large
  Store in Pinecone with metadata filters
  Index by: legal_category, court, state, year, acts_cited
      ↓
RETRIEVAL (at query time)
  User query → embedding
  Vector search → top-5 similar judgments
  Statute lookup → relevant sections from India Code DB
  Context assembled: [system_prompt + cases + statutes + user_query]
      ↓
GENERATION
  GPT-4o inference → structured JSON
  Post-process → format for mobile UI → disclaimer append
      ↓
DELIVERY
  Translate if needed → render on screen
```

### 10.8 Data Volume Targets

| Phase | Documents | Coverage |
|-------|-----------|---------|
| Phase 1 MVP | 50,000 | SC + Delhi / Bombay / Madras HC + all Central Acts |
| Phase 2 | 500,000 | All 25 HCs + major tribunals + state acts |
| Phase 3 | 2,000,000 | District courts + all state laws + regional language judgments |
| Phase 4 | 5,000,000+ | Complete NJDG corpus + multilingual judgments |

---

## 11. Regional Law Coverage

### 11.1 State-Specific Laws by Zone

| Zone | State | Key Regional Laws |
|------|-------|------------------|
| **North** | Delhi | Delhi Rent Control Act 1958, Delhi Land Reforms Act, Delhi Municipal Corporation Act |
| | Uttar Pradesh | UP Zamindari Abolition Act, UP Revenue Code 2006, UP RERA |
| | Punjab & Haryana | Punjab Tenancy Act 1887, Punjab Land Revenue Act, Haryana Urban Development Authority Act |
| | Rajasthan | Rajasthan Tenancy Act 1955, Rajasthan Land Revenue Act |
| | Himachal Pradesh | HP Tenancy and Land Reforms Act 1972 |
| **West** | Maharashtra | Maharashtra Rent Control Act 1999, MOFA 1963, Maharashtra Stamp Act, MahaRERA |
| | Gujarat | Gujarat Tenancy and Agricultural Lands Act 1948, Gujarat Land Revenue Code |
| | Goa | Goa Land Revenue Code, Goa Mundkar Act |
| **South** | Karnataka | Karnataka Land Reforms Act 1961, Karnataka Rent Control Act, KARERA |
| | Tamil Nadu | TN Buildings (Lease & Rent Control) Act 1960, TNRERA, Tamil Nadu Urban Land Ceiling Act |
| | Kerala | Kerala Land Reforms Act 1963, Kerala Rent Control Act |
| | Andhra Pradesh | AP Land Revenue Act, AP Assigned Lands Act, APRERA |
| | Telangana | Telangana Tenancy Act, TSRERA |
| **East** | West Bengal | West Bengal Premises Tenancy Act 1997, WB Land Reforms Act, HIRA (Housing Industry Regulation Act) |
| | Odisha | Orissa Land Reforms Act 1960, Orissa Tenancy Act, ORERA |
| | Bihar | Bihar Tenancy Act 1885, Bihar Land Reforms Act |
| | Jharkhand | Jharkhand Panchayat Raj Act, Chotanagpur Tenancy Act 1908 |
| **Northeast** | Assam | Assam Land Revenue Regulation 1886, Assam Tenancy Act |
| | Manipur | Manipur Land Revenue and Land Reforms Act |
| | Meghalaya | Meghalaya Transfer of Land (Regulation) Act |
| **Central** | Madhya Pradesh | MP Land Revenue Code 1959, MP Accommodation Control Act |
| | Chhattisgarh | CG Land Revenue Code, CG Rent Control Act |

### 11.2 Language-to-Legal-Corpus Mapping

| Language | Relevant Courts | Key Sources |
|----------|----------------|-------------|
| Hindi | Allahabad, Delhi, Rajasthan, MP, Patna, Jharkhand, Uttarakhand | HC portals + state gazette in Hindi |
| Tamil | Madras HC | TN laws in Tamil + English |
| Telugu | Andhra + Telangana HC | AP/TS state acts in Telugu |
| Kannada | Karnataka HC | Karnataka statutes + HC judgments |
| Marathi | Bombay HC | Maharashtra state acts in Marathi |
| Bengali | Calcutta HC | WB state acts in Bengali |
| Malayalam | Kerala HC | Kerala statutes in Malayalam |
| Gujarati | Gujarat HC | Gujarat statutes in Gujarati |

---

## 12. Technical Architecture

### 12.1 Mobile Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native (Expo) | SDK 52+ |
| Router | Expo Router | v3 |
| Navigation | React Navigation | v6 |
| Styling | NativeWind | v4 |
| State | Zustand | v4 |
| Data fetching | TanStack Query | v5 |
| Local storage | MMKV | v2 |
| Auth | Firebase Auth | — |
| Payments | Razorpay React Native SDK | latest |
| Push notifications | Firebase Cloud Messaging | — |
| Analytics | Mixpanel | — |
| Crash reporting | Sentry | — |
| OTP autofill | SMS Retriever API (Android) / autofill (iOS) | — |
| Voice input | Expo Audio + OpenAI Whisper | — |
| PDF viewer | react-native-pdf | — |

### 12.2 Backend Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v20 LTS |
| Framework | Express.js |
| Database | MongoDB Atlas |
| Cache | Redis (Upstash) |
| File storage | AWS S3 |
| Real-time chat | Socket.io |
| Push | Firebase Admin SDK |
| Email | SendGrid |
| WhatsApp | Gupshup / Meta WhatsApp Business API |
| SMS / OTP | MSG91 |
| Auth | JWT + refresh tokens |

### 12.3 AI Infrastructure

| Component | Technology |
|-----------|-----------|
| Primary LLM | OpenAI GPT-4o |
| Embeddings | OpenAI text-embedding-3-large OR InLegalBERT |
| Vector DB | Pinecone |
| Translation | AI4Bharat IndicTrans2 |
| Language detection | fastText + IndicLID |
| Voice-to-text | OpenAI Whisper API |
| Document OCR | AWS Textract |

### 12.4 Folder Structure

```
law24-mobile/
├── app/                        (Expo Router v3)
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── otp.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           Home
│   │   ├── activity.tsx
│   │   ├── cases.tsx
│   │   ├── documents.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                     design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   ├── NyayaAI/
│   │   ├── AIInputBox.tsx
│   │   ├── AIResultCard.tsx
│   │   ├── PredictionBadge.tsx
│   │   └── ActionsList.tsx
│   ├── Lawyer/
│   │   ├── LawyerCard.tsx
│   │   ├── LawyerProfile.tsx
│   │   ├── CasesTab.tsx
│   │   ├── CourtsTab.tsx
│   │   ├── ReviewsTab.tsx
│   │   └── ContactTab.tsx
│   ├── CaseOS/
│   │   ├── CaseDashboard.tsx
│   │   ├── CaseTimeline.tsx
│   │   ├── AIStrategy.tsx
│   │   └── StageProgress.tsx
│   └── Payment/
│       ├── PaymentSheet.tsx
│       ├── WalletCard.tsx
│       └── UPIOptions.tsx
├── services/
│   ├── nyayaAI.service.ts
│   ├── lawyer.service.ts
│   ├── auth.service.ts
│   ├── payment.service.ts
│   ├── case.service.ts
│   └── document.service.ts
├── store/
│   ├── useAuthStore.ts
│   ├── useCaseStore.ts
│   ├── useWalletStore.ts
│   └── useNyayaStore.ts
├── constants/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── legalCategories.ts
└── utils/
    ├── formatters.ts
    ├── validators.ts
    └── i18n.ts
```

---

## 13. API Specifications

### Auth

```
POST /api/v1/auth/send-otp
  Body:    { phone: "+91XXXXXXXXXX", channel: "sms" | "whatsapp" }
  Returns: { success: true, expires_in: 600, ref_id: "..." }

POST /api/v1/auth/verify-otp
  Body:    { phone: "+91XXXXXXXXXX", otp: "123456", ref_id: "..." }
  Returns: { access_token, refresh_token, user: { id, name, phone, plan } }

POST /api/v1/auth/google
  Body:    { id_token: "Google OAuth token" }
  Returns: same as verify-otp
```

### NyayaAI

```
POST /api/v1/ai/analyze
  Body:    { query: string, language: "en|hi|ta|...", session_id: string }
  Returns: { issue_title, category, prediction_range, legal_basis,
             applicable_acts[], recommended_actions[], risk_level,
             matched_cases[], disclaimer, session_id }

POST /api/v1/ai/save-case
  Body:    { session_id, user_id, case_title }
  Returns: { case_id, saved: true }

GET /api/v1/ai/quick-prompts?lang=hi
  Returns: [ { id, label, prompt } ]
```

### Lawyers

```
GET /api/v1/lawyers?category=&city=&lang=&minExp=&maxFee=&rating=&page=&limit=
  Returns: { lawyers: [...], total, page, pages }

GET /api/v1/lawyers/:id
  Returns: full lawyer object

GET /api/v1/lawyers/:id/availability?date=YYYY-MM-DD
  Returns: { slots: [{ start, end, available }] }

GET /api/v1/lawyers/:id/reviews?page=&type=chat|call
  Returns: { reviews: [...], summary: { avg, breakdown } }

GET /api/v1/lawyers/:id/cases?page=
  Returns: { cases: [...], stats: { total, won, lost, settled, by_category } }
```

### Consultations

```
POST /api/v1/consultations/initiate-chat
  Body:    { lawyer_id, user_id }
  Returns: { consultation_id, socket_room, lawyer_online: bool }

POST /api/v1/consultations/book-call
  Body:    { lawyer_id, slot_id, type: "30min|60min" }
  Returns: { booking_id, order_id, amount }

POST /api/v1/consultations/end-chat
  Body:    { consultation_id }
  Returns: { duration_seconds, amount_charged, receipt_id }

GET /api/v1/consultations/:id/messages
  Returns: { messages: [{ sender, text, timestamp }] }
```

### Payments

```
POST /api/v1/payments/create-order
  Body:    { type: "consultation|wallet|subscription", amount, currency: "INR" }
  Returns: { order_id, razorpay_key, amount }

POST /api/v1/payments/verify
  Body:    { order_id, payment_id, signature }
  Returns: { verified: true, transaction_id }

POST /api/v1/wallet/add
  Body:    { amount, payment_method }
  Returns: { new_balance, transaction_id }

GET /api/v1/wallet/transactions?page=&limit=
  Returns: { transactions: [...], balance }
```

### Case OS

```
GET  /api/v1/cases
  Returns: { cases: [{ id, title, category, stage, urgency, updated_at }] }

POST /api/v1/cases
  Body:    { title, category, sub_cases[], ai_session_id }
  Returns: { case_id }

GET  /api/v1/cases/:id/timeline
  Returns: { events: [{ date, title, description, docs[], type, people[] }] }

POST /api/v1/cases/:id/timeline
  Body:    { title, description, date, doc_ids[] }
  Returns: { event_id }

GET  /api/v1/cases/:id/ai-strategy
  Returns: { strategy_text, next_action, urgency, success_probability, updated_at }
```

---

## 14. Security & Compliance

### 14.1 Security

| Layer | Implementation |
|-------|---------------|
| Transport | TLS 1.3 for all API calls |
| Storage | AES-256 encryption at rest (S3 + MongoDB Atlas) |
| Auth tokens | JWT: 15-min access token + 30-day refresh token |
| OTP | Time-based, single-use, 10-min expiry |
| Payment data | PCI-DSS via Razorpay — no card data on Law24 servers |
| Chat | End-to-end encryption via Signal Protocol |
| Documents | Per-user encryption keys |
| Servers | Hosted in India (AWS ap-south-1 Mumbai) |

### 14.2 Indian Regulatory Compliance

| Regulation | Action |
|------------|--------|
| DPDPA 2023 | Consent management, data principal rights, privacy notice at onboarding |
| IT Act 2000 | Data localization — servers in India |
| RBI PPI Guidelines | Razorpay wallet license, Aadhaar KYC for high-value wallets |
| Bar Council of India Rules | AI provides "legal information" only — never "legal advice" |
| Consumer Protection Act 2019 | Grievance officer, 48-hr complaint resolution |
| GST | GSTIN registration, proper HSN/SAC codes on invoices |

### 14.3 AI Liability

Every AI output must include: *"This is legal information based on publicly available Indian case law and statutes. It is not legal advice tailored to your specific situation. Consult a licensed advocate before taking legal action."*

---

## 15. Subscription & Monetization

### 15.1 Plans

| Feature | Free | Standard ₹199/mo | Premium Pro ₹499/mo |
|---------|------|--------------------|---------------------|
| NyayaAI queries | 5/month | 50/month | Unlimited |
| Case OS | 1 active | 5 active | Unlimited |
| Document storage | 100 MB | 1 GB | 10 GB |
| AI strategy in Case OS | ✗ | ✗ | ✓ |
| Languages | English + Hindi | 8 languages | All languages |
| Priority lawyer matching | ✗ | ✓ | ✓ |
| Emergency legal access | ✗ | ✗ | ✓ |
| AI document review | ✗ | 2/month | Unlimited |
| Consultation discount | 0% | 5% | 10% |
| Annual (save 2 months) | — | ₹1,990/yr | ₹4,990/yr |

### 15.2 Revenue Streams

| Stream | Model | Year 1 Focus |
|--------|-------|-------------|
| Consultation commission | 15–20% of each session fee | Primary |
| Per-minute chat billing | 20% of chat charges | High volume |
| Subscriptions | Monthly / annual SaaS | Recurring |
| Featured lawyer placement | ₹1,500–₹5,000/lawyer/month | Supply-side |
| Document templates | ₹49–₹299 per download | Phase 3 |
| B2B API | Law firm SaaS plans | Phase 3 |

---

## 16. Notification System

### 16.1 Case Alerts

| Alert | Trigger | Channel |
|-------|---------|---------|
| Hearing reminder | 48 hrs + 2 hrs before court date | Push + WhatsApp |
| Action required | Lawyer assigns task | Push + WhatsApp |
| Deadline alert | Filing window approaching | Push + Email |
| Stage change | Case moves to next stage | Push |
| AI strategy update | New suggestion generated | Push |

### 16.2 Consultation Alerts

| Alert | Trigger | Channel |
|-------|---------|---------|
| Lawyer online | Saved lawyer goes live | Push |
| Booking confirmed | Post-payment | Push + WhatsApp + Email |
| Session in 15 min | Pre-call | Push + WhatsApp |
| Low wallet (< ₹100) | Balance check | Push |
| Receipt | Post-session | WhatsApp + Email |

### 16.3 AI Alerts (Premium Pro)

- Analysis of opposing counsel filings (user-inputted updates)
- Recent similar case outcomes from last 90 days
- Changes in relevant laws or new landmark judgments

---

## 17. Development Phases & Timeline

### Phase 1 — Foundation (Weeks 1–10) · MVP

| Week | Deliverable |
|------|-------------|
| 1 | Expo project + Expo Router + NativeWind + design tokens + CI/CD |
| 2 | Auth screens: Login (OTP + Google + Email) + Firebase Auth + Twilio OTP |
| 3 | Home Screen: NyayaAI card + category grid + expert cards (static data) |
| 4 | NyayaAI: GPT-4o integration + prompt system + chat UI + response rendering |
| 5 | Lawyer listing: API + filter bottom sheet + lawyer cards |
| 6 | Lawyer profile: Overview + Contact tab (chat + call booking) |
| 7 | Razorpay integration: UPI + card + wallet + per-minute chat billing |
| 8 | Chat consultation: Socket.io + per-minute timer + wallet deduction |
| 9 | Profile screen: wallet + subscription display + recent activity |
| 10 | QA + bug fix + TestFlight + Play Store internal testing |

**Milestone:** Beta — 500 users  
**Team:** 2 React Native devs + 1 backend dev + 1 designer

---

### Phase 2 — Product Depth (Weeks 11–22) · Growth

| Week | Deliverable |
|------|-------------|
| 11–12 | Case OS dashboard + timeline screen |
| 13–14 | Documents screen: upload, folder, share with lawyer |
| 15–16 | Lawyer profile: Cases tab (win rate, chart) + Courts tab |
| 17–18 | NyayaAI RAG: 50K Indian Kanoon docs ingested, Pinecone indexed |
| 19 | Hindi language support (UI strings + AI translation via IndicTrans2) |
| 20 | Call booking: calendar + slot selection + Razorpay escrow |
| 21 | Notification system: push (FCM) + WhatsApp Business API |
| 22 | Lawyer onboarding web portal + Bar Council verification flow |

**Milestone:** 10,000 MAU · 200+ verified lawyers  
**Team addition:** 1 AI/ML engineer + 1 QA

---

### Phase 3 — Intelligence (Weeks 23–36) · Scale

| Week | Deliverable |
|------|-------------|
| 23–24 | AI strategy engine in Case OS (context-aware per-case) |
| 25–26 | RAG expansion to 500K docs (all 25 HCs) |
| 27–28 | 6 more Indian languages (Tamil, Telugu, Kannada, Marathi, Bengali, Gujarati) |
| 29–30 | Voice input for NyayaAI (Whisper API — all 8 languages) |
| 31–32 | Legal document templates marketplace |
| 33–34 | Premium Pro features: AI alerts + emergency access |
| 35–36 | B2B API for law firms (basic tier) |

**Milestone:** 100,000 MAU · ₹1Cr+ GMV/month  
**Team addition:** 1 AI engineer + 1 growth PM

---

### Phase 4 — Expansion (Months 10–18)

| Milestone | Target Month |
|-----------|-------------|
| Regional language voice AI (Tamil, Telugu, Hindi, Bengali) | Month 10 |
| District court corpus — 2M+ documents | Month 11 |
| B2B SaaS for law firms | Month 12 |
| Legal protection insurance tie-up | Month 13 |
| Fine-tuned open-source Indian legal LLM | Month 14 |
| Web app (Next.js) for desktop | Month 15 |
| 500,000 MAU | Month 18 |

---

## 18. Success Metrics & KPIs

| Metric | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| Monthly Active Users | 1,000 | 10,000 | 100,000 |
| NyayaAI queries / day | 500 | 5,000 | 50,000 |
| AI → Lawyer conversion | ≥ 10% | ≥ 15% | ≥ 20% |
| Day-30 retention | ≥ 30% | ≥ 40% | ≥ 45% |
| Avg consultation rating | ≥ 4.0 | ≥ 4.3 | ≥ 4.5 |
| Verified lawyers | 50 | 200 | 1,000 |
| Free → paid conversion | ≥ 5% | ≥ 10% | ≥ 15% |
| Wallet activation rate | ≥ 60% | ≥ 70% | ≥ 75% |
| Monthly GMV | ₹5L | ₹50L | ₹1Cr+ |
| Net Promoter Score | ≥ 40 | ≥ 50 | ≥ 60 |
| App Store Rating | ≥ 4.2 | ≥ 4.5 | ≥ 4.6 |

---

## 19. Risk Register

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| AI gives incorrect legal output | 🔴 Critical | High | Mandatory disclaimer; quarterly prompt audit; source citations on all outputs |
| Bar Council / UPL compliance | 🔴 Critical | Medium | AI = "legal information" only, never "advice"; no AI signing docs; legal counsel on retainer |
| Lawyer quality control | 🔴 High | Medium | Bar Council ID verification; min 4.0 rating to stay listed; 48-hr grievance SLA |
| Sensitive data breach (user legal data) | 🔴 Critical | Low | DPDPA compliance; AES-256 encryption; India data residency; SOC 2 Type II audit Phase 3 |
| AI hallucination in case citations | 🟠 High | Medium | RAG reduces hallucination; user can tap cited case to verify source |
| Payment fraud / chargeback | 🟠 High | Low | Razorpay fraud detection; escrow; anomaly monitoring |
| Low lawyer supply in Tier 2/3 | 🟠 High | High | Remote consultation default; incentivize with featured placement |
| AI cost overrun (GPT-4o) | 🟡 Medium | Medium | Rate limit free users; cache common queries; move to fine-tuned open model Phase 3 |
| App Store rejection | 🟡 Medium | Low | Follow App Store 5.2 legal policies; clear disclaimers; no "legal advice" in metadata |
| Low adoption in non-Hindi non-English states | 🟠 High | Medium | Phase 2 regional language support; regional lawyer incentive programs |

---

## Appendix A — Legal Category Taxonomy

| # | Category | Primary Acts |
|---|----------|-------------|
| 1 | Criminal Law | IPC, CrPC, NDPS Act, Arms Act |
| 2 | Family & Matrimonial | Hindu Marriage Act, Muslim Personal Law, DV Act, POCSO |
| 3 | Property & Real Estate | Transfer of Property Act, RERA, Registration Act |
| 4 | Employment & Labour | Industrial Disputes Act, Labour Codes 2020, POSH Act |
| 5 | Consumer Protection | Consumer Protection Act 2019 |
| 6 | Banking & Finance | NI Act S.138, SARFAESI, IBC |
| 7 | Civil & Contract | Contract Act 1872, Specific Relief Act |
| 8 | Cyber Crime | IT Act 2000, DPDPA 2023 |
| 9 | Taxation | Income Tax Act, GST Act |
| 10 | Corporate & Business | Companies Act 2013, LLP Act |
| 11 | Immigration | Foreigners Act, Passports Act |
| 12 | Medical & Healthcare | MTP Act, medical negligence |

## Appendix B — All Indian Languages (22 Scheduled + Regional)

**8th Schedule (Official):** Hindi · Bengali · Telugu · Marathi · Tamil · Urdu · Gujarati · Kannada · Malayalam · Odia · Punjabi · Assamese · Maithili · Santali · Kashmiri · Nepali · Sindhi · Konkani · Dogri · Manipuri · Bodo · Sanskrit

**Regional (high user base):** Bhojpuri · Rajasthani · Chhattisgarhi · Haryanvi · Bundeli · Awadhi · Tulu · Magahi · Kumaoni · Garhwali

---

*Law24 — Product Requirements Document v2.0 — Confidential*  
*Designed with reference to app screens — April 2026*  
*Making Legal Help for Every Indian — Har Bharatiya ke liye Nyaya*