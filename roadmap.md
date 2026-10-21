# Roadmap — Strategy Guideline Gap Closure

## Current request: Competitor migration and industry templates
- [x] Expand industry presets with restaurant, construction, manufacturing, logistics, IT, finance, education, pharmacy, beauty and security; keep selection compatible with the expanded list.
- [x] Add Excel/CSV employee migration with column mapping, validation, duplicate protection and import results.
- [x] Add hotel, clinic and retail organization/schedule presets using existing permission rules.
- [x] Eight parsing/preset tests pass; authenticated preview and all three template selections checked without production writes. Final import/application writes are unverified under the non-destructive production audit constraint.

## Current request: UX audit critical fixes
- [x] Fix /index: broken evaluations link, stale stats, admin page enumeration.
- [x] Add inline Georgian validation errors to the employee form (phone, personal ID, salary, dates, noValidate).
- [x] Replace native confirm()/prompt() with confirmation dialogs in Payroll and LeaveRequests.
- [x] Persist search/filter state (Employees, LeaveRequests, Payroll, Tasks, Documents, WorkSchedules, ScheduleTemplates).
- [x] Add loading spinners to WorkSchedules, ShiftSchedules, ScheduleTemplates, LeaveRequests, Payroll, Tasks, Documents.
- [x] Add error state with retry to the six data-driven hub pages.
- [x] Tasks badge in sidebar, mobile breadcrumb visibility, BranchSwitcher duplicate removal, console.log cleanup.

## Current request: TalentOS UX audit
- [x] Inspect authenticated navigation and primary workflows without changing records.
- [x] Verify mobile, desktop, localization and feedback states; separate observed issues from source risks.
- [x] Deliver prioritized audit with annotated evidence, proposed layouts and staged recommendations; report explicitly excludes final record writes and unavailable employee/manager sessions.

## Current request: TalentOS UX visuals
- [x] Inventory all current functional pages and organize three complete alternatives.
- [x] Create three category maps and three matching menu mockups without changing the app.
- [x] Verify all visuals and deliver a comparison PDF plus individual images in one collection.

## Earlier roadmap (outside this request)

- [ ] Phase 1: HR Command Center — exception-first admin home page
- [ ] Phase 2: Workflow Engine — If→Then→Action tables + edge function + UI
- [ ] Phase 3: AI Copilot actions — Nina tool layer (approvals, onboarding plan, vacancy draft, reminders)
- [ ] Phase 4: Skills & Career — employee skills profile, gaps, recommended learning

## Current request: Performance & talent map
- [x] Performance score lib with renormalised weights, trend and potential (tests pass).
- [x] Performance tab on employee details + talent map page (/talent-map) with 9-box grid and role-fit mobility list.
- [x] Attendance counted only when lateness records exist; empty data now shows "—" instead of a fake 100/100.
- [x] Verified in preview: score breakdown, empty states, talent map grid render. Data-dependent placement untested until evaluations/skills data exist.
