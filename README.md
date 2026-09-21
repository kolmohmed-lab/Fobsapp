# Fobsapp — Formal Lesson Observation

A polished, print-friendly HTML prototype for the DAIS & DHS Formal Lesson Observation workflow.

## Current prototype

- Responsive observation form
- Teal DAIS/DHS-inspired visual design
- Outstanding / Acceptable / Incomplete ratings using green / yellow / red
- Detailed faculty teaching and student learning criteria
- Student attainment and progress statement selectors
- Automatic summary calculations
- Manual overrides for calculated outcomes
- Local browser autosave for testing
- Dedicated A4 print stylesheet
- Text areas expand before printing so longer feedback is not clipped
- Reference rubrics from the original form

## Scoring used in the prototype

- Outstanding = 3
- Acceptable = 2
- Incomplete = 1
- Average >= 2.5 → Outstanding
- Average >= 1.5 → Acceptable
- Average < 1.5 → Incomplete

These rules can be changed later.

## Planned data flow

The current version intentionally does not send data anywhere.

Future architecture:

Browser form → Vercel → Power Automate → Microsoft List

The completed observation can also be rendered/printed to PDF for a formal record.

## Deploy on Vercel

This is a static site. Import this GitHub repository into Vercel and deploy using the default settings. No build command or framework preset is required for the current prototype.
