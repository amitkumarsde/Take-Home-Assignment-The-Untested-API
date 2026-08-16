# Submission Notes

The assignment asked me to write a short note answering three questions.

---

## 1. What I would test next if I had more time

- **Pagination edge cases** - test `page=0`, a very big page number, and a negative page, to see how the API behaves with strange input.
- **`GET /tasks` with page and limit together with a status filter** - right now the status filter and pagination are handled separately, so I would test them together.
- **`PUT /tasks/:id` extra fields** - test what happens if the body has fields that should not be changed (like `id` or `createdAt`).
- **Bad JSON body** - send a broken request body and check the app gives a clean error and does not crash.
- **The overdue count in `stats`** - test more date cases (task due today, task already done but past due) to be fully sure the count is correct.

---

## 2. What surprised me in the codebase

- **The docs and the code do not match.** The README says statuses are `pending / in-progress / completed`, but the code only accepts `todo / in_progress / done`. This can easily confuse a new developer.
- **A hidden side effect in `completeTask`.** Completing a task also changed the priority to `medium`. I did not expect "complete" to touch the priority. This was Bug 1.
- **A small maths mistake caused a real bug.** In pagination, using `page * limit` instead of `(page - 1) * limit` made page 1 skip the first items. A tiny mistake, but a big effect for the user.
- **There were no tests at all.** So these bugs were sitting quietly in the code. This shows why tests are important.

---

## 3. Questions I would ask before shipping to production

- **Should the data be saved in a database?** Right now everything is in memory, so all tasks are lost when the server restarts. Is that okay for production?
- **Which status values are correct?** The README and the code do not agree. I need the final list before going live.
- **Do we need login / authentication?** Right now anyone can create, change, or delete any task. Should the API be protected?
- **When a task is already assigned, should re-assigning be allowed?** I allowed it, but I would confirm this with the team.
- **What are the limits?** For example, should there be a maximum title length, or a maximum number of tasks? This helps to keep the app safe and stable.
- **How should errors be logged and monitored?** So the team can find and fix problems quickly after the app is live.
