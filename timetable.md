# 30-Day GTM Engineering Execution Plan

## Purpose

This is a build-first plan for becoming demonstrably employable for entry-level GTM Engineering / Revenue Operations Engineering work. Execute it exactly. The output is not “knowledge”; the output is a public portfolio of working revenue systems, clean documentation, and evidence that you can operate a GTM stack.

## Scope and Definitions

- **GTM Engineering:** designing, building, integrating, automating, measuring, and maintaining systems that help a company find, qualify, contact, convert, and retain customers.
- **Primary stack:** HubSpot CRM, Python or JavaScript/Node.js, SQL, GitHub, n8n, HTTP APIs/webhooks, spreadsheets/CSV, and a lightweight database (Postgres/Supabase preferred).
- **Main portfolio project:** `gtm-revenue-engine` — an end-to-end lead-to-pipeline system. Build it continuously from Day 6 onward.
- **Use test data only.** Do not scrape restricted data, spam people, evade platform limits, or send campaigns to real prospects without explicit permission.

## Non-Negotiable Rules

1. Work six focused hours minimum each day, excluding gym/meals. If you miss a block, reschedule it the same day.
2. No short-form video, Instagram/Reels/YouTube feed, games, or random browsing before 9:00 PM. Resources must be opened only for today’s task.
3. Build before watching: maximum 90 minutes of passive learning per day; all remaining time is implementation, debugging, documentation, or testing.
4. Make at least one meaningful Git commit daily. A meaningful commit changes code, configuration, tests, documentation, or a project artifact—never an empty “progress” commit.
5. End every day with: pushed code, updated README/TODO, a 5–10 line work log, and tomorrow’s first task written down.
6. Ask an LLM for explanations, review, or debugging—not for a project you cannot explain. You must be able to explain every file, API call, workflow, and metric in your portfolio.
7. Do not change the day’s goal because a tutorial looks more exciting. Finish the stated deliverable first.
8. LeetCode is capped at 45 minutes/day. GTM project work always wins.

## Standard Daily Timetable

Adjust clock times only if necessary; keep the block order and total focused work.

| Time | Work | Output |
|---|---|---|
| 8:00–9:00 | Exercise / breakfast | Energy, no phone feed |
| 10:00–11:30 | Learn today’s exact concepts | Notes: definitions, examples, questions |
| 11:45–2:00 | Guided implementation | First working version of today’s task |
| 3:00–6:00 | Main build block | Tested project deliverable |
| 7:00–7:45 | LeetCode or SQL practice | One solved problem + explanation |
| 8:00–9:00 | Read / document / publish | Work log; LinkedIn post every second day |
| 9:00–9:20 | Review and plan next day | Updated task checklist |

## Daily Operating Procedure

1. Read only today’s section and define “done” before opening any resource.
2. Create a GitHub issue or markdown checkbox for each task.
3. Learn just enough to start (documentation first; targeted video only when needed).
4. Build, test with sample data, and handle at least one failure case.
5. Commit and push with an imperative message, e.g. `add hubspot csv contact importer`.
6. Update the project README with setup/run instructions, decisions, screenshots, sample inputs, and results.
7. Record blockers and their resolution in `docs/work-log.md`.

## Learning Resource Categories (Use These, Not Random Content)

For each day, use one primary official source and only add a targeted secondary source if blocked.

- **CRM / HubSpot:** HubSpot Academy and HubSpot developer/API documentation.
- **Automation / n8n:** n8n official docs, templates only as references, and node documentation.
- **APIs / Webhooks:** provider API docs, MDN HTTP documentation, Postman learning center.
- **Python/Node:** official Python docs or Node.js docs; use the standard `requests`/`fetch` approach before frameworks.
- **SQL / Postgres:** PostgreSQL documentation and SQLBolt/Mode-style practice exercises.
- **Data / enrichment:** CSV handling docs, Clay/Apollo documentation for concepts; use synthetic/sample records unless you have authorized access.
- **Email / deliverability / copy:** Gmail/HubSpot guidance, reputable deliverability resources, and teardown of public outbound examples. Learn principles; do not mass-send.
- **Analytics:** HubSpot reporting docs, SQL aggregation docs, and funnel-analysis guides.
- **Security / compliance:** OAuth provider docs; privacy, consent, and CAN-SPAM/GDPR overview from authoritative sources.

