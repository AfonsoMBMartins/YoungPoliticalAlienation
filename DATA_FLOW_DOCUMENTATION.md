# Data Flow Documentation - My Party Simulator

## Overview
This document describes the complete data flow for the "My Party Simulator" application, a Next.js-based political party simulator that uses OpenAI assistants to rewrite news and analyze user decisions.

## Architecture Overview

### Main Components
1. **page.tsx** - Central state manager coordinating three views:
   - Onboarding view
   - Dashboard view (Daily Feed)
   - Recap view (Your Party / Analysis)

2. **Key Data Types**
   - `UserProfile` - User demographics and personality choices
   - `Party` - Generated political party based on user profile
   - `NewsItem` - Political news with AI-rewritten content
   - `UserDecision` - User's stance on news items
   - `AnalysisResult` - Political alignment analysis

---

## 1. Onboarding Flow 🔵

### Purpose
Collect user preferences to generate a personalized political party.

### Flow Steps

```
User Input
    ↓
OnboardingFlow Component
    ↓
┌─────────────────────────────┐
│ Step 1: Demographics        │
│ - Region selection          │
│ - Interest selection (3+)   │
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Step 2: Fun Swipe Questions │
│ 1. Party mascot vibe        │
│ 2. Brainstorming snack      │
│ 3. HQ vibe (location)       │
│ 4. Communication style      │
│ 5. Theme music              │
└─────────────────────────────┘
    ↓
User Profile Object Created
    ↓
POST /api/generate-party
    ↓
Party Generated
    ↓
Stored in page.tsx state
```

### API Endpoint: `/api/generate-party`
- **Method**: POST
- **Input**: UserProfile
- **Processing**:
  - Uses profile data to seed party name generation
  - Selects adjectives based on `communicationStyle`
  - Selects nouns based on `hqVibe`
  - Chooses emblem from `mascotVibe` and `snack`
  - Generates description with personality traits
- **Output**: Party object with:
  - Unique ID
  - Generated name
  - Emblem (emoji)
  - Description
  - Color
  - Initial stats (members, popularity)

### Data Structure
```typescript
UserProfile {
  ageRange: string
  region: string
  interests: string[]
  mascotVibe: 'turtle' | 'dog' | 'penguin'
  snack: 'banana' | 'pizza' | 'croissant'
  hqVibe: 'forest' | 'city' | 'beach'
  communicationStyle: 'nerdy' | 'chill' | 'chaotic'
  themeMusic: 'rock' | 'pop' | 'techno'
}

Party {
  id: string
  name: string
  description: string
  emblem: string
  color: string
  stats: { members: number, popularity: number }
  history: Array<{ date: string, decisions: UserDecision[] }>
}
```

---

## 2. News/Dashboard Flow 🟢

### Purpose
Fetch political news, rewrite with AI personality, present to user for decisions.

### Flow Steps

```
DailyFeed Component Mounts
    ↓
GET /api/news
    ↓
┌──────────────────────────────────┐
│ News Fetching & Processing       │
│                                  │
│ 1. Fetch SR Atom Feed            │
│    (Sveriges Radio Ekot)         │
│                                  │
│ 2. Parse XML Feed                │
│    - Extract entries             │
│    - Clean HTML entities         │
│                                  │
│ 3. Filter Political News         │
│    - Check publication date      │
│    - Match political keywords    │
│    - Calculate relevance score   │
│    - Sort by score               │
│                                  │
│ 4. Take top 10 articles          │
└──────────────────────────────────┘
    ↓
Parallel AI Rewriting (for each article)
    ↓
┌──────────────────────────────────┐
│ rewriteWithAssistant()           │
│ (lib/openai.ts)                  │
│                                  │
│ For summary AND rolePlayPrompt:  │
│ 1. Create Thread                 │
│ 2. Add Message (original text)   │
│ 3. Run Assistant                 │
│ 4. Wait for Completion           │
│ 5. Extract Response              │
└──────────────────────────────────┘
    ↓
NewsItem Array Created
    ↓
Return to DailyFeed Component
    ↓
Render SwipeCard Components
    ↓
User Swipes (Left/Right/Up)
    ↓
Create UserDecision
    ↓
Store in page.tsx state
```

### API Endpoint: `/api/news`
- **Method**: GET
- **External Data Source**: Sveriges Radio Ekot RSS Feed
  - URL: `https://api.sr.se/api/rss/program/83`
- **Political Keywords Filter**:
  - Swedish: politik, riksdag, regering, minister, statsminister, lag, förslag, beslut, reform, budget, parti, val, debatt, proposition, motion, omröstning, skatt, välfärd, migration, klimat, energi
  - English: government, parliament, policy, election
- **Processing**:
  1. Parse Atom/XML feed
  2. Filter by date (last 7 days)
  3. Filter by political keywords
  4. Calculate relevance score
  5. Sort by score
  6. Take top 10
