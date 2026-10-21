# Architecture rules

- Employee migration uses a preview/mapping module and the authenticated employee-record insert path, not account registration; this avoids destructive re-registration and unsolicited email/SMS.
- Industry presets are bilingual static definitions applied additively to existing departments, positions and schedule templates; retries reuse existing items and never replace company settings or assign shifts to staff.- RS.ge integration is file export (Excel/CSV) built client-side; the database stores only an export log, never submissions, until official API access exists.
- External partner APIs (Smart Academy, FindMe) are called only through edge-function proxies with path whitelists; partner keys live in secrets and end-user partner tokens stay in sessionStorage, never in the database.
- Load testing runs read-only PostgREST requests from the admin-only load-test-runner edge function in batches of at most 50 virtual users per call; results go to load_test_runs, so tests never mutate real data.