## GitHub Requirements

Create these repositories by Day 6:

1. `gtm-engineering-labs` — small daily exercises (CRM API, webhook receiver, SQL queries, n8n exports).
2. `gtm-revenue-engine` — final end-to-end portfolio project.

Every repository must include:

- A clear README: business problem, architecture, setup, environment variables, run instructions, demo data, and screenshots/diagram.
- `.env.example`; never commit secrets, tokens, API keys, or private contacts.
- `docs/` containing design decisions, API notes, and work log.
- A simple test or reproducible validation command for each important integration.
- Clean commit history with daily commits.

## LeetCode and SQL Guidance

- Maximum: **45 minutes total/day**.
- Days 1–10: one Easy array/string/hash-map problem, or 20 minutes SQL + one Easy problem.
- Days 11–30: prioritize SQL on alternating days: joins, grouping, window functions, funnel/cohort queries. On other days do one Easy or one Medium only if finished within the cap.
- Stop at 45 minutes even if unsolved. Write what you tried and review the pattern. Do not sacrifice the build block.
- Target by Day 30: 15–20 problems total and 10 practical SQL queries—not 100 random questions.

---

# 30-Day Plan

## Week 1 — Learn the GTM System, Then Integrate It

### Day 1 — GTM map and vocabulary

**Objective:** Understand the full revenue workflow and where engineering creates leverage.

**Tasks:**

- Define: ICP, persona, lead, contact, account/company, MQL, SQL, opportunity/deal, pipeline stage, lifecycle stage, conversion rate, attribution, enrichment, CRM, RevOps, SLA.
- Draw a lead lifecycle: source → capture → enrich → qualify → route → outreach → meeting → opportunity → closed won/lost → reporting.
- Choose one hypothetical B2B SaaS company for all work: product, buyer, company size, geography, and pain point. Write a one-page ICP.
- Create `gtm-engineering-labs` and add `docs/gtm-map.md` with your diagram and definitions.

**Deliverable:** GTM architecture diagram + ICP document committed to GitHub.

**Done when:** You can explain each handoff and name the system of record for it.

### Day 2 — CRM fundamentals in HubSpot

**Objective:** Operate a CRM manually before automating it.

**Tasks:**

- Create a free HubSpot developer/test account if available.
- Learn contacts, companies, deals, associations, pipelines, lifecycle stages, properties, lists, and activities.
- Configure a pipeline for the hypothetical company with 5–7 stages and stage definitions.
- Add 20 synthetic contacts, 10 companies, and 5 deals. Create custom properties: ICP tier, lead source, fit score, last enrichment date, owner, and qualification reason.
- Document the data model in `docs/hubspot-data-model.md`.

**Deliverable:** Populated test CRM + documented schema and pipeline.

**Done when:** You can show how a contact relates to a company and deal, and why each property exists.

### Day 3 — HubSpot API: CSV to CRM

**Objective:** Write a safe, repeatable CRM importer.

**Tasks:**

- Read HubSpot authentication and Contacts API documentation.
- Create a 25-row synthetic CSV with valid/invalid rows and duplicates.
- Build a Python or Node script that validates records, creates/updates contacts, logs results, and skips duplicates.
- Add dry-run mode and a summary: created, updated, skipped, failed.
- Put credentials in `.env`; create `.env.example`.

**Deliverable:** `csv_to_hubspot` script, sample CSV, setup instructions, and terminal-output screenshot.

