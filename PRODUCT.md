# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and freelancers working against deadlines. One person, their own account, their own list. The recurring scene is a real deadline that other people depend on: an assignment due Thursday, a client deliverable owed Friday, an invoice that has to go out before the month closes. They are usually behind at least one thing and they know it.

The job: see what is late, what is due next, and what can wait — then close items without ceremony. Capture happens in a hurry and often on a phone; triage happens at a desk.

## Product Purpose

Flow Mate is a per-account task list built around due dates. It exists so a deadline-driven person can hold their commitments in one place that does not itself become another thing demanding attention. Success means the user opens it, learns their true position against time in a couple of seconds, closes what is done, and leaves.

## Positioning

The list is organised around time rather than around projects or tags. There is no folder to create, no board to configure, no team to invite. The product's honesty is that it will tell you plainly when you are late, and otherwise stay silent. A project-management tool cannot truthfully copy this because its entire value comes from the structure Flow Mate refuses to add.

## Operating Context

- Deadline-driven, self-managed work: coursework, client deliverables, invoicing, personal obligations.
- Real use is a mix of hurried mobile capture and deliberate desktop triage.
- The user checks in several times a day in short bursts rather than living in the tool.
- Tasks carry: a title (up to 200 characters), an optional due date, a creation timestamp, and — once completed — a completion timestamp.
- Terminology in use: **ongoing** (not started/done), **completed**, **overdue**, **due date**.
- Empty list is the normal starting state for a new account, not an error state.

## Capabilities and Constraints

Confirmed functionality, all of which must survive any visual redesign:

- Email + password accounts. Sessions via httpOnly cookie, JWT. Register, sign in, sign out, session restored on load.
- Create, rename, complete, un-complete, and delete a task.
- Filter by status: All / Ongoing / Completed, with live counts.
- Filter by date scope: All time / Today / This week / This month — scoped on the task's creation date.
- Full-text search across every title the user has ever saved, debounced client-side.
- Pagination over the task list.
- Optimistic create and delete, with rollback and an error toast on failure.
- Light and dark theme, remembered per browser, defaulting to system preference.
- Every query is scoped server-side to the authenticated user. No shared lists, no admin view.
- Single origin on deploy: one Express service serves both the API and the built SPA.

Technical constraints:

- React 19 + Vite, Tailwind CSS v4, TanStack Query, React Router, Sonner, lucide-react.
- Express + Mongoose on MongoDB. The API contract is fixed for this work; the backend is not being changed.
- Node 22.12.0. Deployed on Render.
- The API cannot filter by due date, sort by due date, or store notes, subtasks, tags, priority, or reminders. Any date-scoped or priority-based view must be built from what the API returns.

## Evidence on Hand

- A working, deployed product with a real API and a real schema.
- Existing Vitest + MSW test suite (frontend) and a backend test suite.
- MIT licence; source at github.com/tricuongdao/FlowMate. Author: Tri Cuong (Vinny) Dao.
- No customers, testimonials, benchmarks, press, pricing, or usage metrics exist. Future work must not invent them.

## Product Principles

1. **Time is the structure.** A deadline-driven user's first question is "where do I stand against time?" Answer it before anything else on the screen.
2. **Late is the one loud fact.** Overdue work is the only thing permitted to raise its voice. Everything else stays at a conversational volume.
3. **Closing is the reward.** Completing a task should feel like a settlement, not a checkbox. Progress is the product's only celebration.
4. **Capture costs nothing.** A new task needs a title and nothing else. Every optional field must be deferrable.
5. **No management overhead.** Never ask the user to build a structure before they can hold a thought.

## Accessibility & Inclusion

- Full keyboard operation: every action reachable without a pointer, with a visible focus ring.
- Screen-reader announcements for list updates and live counts.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Contrast must hold in both light and dark themes.
