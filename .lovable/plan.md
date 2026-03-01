
# Rework Site for Michael Zick Coaching Learning Platform

## Overview
Transform the current generic "Learnify" course marketplace into a branded learning platform for **Michael Zick Coaching**, matching the dark, masculine, nature-inspired aesthetic of michaelzick.com. The platform will focus on Nice Guy Recovery coaching content -- courses, workshops, and resources.

## Brand Style (from michaelzick.com)
- **Color palette**: Dark backgrounds (slate/charcoal), white text, blue accent (#3B82F6 for CTAs), muted earth tones
- **Imagery**: Mountain landscapes, ocean, waterfalls -- rugged nature photography
- **Typography**: Bold, clean sans-serif headings; minimal, direct copy
- **Tone**: Direct, masculine, no-nonsense coaching voice
- **Layout**: Full-bleed hero images, generous whitespace, clean sections

## Changes

### 1. Rebrand Colors & Theme (`src/index.css`, `tailwind.config.ts`)
- Replace "learnify" brand colors with Michael Zick palette: dark slate backgrounds, blue accent buttons, white/light gray text
- Update CSS variables for both light and dark modes (lean into dark-first design)
- Primary: deep navy/slate; Accent: bold blue (#3B82F6); Background: dark charcoal

### 2. Replace Course Data (`src/data/courses.ts`, `src/types/course.ts`)
- Update categories to coaching-relevant topics: "Nice Guy Recovery", "Relationship Skills", "Boundaries & Communication", "Self-Worth & Identity"
- Replace 8 courses with Michael Zick coaching content:
  - "The Approval Addiction Recovery Program"
  - "Boundaries & Communication Masterclass"
  - "Displeasure Tolerance Training"
  - "Relationship Frame Workshop"
  - "Parental Patterns & Self-Discovery"
  - "The Covert Contract Breaker"
  - "Dating from Standards, Not Scarcity"
  - "The Complete Nice Guy Recovery System"
- All courses by instructor "Michael Zick" with nature-themed thumbnail images from Unsplash
- Update Course type to add `CourseCategory` values for the new categories

### 3. Rework Homepage (`src/pages/Index.tsx`)
- **Hero**: Full-bleed mountain landscape background image, "Nice Guy Recovery Coach" headline, "Break the addiction to approval" subtext, "Start Here" and "Book a Free Session" CTAs
- **The Approval Addiction Recovery Loop**: 4-step process section with nature images (Spot the Bid, Cancel the Covert Contract, Build Displeasure Tolerance, Choose from Standards)
- **Signature Framework**: Numbered steps section (Examine Parental Relationships, Identify Needs & Values, Communication & Boundary Setting, Stay in the Discomfort)
- **Featured Courses**: Show 3 featured courses from the new data
- **Testimonials**: Replace with real testimonials from michaelzick.com (Ryan I., Doug S., Greg C., Earl M., Howard B.)
- **CTA Section**: "Book a Free Session" with Calendly link

### 4. Update Navbar (`src/components/Navbar.tsx`)
- Replace "Learnify" branding with "Michael Zick" text logo (bold white text, matching the site)
- Update nav links: Programs, Testimonials, About, Contact
- Replace "Sign up" with "Book a Free Session" CTA button (links to Calendly)
- Remove shopping cart icon (simplify to course enrollment model)

### 5. Update Footer (`src/components/Footer.tsx`)
- Rebrand to Michael Zick Coaching
- Update links: Programs, About, Testimonials, Contact, Blog
- Add link to questionnaire and Calendly booking
- Update social links and contact email

### 6. Update Supporting Pages
- **About page** (`src/pages/About.tsx`): Rewrite for Michael Zick's bio and coaching philosophy
- **Courses page** (`src/pages/CoursesPage.tsx`): Rename to "Programs", update filter categories
- **Course Details** (`src/pages/CourseDetails.tsx`): Restyle with dark theme, update CTA to "Enroll Now" or "Book a Session"

### 7. Update Filter Components (`src/components/courses/constants.ts`)
- Replace category options with new coaching categories
- Update any hardcoded "Learnify" references

## Technical Notes
- No new dependencies needed -- all changes use existing Tailwind, shadcn/ui, and lucide-react
- The cart system remains functional for course enrollment
- All existing routing structure is preserved; just content and styling changes
- Nature imagery sourced from Unsplash (free, no attribution needed for the placeholder URLs already in use)
