# Day 1 - Read & Test

The main goal of Day 1 is simple: **read the code, understand it, and write tests for it.**

---

## 1. What I did (step by step)

- I read all the code inside the `task-api/src/` folder to understand how the app works.
- I started the server with `npm start` and tested each API by hand in Thunder Client (create, list, filter, stats, update, complete, delete).
- I wrote automatic tests using **Jest** and **Supertest**, so the testing happens by code and not by hand.
- I ran the tests with `npm test` and checked the coverage with `npm run coverage`.

---

## 2. How the app works (what I understood)

The code has 3 main layers. One request moves like this:

1. **`app.js`** - starts the Express server and connects the routes.
2. **`routes/tasks.js`** - takes the request, checks the input, and calls the service.
3. **`services/taskService.js`** - the main logic and the data (kept in a simple array).
4. **`utils/validators.js`** - small functions that check if the input is correct.

One important point: **there is no database.** All tasks are kept in one array in memory. So the data is lost every time the server restarts.

---

## 3. What are Jest and Supertest?

- **Jest** - a tool that runs my tests and shows PASS or FAIL. It is like an exam checker.
- **Supertest** - a tool that sends fake requests to the API inside a test. It is like Thunder Client, but written in code.

Both are already added in `package.json`.

---

## 4. The test files I made

I made **3 test files** inside the `task-api/tests/` folder. I kept them separate so each file matches one part of the code.

| Test file | What it checks | Type of test |
|-----------|----------------|--------------|
| `validators.test.js` | Input rules (title, status, priority, date) | Unit test |
| `taskService.test.js` | The main logic and the data | Unit test |
| `tasks.test.js` | The full API (using Supertest) | Integration test |

- **Unit test** = test one small function directly. It is fast and shows the exact problem.
- **Integration test** = test the full API from outside, like a real user. It shows that all parts work together.

For each API, I wrote:
- One **happy path** test (normal input should work).
- At least **2 edge cases** (for example: missing title gives 400, wrong id gives 404).

---

## 5. How to run the tests

Open the terminal inside the `task-api` folder and run:

```bash
npm install       # only the first time
npm test          # run all the tests
npm run coverage  # run tests and show the coverage report
```

---

## 6. My result (Day 1)

- **Total tests:** 41
- **Passed:** 38
- **Failed:** 3
- **Coverage:** **95.52%** (the target was 80%, so this is good)

The 3 failed tests are **not mistakes**. They are the way my tests **found 3 real bugs** in the code. This is exactly the goal of Day 1 - find problems by testing, not by guessing.

---

## 7. Bugs I found by testing

My tests found 3 bugs. The full details and fixes are in `BUGS.md`, but in short:

- **Bug 1 - Complete task changes the priority.**
  When a task is completed, its priority is wrongly changed to `medium`. It should stay the same. *(in `taskService.js`, `completeTask`)*

- **Bug 2 - Pagination skips the first page.**
  Page 1 does not show the first items. The page maths is wrong (`page * limit` instead of `(page - 1) * limit`). *(in `taskService.js`, `getPaginated`)*

- **Bug 3 - Status filter matches wrong tasks.**
  The filter uses `includes()` (partial match) instead of an exact match. So a wrong value can still match real tasks. *(in `taskService.js`, `getByStatus`)*

---

## 8. One thing that surprised me

The README says the status values are `pending / in-progress / completed`, but the **real code** only accepts `todo / in_progress / done`. So the docs and the code do not match. I used the values from the code, because that is what the API really accepts.

---

## 9. Summary

On Day 1, I read and understood the code, tested the API by hand, and then wrote 41 automatic tests with 95.52% coverage. Through these tests I found 3 real bugs, which I report and fix on Day 2.
