# Day 2 - Find & Build

Day 2 has three parts:
- **Part A** - Find the bugs and write a bug report.
- **Part B** - Fix a bug.
- **Part C** - Build a new feature (the assign API).

---

## Part A - Bug Report (Find)

On Day 1, some of my tests failed on purpose. Those fails were the bugs.
I wrote the full bug report in a separate file: **`BUGS.md`**.

In short, I found **3 bugs**, all in `task-api/src/services/taskService.js`:

1. **Complete task changes the priority.**
   When a task is completed, its priority is wrongly set to `medium`. It should stay the same. *(function: `completeTask`)*

2. **Pagination skips the first page.**
   Page 1 does not show the first items, because the page maths is wrong (`page * limit` instead of `(page - 1) * limit`). *(function: `getPaginated`)*

3. **Status filter matches wrong tasks.**
   It uses `includes()` (partial match) instead of an exact match, so a wrong value can still match real tasks. *(function: `getByStatus`)*

For each bug, `BUGS.md` explains: what should happen, what actually happens, where in the code it is, why it happens, and the fix.

---

## Part B - Fix the bugs (Build)

The assignment asked to fix **at least one** bug. I fixed **all three**, because each one was small and clearly wrong, so it was better to make the code correct.

Here is what I changed (all in `taskService.js`):

| Bug | Before (wrong) | After (fixed) |
|-----|----------------|---------------|
| 1 | `priority: 'medium'` was forced when completing | Removed that line, so priority stays the same |
| 2 | `const offset = page * limit;` | `const offset = (page - 1) * limit;` |
| 3 | `t.status.includes(status)` | `t.status === status` |

**How I checked the fix worked:** the same tests that failed on Day 1 now pass. I did not change the tests - they were already checking the *correct* behaviour. Fixing the code made them pass.

---

## Part C - New Feature: Assign a task (Build)

I added a new API to assign a task to a person.

```
PATCH /tasks/:id/assign
Body: { "assignee": "Amit" }
```

**What it does:**
- Takes a name and saves it on the task as `assignee`.
- Returns the updated task.
- Returns **404** if the task does not exist.
- Returns **400** if the name is empty or missing.

**Files I changed for this feature:**
- `src/utils/validators.js` - added `validateAssign` to check the input.
- `src/services/taskService.js` - added `assignTask` to save the name.
- `src/routes/tasks.js` - added the new `PATCH /:id/assign` route.

### My design decisions (and why)

- **The name must be a non-empty string.**
  An empty name, or only spaces, gives a `400` error. Assigning a task to "nobody" makes no sense, so I block it.

- **I remove extra spaces.**
  If the name is `"  Amit  "`, I save it as `"Amit"`, so the data stays clean.

- **Re-assigning is allowed.**
  If a task already has a name, sending a new name just changes it. In a real task manager, changing the owner is a normal thing, so I allow it.

- **I check the input first, then the task.**
  First I check the body (400 if bad). Then I look for the task (404 if not found). This gives clear and correct error messages.

### Tests for the feature

I wrote tests for the new API (in `tests/tasks.test.js` and `tests/taskService.test.js`), covering:
- Assign a task works (200).
- Extra spaces in the name are removed.
- Task not found (404).
- Empty name (400).
- Missing name (400).
- Re-assign to a different person (200).

---

## How to run everything

Open the terminal inside the `task-api` folder:

```bash
npm install       # only the first time
npm start         # start the server on http://localhost:3000
npm test          # run all tests
npm run coverage  # run tests with the coverage report
```

**Try the new API** (after `npm start`), for example in Thunder Client:

```
PATCH http://localhost:3000/tasks/<task-id>/assign
Body (JSON): { "assignee": "Amit" }
```

---

## Final result

- **All tests pass:** 53 passed.
- **Coverage:** about **96%**.
- **Bugs:** 3 found, 3 fixed (full report in `BUGS.md`).
- **New feature:** `PATCH /tasks/:id/assign` added, with input checks and tests.

---