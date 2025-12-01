# Simplified Data Flow Diagram

## My Party Simulator - Data Flow Overview

```
                              ┌─────────┐
                              │  USER   │
                              └────┬────┘
                                   │
                ┌──────────────────┼──────────────────┐
                │                  │                  │
                ▼                  ▼                  ▼
        
┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   1. ONBOARDING       │  │   2. NEWS FEED       │  │   3. ANALYSIS        │
│      (Blue)           │  │     (Green)          │  │     (Purple)         │
└───────────────────────┘  └──────────────────────┘  └──────────────────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
    
 ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
 │ Onboarding  │          │  DailyFeed   │          │ WeeklyRecap  │
 │  Component  │          │  Component   │          │  Component   │
 └──────┬──────┘          └──────┬───────┘          └──────┬───────┘
        │                        │                          │
        ▼                        ▼                          ▼
        
 ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
 │ Demographics│          │ GET /api/news│          │ POST /api/   │
 │ + 5 Swipes  │          │              │          │   analyze    │
 └──────┬──────┘          └──────┬───────┘          └──────┬───────┘
        │                        │                          │
        ▼                        │                          │
                                 ▼                          ▼
 ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
 │ UserProfile │          │ Sveriges     │          │ Format       │
 │   Object    │          │ Radio RSS    │          │ Decisions    │
 └──────┬──────┘          └──────┬───────┘          └──────┬───────┘
        │                        │                          │
        ▼                        ▼                          ▼
        
 ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
 │ POST /api/  │          │ Filter by    │          │   OpenAI     │
 │ generate-   │          │ Political    │          │  Analysis    │
 │   party     │          │  Keywords    │          │  Assistant   │
 └──────┬──────┘          └──────┬───────┘          └──────┬───────┘
        │                        │                          │
        ▼                        ▼                          ▼
        
 ┌─────────────┐          ┌──────────────┐          ┌──────────────┐
 │   Party     │          │   OpenAI     │          │  Analysis    │
 │  Created    │          │  Rewriter    │          │   Result     │
 │             │          │  (Parallel)  │          │              │
 └──────┬──────┘          └──────┬───────┘          └──────┬───────┘
        │                        │                          │
        │                        ▼                          │
        │                 ┌──────────────┐                 │
        │                 │ NewsItem[]   │                 │
        │                 │ with AI text │                 │
        │                 └──────┬───────┘                 │
        │                        │                          │
        │                        ▼                          │
        │                 ┌──────────────┐                 │
        │                 │  SwipeCard   │                 │
        │                 │ (L/R/U swipe)│                 │
        │                 └──────┬───────┘                 │
        │                        │                          │
        │                        ▼                          │
        │                 ┌──────────────┐                 │
        │                 │ UserDecision │                 │
        │                 │    Array     │                 │
        │                 └──────┬───────┘                 │
        │                        │                          │
        └────────────────────────┼──────────────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  REACT STATE    │
                        │ ───────────────  │
                        │ • Party         │
                        │ • UserProfile   │
                        │ • Decisions[]   │
                        │ • NewsItems[]   │
                        └─────────────────┘

═══════════════════════════════════════════════════════════════════

                        EXTERNAL SERVICES
                        
     ┌──────────────────┐  ┌──────────────────┐
     │ Sveriges Radio   │  │   OpenAI API     │
     │   Ekot RSS       │  │ ──────────────── │
     │                  │  │ • Rewriter Asst  │
     │ Political news   │  │ • Analysis Asst  │
     └──────────────────┘  └──────────────────┘
```

---

## Key Data Objects

### 1. UserProfile
```typescript
{
  region: string
  interests: string[]
  mascotVibe: 'turtle' | 'dog' | 'penguin'
  snack: 'banana' | 'pizza' | 'croissant'
  hqVibe: 'forest' | 'city' | 'beach'
  communicationStyle: 'nerdy' | 'chill' | 'chaotic'
  themeMusic: 'rock' | 'pop' | 'techno'
}
```

### 2. Party
```typescript
{
  id: string
  name: string
  emblem: string (emoji)
  description: string
  color: string
  stats: { members, popularity }
}
```

### 3. NewsItem
```typescript
{
  id: string
  title: string
  summary: string
  rolePlayPrompt: string
  rewrittenSummary?: string  // AI version
  rewrittenPrompt?: string   // AI version
  source: string
  date: string
}
```

### 4. UserDecision
```typescript
{
  newsId: string
  decision: 'support' | 'oppose' | 'neutral'
  timestamp: number
}
```

### 5. AnalysisResult
```typescript
{
  partyMatches: [{
    name: string
    matchPercentage: number
    explanation: string
  }]
  whatThisMeans: string
  politicalTendencies: string
}
```

---

## Simple Flow Summary

### 🔵 Onboarding
**Input:** User answers questions  
**Process:** Generate personalized party  
**Output:** Party object stored in state  

### 🟢 News Feed  
**Input:** Fetch political news  
**Process:** Filter → AI rewrite → Display  
**Output:** User decisions collected  

### 🟣 Analysis  
**Input:** User decisions + news context  
**Process:** AI analyzes political alignment  
**Output:** Party matches & insights  

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-party` | POST | Create personalized party from profile |
| `/api/news` | GET | Fetch & rewrite political news |
| `/api/analyze` | POST | Analyze decisions for political alignment |

---

## OpenAI Assistants

| Assistant | ID | Purpose |
|-----------|---|---------|
| Content Rewriter | `asst_BAQmpTvpqWvIyHYkSfQBfTUn` | Rewrite news with personality |
| Political Analyzer | `asst_hOeHkPilIx8GaDjukFqFT5yc` | Analyze user decisions |

---

**This simplified view shows the three main user journeys through the application.**