**Done when:** Running it twice does not create duplicate records (idempotency).

### Day 4 — HTTP and API reliability

**Objective:** Understand how integrations fail and design for it.

**Tasks:**

- Study HTTP methods/status codes, headers, bearer auth, pagination, rate limits, timeouts, retries, exponential backoff, and idempotency keys.
- Extend the Day 3 importer with pagination where relevant, retry/backoff for transient errors, error logging, and explicit handling for 400/401/403/429/5xx responses.
- Build a small generic API client module with tests/mocked responses.
- Write `docs/api-reliability.md`: expected failure modes and how your code handles each.

**Deliverable:** Reusable API client + reliability documentation.

**Done when:** You can demonstrate a rate-limit or temporary-error simulation without losing or duplicating data.

### Day 5 — Webhooks and event-driven workflows

**Objective:** Receive, validate, and process an event safely.

**Tasks:**

- Learn webhooks, webhook signatures, event payloads, acknowledgement, retries, replay, dead-letter queues, and idempotency.
- Build a local webhook receiver (Express/FastAPI). Log event ID, type, timestamp, and payload.
- Implement signature verification if your test provider supports it; otherwise document the intended mechanism.
- Deduplicate repeated event IDs and return appropriate status codes.
- Test with Postman or a webhook test service using valid, malformed, and duplicate payloads.

**Deliverable:** Webhook receiver with test payloads and `docs/webhook-design.md`.

**Done when:** Duplicate deliveries cause no duplicate business action.

### Day 6 — Start the main project: architecture and repository

**Objective:** Turn isolated labs into one revenue-engineering system.

**Tasks:**

- Create `gtm-revenue-engine`.
- Define the project problem: “Turn an approved CSV of target accounts into enriched, scored, routed CRM records and a measurable pipeline dashboard.”
- Create an architecture diagram: CSV/input → validation → enrichment adapter → scoring → HubSpot → n8n notifications → Postgres/logs → dashboard/report.
- Scaffold folders: `src/`, `tests/`, `data/`, `docs/`, `workflows/`.
- Define input/output contracts and success metrics: records processed, duplicate rate, qualified-lead rate, routing latency, meeting conversion (simulated if needed).

**Deliverable:** Main-project README, diagram, backlog, `.env.example`, and initial scaffold.

**Done when:** A reviewer can understand the business value and system flow in five minutes.

### Day 7 — Week 1 review and public proof

**Objective:** Consolidate and expose what you built.

**Tasks:**

- Fix setup bugs; run every Week 1 lab from a fresh terminal/account where possible.
- Write a 500–800 word weekly retrospective: what you built, one failure, how you fixed it, and next week’s risk.
- Publish a concise LinkedIn post with a screenshot/diagram and link to your repository. Do not exaggerate.
- Read one GTM/RevOps case study and capture: company context, system change, metric, and lesson.

**Deliverable:** Week 1 retrospective, clean repositories, and one public update.

**Done when:** All Week 1 projects have run instructions and no secrets in Git history.

## Week 2 — Data, Automation, Qualification, and Routing

### Day 8 — n8n fundamentals

**Objective:** Build an automation workflow without hiding the logic.

**Tasks:**

- Install/run n8n locally or use an approved hosted test environment.
- Learn triggers, nodes, credentials, expressions, error handling, execution history, and webhook triggers.
- Build: webhook receives a synthetic lead → validates required fields → sends a Slack/email-style test notification or writes a row to a spreadsheet/database.
- Export the workflow JSON to `workflows/` and document each node.

**Deliverable:** Versioned n8n workflow with a working test run.

**Done when:** You can replay a test event and trace every step in execution history.

### Day 9 — Enrichment design

**Objective:** Add useful data while respecting data quality and authorization.

**Tasks:**