- **AI Rewriting**:
  - Uses `OpenAI Assistant API` with configured assistant ID
  - Creates separate threads for each text to rewrite
  - Processes summaries and prompts in parallel
- **Output**: Array of NewsItem objects

### OpenAI Integration (lib/openai.ts)
- **Assistant ID**: From `process.env.OPENAI_ASSISTANT_ID`
- **API Base**: `https://api.openai.com/v1`
- **Process**:
  1. `createThread()` - Creates a new conversation thread
  2. `addMessage()` - Adds user message with original text
  3. `runAssistant()` - Runs the assistant on the thread
  4. `waitForCompletion()` - Polls for completion (max 30 attempts, 1s interval)
- **Error Handling**: Falls back to original text on failure

### Data Structure
```typescript
NewsItem {
  id: string
  title: string
  summary: string                    // Original neutral summary
  rolePlayPrompt: string             // Original neutral prompt
  source: string
  category: string
  date: string
  tags: string[]
  url?: string
  rewrittenSummary?: string          // AI-rewritten version
  rewrittenPrompt?: string           // AI-rewritten prompt
}

UserDecision {
  newsId: string
  decision: 'support' | 'oppose' | 'neutral'
  timestamp: number
}
```

### Swipe Directions
- **Left Swipe**: Oppose
- **Right Swipe**: Support
- **Up Swipe**: Neutral/Skip

---

## 3. Analysis Flow 🟣

### Purpose
Analyze user decisions to determine political alignment and party matches.

### Flow Steps

```
User Clicks "View Party" / "See Full Analysis"
    ↓
Navigate to WeeklyRecap Component
    ↓
Component Mounts → Trigger Analysis
    ↓
POST /api/analyze
  Payload: {
    decisions: UserDecision[],
    newsItems: NewsItem[]
  }
    ↓
┌──────────────────────────────────┐
│ API Validation                   │
│ - Minimum 8 decisions required   │
│ - Check API key configured       │
└──────────────────────────────────┘
    ↓
Format Decisions for Analysis
  For each decision:
  {
    title: newsItem.title,
    summary: newsItem.summary,
    userResponse: decision.decision
  }
    ↓
┌──────────────────────────────────┐
│ OpenAI Analysis Assistant        │
│ ID: asst_hOeHkPilIx8GaDjukFqFT5yc│
│                                  │
│ 1. Create Thread                 │
│ 2. Add Message (formatted JSON)  │
│ 3. Run Assistant                 │
│ 4. Wait for Completion           │
│    (polls every 1s, max 30s)     │
│ 5. Extract Assistant Response    │
└──────────────────────────────────┘
    ↓
Parse Analysis Response
  - Try JSON parsing first
  - Fall back to markdown parsing
  - Extract party matches
  - Extract political tendencies
  - Extract "What This Means"
    ↓
Return AnalysisResult
    ↓
Display in WeeklyRecap Component
```

### API Endpoint: `/api/analyze`
- **Method**: POST
- **Input**: 
  - `decisions`: Array of UserDecision
  - `newsItems`: Array of NewsItem (for enrichment)
- **Validation**:
  - Requires minimum 8 decisions
  - Requires OpenAI API key
- **Processing**:
  1. Format decisions with news context
  2. Create OpenAI thread
  3. Send formatted decisions as JSON
  4. Run analysis assistant
  5. Wait for completion
  6. Parse response (JSON or Markdown)
- **Output**: AnalysisResult object

### Analysis Assistant
- **ID**: `asst_hOeHkPilIx8GaDjukFqFT5yc`
- **Input Format**: JSON array of objects with title, summary, userResponse
- **Expected Output Format**: JSON or Markdown with:
  - Party match percentages
  - Political tendencies analysis
  - Personalized interpretation

### Response Parsing
1. **Primary**: Try to parse as JSON
   - Remove markdown code blocks if present
   - Parse party matches object
2. **Fallback**: Parse as Markdown
   - Extract "What This Means For You" section
   - Extract "Your Political Match" section
   - Parse party names and percentages from bullet points
3. **Error Handling**: Store raw response if parsing fails

### Data Structure
```typescript
AnalysisResult {
  Statement?: string
  partyMatches?: Array<{
    name: string
    matchPercentage: number
    explanation: string
  }>
  // Legacy fields for backward compatibility
  summary?: string
  politicalTendencies?: string
  patterns?: string[]
  partyAlignment?: Array<{
    name: string
    match: number
    color?: string
  }>
  allies?: string[]
  whatThisMeans?: string
  politicalMatch?: Array<{
    party: string
    percentage: number
  }>
  rawResponse?: string
  error?: string
}
```

---

## 4. State Management

