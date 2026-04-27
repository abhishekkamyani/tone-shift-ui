# ToneShift - AI-Powered Text & Audio Chat Interface

## 1. Project Description
ToneShift is an AI-powered chat SPA that lets users interact via text and voice with different AI "tones" (Professional, Casual, Creative, etc.). It features Auth0 authentication, dark/light theming, and a polished chat UI.

## 2. Page Structure
- `/` - Landing Page (hero, login CTA)
- `/dashboard` - Protected Dashboard (sidebar + chat area + composer)
- `*` - 404 Not Found

## 3. Core Features
- [x] Dark/Light mode toggle with CSS variables
- [x] Auth0 Universal Login integration
- [x] Landing page with hero section
- [x] Dashboard with collapsible sidebar
- [x] Chat message list (user/ai roles)
- [x] Composer with text input, tone selector, voice button
- [x] useAudioRecorder hook (MediaRecorder API)
- [x] mockAi.ts with streaming simulation
- [x] Chat state management in DashboardPage
- [x] TypingIndicator component
- [x] CopyButton on AI messages
- [x] Toast notifications via sonner

## 4. Data Model Design
No database needed — all state is in-memory (SPA).

### Chat Message Shape
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique message ID |
| role | 'user' \| 'ai' | Message sender |
| content | string | Message text |
| timestamp | Date | When sent |

## 5. Backend / Third-party Integration Plan
- Auth0: Universal Login for authentication
- Supabase: Not needed
- Shopify: Not needed
- Stripe: Not needed

## 6. Development Phase Plan

### Phase 1: Foundation & Config
- Goal: Set up theme system, CSS variables, Tailwind config, dependencies
- Deliverable: Working color system, dark mode toggle

### Phase 2: Core Components
- Goal: Build all reusable components
- Deliverable: Auth, ChatMessage, Composer, Sidebar, ThemeToggle components

### Phase 3: Pages & Routing
- Goal: Build Landing and Dashboard pages, wire up routing
- Deliverable: Fully functional SPA with navigation