- Define an enrichment schema: website, industry, employee range, country, LinkedIn/company URL if authorized, data source, confidence, and enriched-at timestamp.
- Implement an enrichment adapter using a permitted API, public test endpoint, or deterministic mock data. Never fabricate results silently.
- Add field-level provenance and confidence.
- Define a fallback for missing/failed enrichment.

**Deliverable:** Enrichment module + before/after sample records + data dictionary.

**Done when:** Every enriched field says where it came from and when it was last updated.

### Day 10 — Lead scoring and qualification

**Objective:** Convert an ICP into explicit, testable logic.

**Tasks:**

- Create a scoring rubric (0–100) using firmographic fit, persona fit, intent/engagement signals, and data confidence.
- Implement the scoring function with configuration stored in JSON/YAML or code constants.
- Define tiers: A (80+), B (60–79), C (<60), plus disqualification rules.
- Write at least 10 test cases covering edge cases and explain false positives/negatives.

**Deliverable:** Lead-score module, tests, and scoring policy.

**Done when:** You can change a score rule without rewriting the workflow.

### Day 11 — CRM routing and ownership

**Objective:** Assign qualified records correctly and visibly.

**Tasks:**

- Define routing rules based on territory, segment, company size, score, and named-account exception.
- Implement deterministic routing and an “unassigned/review” fallback queue.
- Upsert routed records and owner/routing reason to HubSpot (or a clearly documented mock adapter).
- Trigger a notification for A-tier leads through n8n.

**Deliverable:** Routing module, configuration table, workflow export, and tests.

**Done when:** Every lead has exactly one owner or an explicit review status.

### Day 12 — SQL and operational data store

**Objective:** Make the system auditable beyond the CRM.

**Tasks:**

- Set up Postgres/Supabase locally or through an approved test project.
- Create tables for ingestion runs, lead events, enrichment attempts, score results, and routing decisions.
- Persist each processing step with run ID and timestamps.
- Write queries for: total processed, failures by reason, A-tier rate, duplicate rate, leads by owner, and average processing time.

**Deliverable:** Schema/migration, seed data, and six saved SQL queries.

**Done when:** You can answer “what happened to this lead?” from the data store.

### Day 13 — Orchestrate the full workflow

**Objective:** Connect input, transformation, CRM, logging, and notification.

**Tasks:**

- Build an end-to-end run on 50 synthetic leads.
- Flow: validate → dedupe → enrich → score → route → upsert CRM → persist events → notify A-tier owner.
- Add configurable feature flags for external calls and dry-run mode.
- Capture a demo recording or screenshots of each stage.

**Deliverable:** First end-to-end project demo and a reproducible sample run.

**Done when:** A 50-lead run produces a summary and leaves the CRM/database in the expected state.

### Day 14 — Week 2 QA and case study

**Objective:** Make the workflow reliable enough to show.

**Tasks:**

- Create a test matrix: missing email, bad domain, duplicate record, API timeout, rate limit, no routing match, invalid webhook, and repeat run.
- Execute every test and document observed/expected behavior.
- Refactor the most confusing function/workflow; improve README setup.
- Read one RevOps or outbound-system case study; document one idea you will apply next week.

**Deliverable:** QA report and Week 2 project release/tag.

**Done when:** Known failure cases are handled or explicitly surfaced, never silently ignored.

## Week 3 — Outbound Systems, Measurement, and Production Thinking

### Day 15 — Outbound foundations and ethical copy

**Objective:** Understand outbound as a controlled system, not message blasting.

**Tasks:**

- Learn ICP research, value proposition, personalization levels, CTA design, deliverability basics, consent, opt-out, and sequence metrics.
- Write three email variants for the hypothetical ICP: a pain-led version, a trigger-led version, and a referral-style version. Use placeholders; do not send.
- Create a message-generation template fed by approved CRM fields, with strict rules against invented facts.
- Add a human approval state before any send action.

**Deliverable:** `docs/outbound-copy.md` and message-template module.

