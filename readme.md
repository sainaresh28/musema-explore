# Musema Frontend

React/TypeScript application for the Musema - museum discovery and booking platform. Built with Vite, Tailwind CSS, and Clerk for authentication. Includes an AI chatbot with voice input/output, emotion detection, museum card rendering, and a complete ticket booking and download flow.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Authentication](#authentication)
- [State Management](#state-management)
- [Pages](#pages)
- [Components](#components)
- [Utilities](#utilities)
- [API Layer](#api-layer)
- [Chatbot System](#chatbot-system)
- [Voice System](#voice-system)
- [Image System](#image-system)
- [Styling](#styling)
- [Environment Variables](#environment-variables)
- [Build and Deployment](#build-and-deployment)

---

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env   # fill in all values
npm run dev             # starts at http://localhost:5173
```

### Required environment variables

```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_GROQ_API_KEY=gsk_...
```

The app will not function without these three variables. EmailJS variables are optional and only affect the contact form.

---

## Project Structure

```
frontend/src/
|-- @types/
|   `-- index.ts                TypeScript interfaces for Museum, Booking, BookingPayload, LLMMuseum, PaginationMeta and all sub-types used across the app
|-- api/
|   |-- client.ts               Base fetch wrapper that reads Clerk JWT before every request and injects it as Bearer token; handles JSON parsing and error throwing
|   |-- auth.api.ts             syncUser (creates/updates MongoDB user on sign-in), getMe, updateProfile
|   |-- booking.api.ts          create, getAll, getById, cancel, getBusyTimes — all booking API calls
|   |-- museum.api.ts           getAll (with query params), getById, getTypes, getStates for seeded museums; llmMuseumApi.fetch for LLM-fetched museums; exports LLMMuseum interface
|   |-- admin.api.ts            All admin panel API calls using localStorage admin JWT instead of Clerk token
|   `-- index.ts                Re-exports museumApi, bookingApi, authApi for convenient imports
|-- assets/
|   `-- chatbot.png             Bot avatar image displayed in the AI section of the home page
|-- components/
|   |-- BackButton.tsx          Reusable back navigation button rendered in MainLayout when showBack prop is true
|   |-- BusyTimeChart.tsx       Recharts bar chart showing total visitors per time slot, used on the Dashboard page
|   |-- MuseumChatbot.tsx       The full AI guide chatbot: floating button, chat panel, booking state machine (23 steps), voice I/O, emotion display, museum card rendering with Wikipedia links
|   |-- MuseumGrid.tsx          Museum card grid with type and state filter buttons, used as an alternative view on the Museums page
|   |-- MuseumMap.tsx           Leaflet interactive map showing all 38 seeded museums as clickable markers with info popups
|   |-- Navigation.tsx          Sign-in dropdown shown only when user is signed out, with separate User and Admin login options
|   `-- TicketConfirmation.tsx  QR code display component shown after a successful booking
|-- context/
|   `-- AuthContext.tsx         ClerkTokenSync component that wires the Clerk getToken function to the API client and calls syncUser on first sign-in
|-- hooks/
|   |-- useBookings.ts          Fetches all user bookings from the API, computes a byHour visitor count map for the busy times chart
|   `-- useMuseums.ts           useMuseums hook (paginated list with optional params) and useMuseum hook (single museum by ID)
|-- pages/
|   |-- Home.tsx                Landing page with hero, museum carousel (live API data), top destinations masonry grid, exhibitions table, AI section, features grid, testimonials strip, and sticky scroll-reveal process steps
|   |-- Museums.tsx             Museum browser with horizontal draggable card carousel, type filter pills, museum detail modal, map view toggle, wishlist heart buttons per card, and Book Now with sign-in redirect
|   |-- MuseumDetail.tsx        Individual museum page with image gallery, full museum info, facilities, per-day opening hours, and an inline booking form that submits directly to the API
|   |-- Payment.tsx             Full booking and payment page: ticket counters, visitor details (7 fields), add-ons, accessibility options, payment method selector (simulated), order summary, and QR ticket download on success
|   |-- Dashboard.tsx           User dashboard with booking history tabs, profile editing, stats, per-booking QR view and ticket download, cancel button for upcoming bookings, and wishlist tab
|   |-- Exhibitions.tsx         Static exhibitions listing page with hardcoded upcoming exhibition data
|   |-- About.tsx               About page with team section, four value cards, mission statement, and stats strip
|   |-- Contact.tsx             Contact form that sends messages via EmailJS including an auto-reply to the sender
|   |-- FAQ.tsx                 Frequently asked questions with expandable answers
|   |-- PrivacyPolicy.tsx       Privacy policy page with full policy text
|   |-- NotFound.tsx            404 page shown for any unmatched route
|   `-- admin/
|       |-- AdminLogin.tsx      Admin login form using the backend custom JWT system, stores token in localStorage on success
|       `-- AdminDashboard.tsx  Admin panel with stats overview, bookings management table, users management table, and museums management table, all with search, filter, and pagination
|-- routes/
|   |-- AppRoutes.tsx           All route definitions including custom AuthLayout for sign-in/sign-up pages with museum image panel
|   |-- AdminRoute.tsx          Route guard that checks localStorage for admin JWT and redirects to admin login if absent or expired
|   `-- ProtectedRoute.tsx      Route guard using Clerk SignedIn/SignedOut components that redirects unsigned users to sign-in
|-- templates/
|   `-- MainLayout.tsx          Shared page wrapper with navbar, mobile menu, Clerk UserButton, scroll-reveal IntersectionObserver, and always-present MuseumChatbot
|-- utils/
|   |-- constants.ts            Shared constants: TIME_SLOTS array, INDIAN_STATES list, LANGUAGES with codes and labels, TOKEN_KEY for localStorage
|   |-- emotionAI.ts            Emotion detection engine: scores 9 emotions from text, detects intent and language, extracts cities and entities, builds the structured Groq system prompt with card formatting rules
|   |-- groqApi.ts              Groq API wrapper for llama-3.3-70b-versatile: chat() for standard calls and chatStream() for streaming token-by-token responses
|   |-- helpers.ts              General utility functions used across the app
|   |-- imageService.ts         Two-tier image resolver: getMuseumImages (synchronous, type-based Unsplash pool) and fetchMuseumImages (async Wikipedia image lookup with 5s timeout and fallback)
|   |-- museumImages.ts         Hardcoded map of all 38 seeded museum names to their specific Unsplash photo URLs for accurate image matching
|   |-- voiceService.ts         VoiceService singleton: TTS with Indian voice priority selection, STT with SpeechRecognition API, full emoji and markdown stripping before speaking
|   `-- wikipediaApi.ts         Wikipedia REST API wrapper: getSummary (search + summary with thumbnail and URL) and getSections (full plain-text article extract)
|-- app.tsx                     Root component that wraps the app in ClerkProvider, QueryClientProvider, ClerkTokenSync, BrowserRouter, and AppRoutes
`-- main.tsx                    ReactDOM.createRoot entry point that mounts app.tsx into the HTML root element
```

---

## Routing

All routes are defined in `routes/AppRoutes.tsx`.

```
/                     Home page (public)
/museums              Museums browser (public)
/museum/:id           Museum detail page (public)
/exhibitions          Exhibitions listing (public)
/about                About page (public)
/contact              Contact form (public)
/faq                  FAQ page (public)
/privacy              Privacy policy (public)
/sign-in/*            Clerk sign-in UI wrapped in custom AuthLayout
/sign-up/*            Clerk sign-up UI wrapped in custom AuthLayout
/dashboard            User dashboard (protected, requires Clerk sign-in)
/payment              Booking and payment page (protected, requires Clerk sign-in)
/admin/login          Admin login page (public)
/admin/dashboard      Admin dashboard (protected by admin JWT in localStorage)
*                     404 Not Found page
```

### Protected routes

`ProtectedRoute` wraps children with Clerk's `SignedIn` and `SignedOut` components. If the user is not signed in, Clerk redirects to the sign-in page.

`AdminRoute` checks for `musema_admin_token` in localStorage. If absent or the token is expired (checked via a /api/admin/me call), the user is redirected to /admin/login.

### Auth layout

The sign-in and sign-up pages are wrapped in `AuthLayout`, a two-column layout with a full-height museum image panel on the left and the Clerk UI on the right. On mobile, the left panel is hidden.

The `<SignIn>` component is configured with `fallbackRedirectUrl="/museums"` so users who sign in without a specific redirect target land on the museums page.

---

## Authentication

Authentication is handled by Clerk. The flow is as follows:

1. `app.tsx` wraps the entire app in `<ClerkProvider publishableKey={...}>`.
2. `ClerkTokenSync` (rendered inside the provider) calls `setTokenProvider(() => getToken())` from `useClerkAuth`. This gives the API client a function to get fresh JWTs.
3. On sign-in, `ClerkTokenSync` also calls `authApi.syncUser` to create or update the user record in the backend MongoDB.
4. The `client.ts` API wrapper calls `getTokenFn()` before every request and adds the result as `Authorization: Bearer <token>`.
5. Protected pages use `ProtectedRoute` which leverages Clerk's `SignedIn/SignedOut` components.

The `useUser()` hook from Clerk is used throughout the app to get the current user's name, email, and sign-in state.

---

## State Management

The app uses a combination of approaches:

- **TanStack React Query**: Configured in `app.tsx` with `QueryClientProvider`. Used implicitly through the custom hooks.
- **Custom hooks**: `useMuseums` and `useBookings` manage their own local state with `useState` and `useEffect`.
- **Component state**: Most pages manage their own state internally with `useState`.
- **localStorage**: Used for the admin JWT token (`musema_admin_token`), the wishlist (`musema_wishlist`), and the legacy token key (`musema_token`).

There is no global state store (no Redux, Zustand, or Context for app data). Each page is self-contained.

---

## Pages

### Home.tsx

The landing page. Sections in order:
- Hero section with animated headline and call-to-action buttons
- Two-column "Our Experience" section with stats
- Top Destinations section with an asymmetric masonry grid of 6 hardcoded museum images with filter pills
- Choose Your Destination section with a horizontal carousel of live museum data from the API
- Exhibitions table listing
- AI section with a curved background, chatbot image, and a "Chat with AI Guide" button
- Features grid (4 feature cards)
- Testimonials section with an auto-scrolling strip
- Process steps section with sticky scroll-reveal cards

The Choose Your Destination carousel is the only live data section on the home page. It fetches all museums and renders them in a draggable horizontal carousel. The carousel uses pointer events and direct DOM manipulation for smooth drag performance.

### Museums.tsx

The main museum browser. Features:
- Type filter pills at the top
- A horizontal card carousel with museum cards
- Each card shows an image, museum name, type, city, price, rating, and two buttons (Learn More opens a modal, Book Now navigates to payment)
- A detail modal that shows full museum information including description, facilities, opening hours, and highlights
- A map view toggle that shows MuseumMap
- A wishlist toggle on each card (heart/star icon, stored in localStorage)

The carousel uses `useRef` for the track element and manipulates `style.transform` directly during drag to avoid React re-renders on every mouse/touch move. Transition is added back on snap after release.

Book Now checks `isSignedIn` and redirects to `/sign-in?redirect_url=...` if the user is not signed in, ensuring the user returns to the correct payment page after signing in.

### Payment.tsx

The full booking page. Can be reached from:
- Museums.tsx Book Now button (museumId or llmMuseum in URL params)
- Chatbot booking flow confirmation (llmMuseum as JSON in URL params)

The page reads URL params to determine which museum is being booked. It supports three museum types: seeded (museumId param), external (externalMuseumId param), and LLM JSON (llmMuseum param as URL-encoded JSON).

Sections on the page:
- Museum info header
- Date picker and time slot selector
- Ticket counters (adult, child, senior, student) with running total
- Visitor details (name, email, phone, age group, nationality, ID type, ID number)
- Guide language selector
- Add-ons (guided tour +100, photography permit +50)
- Accessibility options (wheelchair, special assistance, senior support)
- Payment method selector (card, UPI, net banking — all simulated)
- Order summary with subtotal, taxes, and total
- Confirm booking button

On success, a QR ticket modal is shown with the booking reference. The Download Ticket button calls `downloadTicket()` which draws a styled ticket on a Canvas element and triggers a PNG download.

### Dashboard.tsx

User dashboard accessible at /dashboard. Shows:
- Profile card with name, email, and edit button (inline edit form)
- Stats row: total bookings, total spent, museums visited
- Upcoming bookings tab and All bookings tab
- Each booking card shows museum name, date, time, ticket count, amount, status badge, QR code button, download ticket button, and cancel button for upcoming bookings
- Wishlist tab showing museums saved from the Museums page

### MuseumDetail.tsx

Individual museum page at /museum/:id. Uses the `useMuseum(id)` hook to fetch museum data.

Shows:
- Image gallery with thumbnail strip (uses `getMuseumImage` from museumImages.ts to get the correct Unsplash URL for seeded museums)
- Museum info: type badge, established year, address, contact details, rating
- Facilities icons
- Opening hours per day
- An inline booking form (date, time, ticket counts, visitor details)
- Direct booking submission via `bookingApi.create`

Unlike the Payment page, this form does not show a payment method selector. Bookings are created with `paymentMethod: 'mock'` by default.

### AdminDashboard.tsx

The admin panel. Uses a separate axios-like fetch wrapper in `admin.api.ts` that reads the admin JWT from localStorage.

Tabs:
- Overview: stat cards, mini bar chart of bookings by day, top museums table, recent bookings table
- Bookings: full paginated table with search and status filter, status update dropdown per row
- Users: paginated table with search and activate/deactivate toggle
- Museums: paginated table with search and filters, inline field editing, deactivate button

---

## Components

### MuseumChatbot.tsx

The main chatbot component rendered inside `MainLayout`. It is always present on every page that uses MainLayout but is hidden until the user clicks the floating action button.

#### Booking state machine

The chatbot manages a `BookingState` object with a `step` field that acts as the current state. The steps in order are: idle, museum, fetching, choose, date, time, adults, children, seniors, students, name, email, phone, agegroup, nationality, idtype, idnumber, language, guidedtour, photopermit, wheelchair, specialassist, seniorassist, confirm.

The `send` function handles all user input. It checks the current step first. If a booking is in progress, it processes the input as an answer to the current booking question. If not, it checks for booking trigger keywords and image keywords, then falls through to the AI conversation branch.

#### AI conversation branch

When no booking is in progress and no specific trigger is detected, the message is analysed by `emotionAI.analyze()`. If the message mentions a museum, the chatbot also fetches museum data from the LLM and attaches a museum card and Wikipedia link to the response. The Groq API is called with the system prompt built by `emotionAI.buildSystemPrompt()` and the last 10 messages as conversation history.

#### Message rendering

The `renderMsgContent` function splits the AI response by newlines and renders each line. It converts markdown bold/italic, converts URLs to clickable anchor tags, renders lines starting with `-` or `*` as bullet points, and renders `---` as horizontal rules.

### MuseumGrid.tsx

A simpler museum grid used on some pages. Fetches museums with type and state filters. Renders as a CSS grid with museum cards. Each card has an image, type badge, name, location, rating, price, and a View & Book button.

### MuseumMap.tsx

Renders a Leaflet map with markers for each seeded museum. Each marker has a popup showing the museum name, type, city, and a Book Tickets button. Uses `react-leaflet` and a custom CSS fix to handle the default marker icon path issue with Vite bundling.

### Navigation.tsx

A dropdown component shown only when the user is signed out (`<SignedOut>` from Clerk). Shows two options: User Sign In (navigates to /sign-in) and Admin Sign In (navigates to /admin/login).

### MainLayout.tsx

Wraps all main pages. Contains:
- The top navigation bar with logo, nav links, Navigation component (sign-in dropdown), and Clerk UserButton (shown when signed in)
- Mobile menu with overlay
- An IntersectionObserver that adds an `on` class to all elements with classes R, RL, RR, RS when they enter the viewport (used for scroll-reveal animations)
- `<MuseumChatbot />` rendered at the bottom, present on all pages using this layout

---

## Utilities

### emotionAI.ts

A client-side emotion detection and prompt engineering module. The `EmotionAI` class has the following key methods:

`analyze(text)`: Returns an `EmotionAnalysis` object. It scores the text against 9 emotion categories (curious, excited, bored, romantic, family, budget, cultural, adventurous, scientific) using keyword lists and a sentiment scoring function. It also detects intent (booking, info, compare, general), language (10 Indian languages plus English), occasion (birthday, anniversary, etc.), museum type preference, and extracts entities (cities, numbers, dates).

`buildSystemPrompt(analysis, conversationHistory)`: Constructs the full system prompt sent to Groq. The prompt instructs the model to respond in a structured card format for museum queries, always include Wikipedia links, list all museums in a city when asked, and use the detected tone and emotion context.

### groqApi.ts

Wrapper for the Groq API. Uses `https://api.groq.com/openai/v1/chat/completions` with the `llama-3.3-70b-versatile` model, `max_tokens: 2000`, and `temperature: 0.7`. The API key is read from `VITE_GROQ_API_KEY`.

`chat(systemPrompt, messages, userMessage)`: Non-streaming call. Returns the full response string.

`chatStream(systemPrompt, messages, userMessage, onToken)`: Streaming call using the ReadableStream API. Calls `onToken(chunk, done)` for each chunk as it arrives.

### voiceService.ts

A singleton `VoiceService` class managing all voice I/O.

**TTS (text-to-speech)**: Uses `window.speechSynthesis`. Voice selection priority: Raveena (Apple Indian female) > Veena (Apple) > Google en-IN female > Google en-IN > any en-IN > Neerja/Heera (Microsoft) > Google UK English Female > any English voice. Before speaking, the text is cleaned: markdown bold/italic/headings are stripped, emojis are removed with Unicode range regexes covering all emoji blocks, multiple newlines are converted to periods. Rate is 0.88 (slightly slower for clarity), pitch is 1.1 (slightly higher for a softer tone).

**STT (speech-to-text)**: Uses `window.SpeechRecognition` (or `webkitSpeechRecognition`). Language is set to `en-IN`. Single utterance mode (continuous: false). Works in Chrome and Edge. Not supported in Firefox.

### imageService.ts

Two tiers of image resolution:

`getMuseumImages(museum, count)`: Synchronous. Returns images from the museum object if available, otherwise selects from a type-based Unsplash URL pool. Uses a deterministic shuffle based on the museum name so the same museum always gets the same pool images. Never makes a network call.

`fetchMuseumImages(museum, count)`: Asynchronous. First calls `getMuseumImages` as fallback. Then searches Wikipedia for the museum, fetches the article's lead image and all image filenames, resolves filenames to URLs with dimension info, and filters out images narrower than 200px or taller than 1.5x their width. Uses a 5-second AbortController timeout to prevent hanging. Returns the Unsplash pool fallback on any error.

### museumImages.ts

A hardcoded map of museum names to specific Unsplash photo URLs. Contains entries for all 38 seeded museums. Used by `getMuseumImage(name)` which does a case-insensitive lookup. If no match is found, returns undefined (caller falls back to the type pool).

### wikipediaApi.ts

`getSummary(query)`: Searches Wikipedia for the query (appends "museum India"), fetches the page summary from the Wikipedia REST API, and returns title, extract text, thumbnail URL, and desktop URL. Returns null on error.

`getSections(title)`: Fetches the full plain-text extract of a Wikipedia article. Returns up to 1500 characters.

### constants.ts

Exports: `TIME_SLOTS` (array of 9 hour strings from 09:00 to 17:00), `INDIAN_STATES` (all 28 states and 8 union territories), `LANGUAGES` (10 languages with value/label pairs), `TOKEN_KEY` (the localStorage key name for the legacy user token).

---

## API Layer

### client.ts

The base HTTP client. Exports a `setTokenProvider(fn)` function that stores a function to call for getting the current Clerk JWT. The `request` function calls this provider before each request and adds the token as `Authorization: Bearer <token>`. It handles JSON serialisation, throws on non-2xx responses using the error message from the response body, and throws a specific "Cannot reach server" message on network errors.

### museum.api.ts

Exports `museumApi` (uses the base client) and `llmMuseumApi` (also uses the base client for the POST /llm-museum/fetch call). Also exports the `LLMMuseum` TypeScript interface.

### admin.api.ts

Uses a separate `req()` function that reads the admin token from localStorage instead of using Clerk. All admin API calls go through this. Does not use the base client from `client.ts`.

---

## Chatbot System

The chatbot is a floating button (FAB) fixed to the bottom-right of every page using MainLayout. Clicking it opens a slide-up chat panel.

### Opening message

On first open, the bot sends a personalised greeting using the signed-in user's first name (if available) and lists its capabilities.

### Message flow

1. User types or speaks a message.
2. `send()` is called.
3. If a booking is in progress (`bk.step !== 'idle'`), the message is processed as a booking answer and the state machine advances.
4. If not, and the message matches a booking trigger keyword (book, ticket, reserve, buy, purchase), the booking flow is initiated.
5. If neither, `emotionAI.analyze()` runs, `groqApi.chat()` is called, and if a museum name is detected in the message, `llmMuseumApi.fetch()` is also called to attach a museum card to the response.

### Booking flow

The booking is guided entirely by the chatbot. Each step sends a prompt and waits for the user's response. The chatbot validates date format, yes/no answers, email format, and phone number format inline, re-asking if the input is invalid. At the confirm step, the user's full booking details are shown and they type "yes" or "no". On "yes", the booking data is serialised into URL params and the user is navigated to /payment to complete the transaction.

### Quick question buttons

When the chat is first opened, a row of suggestion buttons is shown below the input. These send predefined messages to start common conversations.

---

## Voice System

The mic button in the input bar behaves differently depending on the current mode:

**Push-to-talk mode** (voice mode off): Pressing and holding the mic button starts recording. If the button is held for more than 400ms and then released, recording stops (push-to-talk behaviour). If tapped briefly, recording starts and stops naturally when the user stops speaking (the browser's SpeechRecognition `onend` event handles this).

**Continuous voice mode** (voice mode on): Clicking the mic icon in the chat header toggles this mode on or off. In this mode, the bot listens automatically after each response. A `useEffect` watches for `voiceOn && !speaking && !busy && !mic` and restarts the mic with a 600ms delay after the bot finishes speaking.

The `sendRef` pattern is used to avoid stale closures in the SpeechRecognition callbacks. A `useRef` stores the latest version of the `send` function and is updated by a `useEffect` after every render. The `onresult` callback calls `sendRef.current(transcript)` instead of `send(transcript)` directly.

When the mic button is pressed, `voiceService.stop()` and `setSpeaking(false)` are called immediately to cut off any ongoing TTS before recording begins.

---

## Image System

Museum images are resolved through three tiers in order of preference:

1. **Seeded museum images**: If `museum.images` array is populated (set during seed), those Unsplash URLs are used directly. These are the most reliable because the URLs are hardcoded and always valid.

2. **Type-based pool fallback**: If no seeded images, `getMuseumImages` selects from a pool of 3-5 Unsplash URLs per museum type (Art, History, Science, etc.) using a deterministic name-based shuffle. This always works without any network call.

3. **Wikipedia images** (async upgrade): `fetchMuseumImages` searches Wikipedia and attempts to find real photos of the specific museum. This is attempted in the background after the card is already shown with pool fallback images. If better images are found, the card updates silently. Wikipedia images are filtered to remove logos, icons, flags, maps, and images smaller than 200x150px.

---

## Styling

The app uses Tailwind CSS 3 for utility classes combined with extensive inline styles and CSS class definitions in the page files. Custom CSS is defined in:

- `src/index.css`: Global variables (--k, --r, --c, --w, --bd etc. for dark ink, rust red, cream, white, border), CSS animations (pulse-dot, bounce, spin, slideUpM), and component class definitions (.nav-v4, .chat-panel-v4, .bubble-u-v4, .bubble-b-v4, etc.)
- `src/App.css`: Additional app-level styles

Fonts are loaded from Google Fonts in `index.html`:
- Bebas Neue: display headings
- Syne: labels, navigation, UI text
- Cormorant Garamond: serif accents, museum names in the chatbot
- DM Sans: body text

The scroll-reveal animation system uses an IntersectionObserver in MainLayout that adds an `on` class to any element with class `R` (reveal from bottom), `RL` (reveal from left), `RR` (reveal from right), or `RS` (reveal with scale). The corresponding CSS transitions are defined in index.css.

---

## Environment Variables

All frontend environment variables must be prefixed with `VITE_` to be accessible in the browser.

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | Yes | Backend API base URL including /api suffix |
| VITE_CLERK_PUBLISHABLE_KEY | Yes | Clerk publishable key (pk_test_ for dev, pk_live_ for production) |
| VITE_GROQ_API_KEY | Yes | Groq API key. Note: this is bundled in the client JavaScript and visible in browser devtools. For production with real traffic, proxy this call through the backend. |
| VITE_EMAILJS_SERVICE_ID | No | EmailJS service ID |
| VITE_EMAILJS_TEMPLATE_ID | No | EmailJS outgoing message template ID |
| VITE_EMAILJS_AUTOREPLY_ID | No | EmailJS auto-reply template ID |
| VITE_EMAILJS_PUBLIC_KEY | No | EmailJS public key |

---

## Build and Deployment

```bash
npm run dev       # Vite dev server with HMR at localhost:5173
npm run build     # TypeScript compile + Vite production build to dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint check
```

The `vercel.json` rewrites all paths to `/index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This is required for client-side routing to work correctly. Without it, directly navigating to `/museums` would return a 404 from Vercel.

### Clerk production setup

Before deploying to production:
1. In the Clerk dashboard, switch to your Production instance.
2. Add your Vercel frontend domain to the Allowed Origins list.
3. Copy `pk_live_...` and set it as `VITE_CLERK_PUBLISHABLE_KEY` in Vercel.
4. Copy `sk_live_...` and set it as `CLERK_SECRET_KEY` in the backend Vercel project.

Using development Clerk keys on a production deployment will result in a browser warning and strict usage limits that will cause authentication to fail for real users.