### Main Application State (page.tsx)
```typescript
State Variables:
- party: Party | null               // Generated or mock party
- loading: boolean                  // Loading state
- view: 'onboarding' | 'dashboard' | 'recap'
- storedProfile: UserProfile | null // For randomization
- decisions: UserDecision[]         // User's political decisions
- newsItems: NewsItem[]             // Fetched news articles
```

### State Flow
```
Initial: view = 'onboarding', party = null
    ↓
Onboarding Complete → party created
    ↓
view = 'onboarding' (showing party preview)
    ↓
User clicks "Start Daily Decisions"
    ↓
view = 'dashboard'
    ↓
DailyFeed collects decisions
    ↓
decisions[] and newsItems[] updated via callback
    ↓
User completes all cards OR clicks "View Party"
    ↓
view = 'recap'
    ↓
WeeklyRecap fetches analysis
    ↓
User clicks back
    ↓
view = 'dashboard'
```

---

## 5. External Dependencies

### APIs
1. **Sveriges Radio Ekot RSS Feed**
   - URL: `https://api.sr.se/api/rss/program/83`
   - Format: Atom/XML
   - Updates: Real-time political news
   - Rate Limit: None specified

2. **OpenAI Assistants API**
   - Base URL: `https://api.openai.com/v1`
   - Version: `assistants=v2`
   - Authentication: Bearer token
   - Assistants Used:
     - Content Rewriter (OPENAI_ASSISTANT_ID)
     - Political Analyzer (asst_hOeHkPilIx8GaDjukFqFT5yc)

### Environment Variables
```
OPENAI_API_KEY=<your-key>
OPENAI_ASSISTANT_ID=<content-rewriter-id>
NEXT_PUBLIC_SKIP_ONBOARDING=false  # Development flag
```

---

## 6. Data Persistence

### Current Implementation
- **Browser State Only**: All data stored in React component state
- **Session-based**: Data lost on page refresh
- **No Backend Database**: Serverless architecture

### Stored Data Types
1. **UserProfile**: User demographics and preferences
2. **Party**: Generated party information
3. **UserDecision[]**: All user decisions during session
4. **NewsItem[]**: Fetched and rewritten news articles
5. **AnalysisResult**: Latest political analysis

### Future Enhancement Opportunities
- LocalStorage persistence
- Backend database (MongoDB, PostgreSQL)
- User authentication
- Historical tracking across sessions

---

## 7. Error Handling

### API Error Handling
1. **News Fetch Failure**:
   - Returns empty array
   - Component shows empty state
   
2. **OpenAI Rewrite Failure**:
   - Falls back to original text
   - Logs error but continues
   - Sets `success: false` in response

3. **Analysis Failure**:
   - Returns error in AnalysisResult
   - Component displays error message
   - Minimum 8 decisions validation

### Network Resilience
- All API calls wrapped in try-catch
- Graceful degradation
- User-friendly error messages

---

## 8. Performance Considerations

### Optimization Strategies
1. **Parallel News Rewriting**:
   - Uses `Promise.all()` for concurrent API calls
   - Processes 10 articles simultaneously
   
2. **Lazy Loading**:
   - News fetched only when DailyFeed mounts
   - Analysis triggered only when viewing recap

3. **Efficient Rendering**:
   - AnimatePresence for smooth transitions
   - Only renders 2 cards at a time (current + next)
   - Conditional rendering based on state

---

## 9. User Journey Summary

```
1. User visits site
2. Completes demographic form (region, interests)
3. Swipes through 5 fun personality questions
4. Receives personalized party
5. Can randomize party name/emblem
6. Starts daily decisions
7. DailyFeed fetches & rewrites news from SR
8. User swipes through political news
9. Each swipe = decision (support/oppose/neutral)
10. After 8+ decisions, can view analysis
11. Analysis sent to OpenAI assistant
12. Receives political alignment & party matches
13. Views decision history with timestamps
14. Can return to dashboard for more decisions
```

---

## 10. Key Features

### Implemented
✅ Personalized party generation from user profile  
✅ Real-time political news from Sveriges Radio  
✅ AI-powered content rewriting with personality  
✅ Swipe-based decision interface  
✅ Political alignment analysis  
✅ Party match percentages  
✅ Decision history tracking  
✅ Responsive UI with animations  

### Technical Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React with Framer Motion
- **Styling**: Tailwind CSS
- **AI**: OpenAI Assistants API v2
- **Icons**: Lucide React
- **Language**: TypeScript

---

## Conclusion

This application demonstrates a clean data flow architecture with:
- Clear separation of concerns (components, API routes, lib utilities)
- Type-safe data handling with TypeScript
- Graceful error handling and fallbacks
- External API integration (SR News, OpenAI)
- Engaging user experience with AI-powered personalization

The data flows unidirectionally through the application, making it easy to trace and debug.