**Done when:** Each email is specific, under 120 words, includes a clear CTA, and has no fabricated personalization.

### Day 16 — Sequence state machine

**Objective:** Model follow-up logic safely.

**Tasks:**

- Define states: draft, pending approval, queued, sent, replied, positive reply, negative reply, bounced, unsubscribed, meeting booked, paused.
- Define transitions and stop conditions. Replies, unsubscribe, bounce, and meeting must immediately stop the sequence.
- Implement the state machine in code/database using synthetic records.
- Add sequence timing and send-window configuration, but no real sends.

**Deliverable:** State diagram + sequence engine simulation.

**Done when:** No simulated lead can remain in an active sequence after a stop condition.

### Day 17 — Email events and CRM updates

**Objective:** Process engagement events accurately.

**Tasks:**

- Create synthetic events for delivered, opened, clicked, replied, bounced, unsubscribed, and meeting booked.
- Extend webhook receiver to validate, dedupe, store, and map events to the contact/deal.
- Update sequence state and relevant CRM fields based on events.
- Build tests for out-of-order and duplicate events.

**Deliverable:** Event processor + event mapping documentation.

**Done when:** Replaying the same event or receiving it late produces the correct final state.

### Day 18 — Funnel metrics and dashboard queries

**Objective:** Measure the system rather than merely automate it.

**Tasks:**

- Define the funnel: targets → valid leads → enriched → qualified → routed → approved → simulated sent → replies → meetings → opportunities.
- Write SQL for count, rate, and drop-off at every stage, segmented by ICP tier/source/owner.
- Build a simple dashboard using HubSpot reporting, Metabase, a spreadsheet, or a documented query report.
- State which metrics are leading indicators and which are lagging indicators.

**Deliverable:** Dashboard screenshots plus documented formulas.

**Done when:** A reader can identify the largest drop-off and propose a test from the dashboard.

### Day 19 — Experiment design and attribution

**Objective:** Learn to improve GTM systems scientifically.

**Tasks:**

- Define one test: e.g., two CTA variants or two ICP segments. State hypothesis, audience, control, success metric, sample limitations, and decision rule.
- Add campaign/experiment IDs to your sample records and event schema.
- Write attribution logic for a simple first-touch and last-touch model; explain limitations.
- Generate synthetic results and compare variants with care—do not claim significance without enough data.

**Deliverable:** Experiment brief, attribution queries, and sample analysis.

**Done when:** You can distinguish correlation, attribution, and causation in your project explanation.

### Day 20 — Data quality and observability

**Objective:** Detect system decay before revenue teams complain.

**Tasks:**

- Define data-quality checks: missing required fields, invalid email/domain, stale enrichment, duplicates, impossible lifecycle transitions, and ownerless leads.
- Create a daily quality report/query and alert path for failures.
- Add structured logs with run ID, entity ID, action, result, error code, and timestamp.
- Define two service-level objectives: e.g., 95% of valid leads routed within 10 minutes; <2% duplicate rate.

**Deliverable:** Quality-check module/report and observability documentation.

**Done when:** You can locate a failed record and identify why it failed in under five minutes.

### Day 21 — Week 3 release and portfolio review

**Objective:** Make an honest, compelling portfolio artifact.

**Tasks:**

- Write a short case study: problem, architecture, workflow, safety controls, metrics, failure modes, and demo results.
- Record a 3–5 minute walkthrough showing input, workflow execution, CRM result, database logs, and dashboard.
- Ask one technical person and one sales/RevOps-minded person to review it; record their feedback.
- Fix the three highest-value clarity issues.

**Deliverable:** Video/demo link in README, case study, and feedback log.

**Done when:** Someone unfamiliar with the project can describe its value and architecture back to you.

## Week 4 — Reliability, Polish, Job Readiness, and Proof

### Day 22 — Authentication, privacy, and compliance

**Objective:** Show you can build responsibly around customer data.

**Tasks:**

