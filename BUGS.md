# Bug Report

While writing tests on Day 1, I found **3 bugs**. All of them are in
`task-api/src/services/taskService.js`. Below is the full report.

The assignment asked to fix at least one bug. I fixed all three, because each
one was small and clearly wrong.

---

## Bug 1 — Completing a task changes its priority

- **Where:** `taskService.js` → `completeTask()`
- **What should happen:** When a task is completed, only the `status` should
  become `done` and `completedAt` should be set. The `priority` should not change.
- **What actually happens:** The priority is forced to `medium`. So a `high`
  task becomes `medium` after it is completed, and the real priority is lost.
- **How I found it:** My test made a `high` task, completed it, and checked the
  priority. It failed — `Expected: "high", Received: "medium"`.
- **Why it happens:** The code sets `priority: 'medium'` while making the new task object:
  ```js
  const updated = {
    ...task,
    priority: 'medium',   // <-- this line wrongly resets the priority
    status: 'done',
    completedAt: new Date().toISOString(),
  };
  ```
- **The fix:** Remove the `priority: 'medium'` line. Because of `...task`, the old
  priority is already copied, so it stays correct.

---

## Bug 2 — Pagination skips the first page

- **Where:** `taskService.js` → `getPaginated()`
- **What should happen:** Page 1 should return the first `limit` tasks.
  For example, with `page=1, limit=2`, it should return item 1 and item 2.
- **What actually happens:** Page 1 skips the first items. With 3 tasks and
  `page=1, limit=2`, it returns only the 3rd task instead of the first two.
- **How I found it:** My test made 3 tasks and called `getPaginated(1, 2)`.
  It expected 2 tasks (first, second) but got 1 task (third).
- **Why it happens:** The "how many to skip" value (offset) is wrong. Pages start
  from 1, so page 1 should skip 0 items. But the code does:
  ```js
  const offset = page * limit;   // page 1 -> skips 2 -> misses the first page
  ```
- **The fix:** Use a formula that starts from 1:
  ```js
  const offset = (page - 1) * limit;   // page 1 -> skips 0 (correct)
  ```

---

## Bug 3 — Status filter matches the wrong tasks

- **Where:** `taskService.js` → `getByStatus()`
- **What should happen:** Filtering by status should return only the tasks whose status is *exactly* the value asked for.
- **What actually happens:** It uses a partial (substring) match. A wrong value like `"o"` matches both `"todo"` and `"done"`, because both words contain "o". So the filter can return tasks that it should not.
- **How I found it:** My test made one `todo` task and one `done` task, then filtered by `"o"`. It expected 0 results but got 2.
- **Why it happens:** The code uses `String.includes()` (partial match) instead of an exact `===` check:
  ```js
  tasks.filter((t) => t.status.includes(status));   // partial match = bug
  ```
- **The fix:** Compare exactly:
  ```js
  tasks.filter((t) => t.status === status);
  ```

---

## Also noticed (not a code bug, but worth telling)

The README says the statuses are `pending / in-progress / completed`, but the real code (`validators.js`) only accepts `todo / in_progress / done`. So the docs and the code do not match. I followed the code, because that is what the API really accepts. This is something I would confirm with the team before going live.

---

## Summary

| Bug | File / function | Reason | Fixed? |
|-----|-----------------|--------|--------|
| 1. Priority changes on complete | `taskService.js` / `completeTask` | Hard-coded `priority: 'medium'` | Yes |
| 2. Pagination skips page 1 | `taskService.js` / `getPaginated` | Offset `page * limit` (wrong start) | Yes |
| 3. Status filter partial match | `taskService.js` / `getByStatus` | Used `includes()` instead of `===` | Yes |

After the fixes, all tests pass (53 passed) and coverage is about 96%.