- Learn API-key hygiene, OAuth conceptually, least privilege, secret storage, PII, data retention, consent, unsubscribe handling, and audit trails.
- Audit both repositories for hardcoded secrets and sensitive sample data.
- Add security/privacy notes, retention assumptions, and access-control guidance to the README.
- Implement input redaction in logs for email/phone where appropriate.

**Deliverable:** Security/privacy checklist and sanitized repositories.

**Done when:** You can explain how credentials and personal data are protected in the demo system.

### Day 23 — Failure recovery and idempotency

**Objective:** Make retries safe.

**Tasks:**

- Simulate failures after each critical step: before CRM upsert, after CRM upsert, during database write, during notification, and during webhook retry.
- Add/run idempotency keys or processed-event tables, retry limits, and a manual replay procedure.
- Design a dead-letter/review queue for records that exhaust retries.
- Document exact recovery steps for each failure.

**Deliverable:** Failure-recovery runbook + tested replay mechanism.

**Done when:** You can rerun a failed job without creating duplicate CRM records or notifications.

### Day 24 — Improve architecture and code quality

**Objective:** Make the project readable and maintainable.

**Tasks:**

- Separate configuration, API adapters, domain logic, persistence, and workflow orchestration.
- Add type validation/schema validation for inputs where your language supports it.
- Add unit tests for dedupe, scoring, routing, event transitions, and error handling.
- Run lint/format/test commands and document them.

**Deliverable:** Refactored codebase with a quality checklist.

**Done when:** A new contributor can identify where to change scoring or routing in under two minutes.

### Day 25 — Build a lightweight operator console/report

**Objective:** Surface the information a GTM operator needs each day.

**Tasks:**

- Create a simple interface/report with: today’s runs, failure queue, A-tier leads, unassigned leads, stale enrichment, pipeline funnel, and recent events.
- Use a pragmatic method: SQL report, dashboard tool, spreadsheet, or minimal web page.
- Add a screenshot and explain every metric.

**Deliverable:** Operator console/report integrated into the project README.

**Done when:** An operator can decide what needs attention without reading raw logs.

### Day 26 — Simulated production run

**Objective:** Prove the full system under a realistic batch.

**Tasks:**

- Generate 100–200 synthetic leads with intentional duplicates, invalid inputs, missing fields, routing edge cases, and enrichment failures.
- Run the complete system in dry-run or test mode.
- Capture metrics: throughput, successful records, failures, retries, duplicate prevention, A/B/C tiers, routing distribution, and latency.
- Investigate and fix the top two defects.

**Deliverable:** Production-simulation report with before/after results.

**Done when:** You have measured evidence that the system behaves correctly at batch scale.

### Day 27 — Portfolio packaging

**Objective:** Package your work for a recruiter, founder, or hiring manager.

**Tasks:**

- Rewrite the main README in this order: one-line value proposition, demo, architecture, problem, workflow, setup, data model, safety/reliability, metrics, trade-offs, and next steps.
- Add one diagram and 3–6 purposeful screenshots.
- Create a `PORTFOLIO.md` with project summary, stack, your decisions, and an interview walkthrough.
- Make a 90-second verbal project pitch and record/practice it five times.

**Deliverable:** Recruiter-ready GitHub repository.

**Done when:** The README answers “what, why, how, proof, and trade-offs” without requiring a call.

### Day 28 — Job-market research and targeting

**Objective:** Align your portfolio with real GTM Engineering work.

**Tasks:**

- Collect 15 current job descriptions for GTM Engineer, RevOps Engineer, Growth Engineer, Sales Operations, and Solutions/Automation roles. Use authorized public listings.
- Create a matrix: common tools, responsibilities, required skills, preferred skills, and portfolio evidence you have.
- Identify your top five gaps and convert only the top two into small improvements for Days 29–30.
- Draft a targeted resume section describing your project with measurable, honest wording.

**Deliverable:** Job-requirements matrix and tailored project bullet points.

**Done when:** You can explain why this portfolio matches specific job requirements.

### Day 29 — Interview readiness and outreach assets

**Objective:** Become able to discuss the work credibly.

**Tasks:**

- Prepare answers for: architecture, API reliability, webhook idempotency, CRM data model, scoring logic, routing, data privacy, dashboard metrics, failure recovery, and trade-offs.
- Do a mock interview aloud; record it or have an LLM challenge your answers using the README.
- Create a concise LinkedIn headline/about section and one outreach message asking for feedback on the project—not a job demand.
- Fix one project gap found in Day 28 or your mock interview.

**Deliverable:** `docs/interview-qa.md`, resume bullets, and feedback-request template.

**Done when:** You can explain the entire project without opening code.

### Day 30 — Final demo, audit, and next 60 days

**Objective:** Finish with verifiable evidence and a continuation plan.

**Tasks:**

- Run the final end-to-end demo from clean sample data.
- Audit every repository: README, `.env.example`, setup, tests, links, screenshots, no secrets, no unlicensed/private data, and clean commits.
- Publish a final project post describing what you built, what failed, what you learned, and the demo/repo link.
- Write a 60-day plan: apply/network each week, ship one improvement per week, learn one job-market gap at a time, and collect feedback from practitioners.
- Score yourself against the success criteria below. Do not claim completion if evidence is missing.

**Deliverable:** Final tagged release, working demo, final post, and 60-day continuation plan.

**Done when:** A stranger can clone/run the project or inspect the demo and verify your claims.

---

## Weekly Reading Requirement

Each Sunday (Days 7, 14, 21, and 28), read one substantial public case study, engineering post, or official documentation set about a GTM/RevOps system. Avoid generic “top 10 tools” articles.

For each reading, write 200–300 words answering:

1. What business problem existed?
2. What data/system/process changed?
3. What metric improved or was monitored?
4. What could fail in that design?
5. What one idea will you apply to your own project?

Save entries in `docs/weekly-reading.md`.

## Final Success Criteria (Day 30)

You may say “I have completed a GTM Engineering foundation” only if all are true:

- Two public GitHub repositories exist with daily, meaningful commits across the month.
- The main repository contains a documented end-to-end system from approved lead input through validation, dedupe, enrichment, scoring, routing, CRM upsert/mock adapter, event logging, and funnel reporting.
- You can demonstrate a 100+ record synthetic run with failure handling and duplicate prevention.
- You can explain CRM objects, APIs, webhooks, n8n workflows, SQL funnel queries, data quality, scoring, routing, sequence stop conditions, and basic privacy/security choices.
- The project includes a readable README, architecture diagram, `.env.example`, test/sample data, workflow export, screenshots or demo, and a recovery runbook.
- You have written four weekly reflections/readings, one case study, a 90-second pitch, and interview answers.
- You have completed 15–20 focused LeetCode/SQL practice sessions without letting them displace project work.
- You have shared honest public progress at least twice and requested feedback from at least two people.

## If You Fall Behind

- Do **not** restart the calendar and do not skip deliverables.
- The next day begins by completing the missed deliverable, then start the current day only if time remains.
- Remove optional polish, never core reliability, documentation, or end-to-end functionality.
- If blocked for more than 45 minutes, record the exact error, attempted fixes, relevant code, and expected result; ask an LLM or person a narrow debugging question; then continue.
- If you miss three days, spend one recovery day on planning, cleanup, and the single highest-leverage unfinished deliverable—then resume.

## Definition of “Worked Today”

You worked today only if you can point to all four:

1. A concrete artifact produced or materially improved.
2. A Git commit pushed.
3. A test, screenshot, demo result, or written proof that it works.
4. A short log explaining what you did, what failed, and what happens tomorrow.

Anything else—videos watched, tabs opened, prompts written, plans rewritten—does not count as execution.
