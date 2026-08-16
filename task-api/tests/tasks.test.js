// Tests for the /tasks API. Supertest sends fake HTTP requests to the app, like Thunder Client but in code.

const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

// Start every test with an empty store.
beforeEach(() => {
  taskService._reset();
});

// Small helper: create a task through the API and return its body.
async function createTask(overrides = {}) {
  const res = await request(app)
    .post('/tasks')
    .send({ title: 'Sample task', ...overrides });
  return res.body;
}

describe('POST /tasks', () => {
  test('creates a task -> 201', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Write tests', priority: 'high' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Write tests');
    expect(res.body.priority).toBe('high');
  });

  test('missing title -> 400', async () => {
    const res = await request(app).post('/tasks').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('wrong status -> 400', async () => {
    const res = await request(app).post('/tasks').send({ title: 'x', status: 'urgent' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks', () => {
  test('lists all tasks -> 200', async () => {
    await createTask({ title: 'one' });
    await createTask({ title: 'two' });

    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('filters by status', async () => {
    await createTask({ title: 'a', status: 'todo' });
    await createTask({ title: 'b', status: 'done' });

    const res = await request(app).get('/tasks?status=done');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].status).toBe('done');
  });

  test('accepts page and limit -> 200', async () => {
    await createTask({ title: 'a' });
    const res = await request(app).get('/tasks?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /tasks/stats', () => {
  test('returns counts and overdue -> 200', async () => {
    await createTask({ title: 'a', status: 'todo' });
    await createTask({ title: 'b', status: 'in_progress' });

    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body.todo).toBe(1);
    expect(res.body.in_progress).toBe(1);
    expect(res.body).toHaveProperty('overdue');
  });
});

describe('PUT /tasks/:id', () => {
  test('updates a task -> 200', async () => {
    const task = await createTask({ title: 'old' });

    const res = await request(app).put(`/tasks/${task.id}`).send({ title: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('new');
  });

  test('unknown task -> 404', async () => {
    const res = await request(app).put('/tasks/does-not-exist').send({ title: 'x' });
    expect(res.status).toBe(404);
  });

  test('wrong data -> 400', async () => {
    const task = await createTask();
    const res = await request(app).put(`/tasks/${task.id}`).send({ title: '' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /tasks/:id/complete', () => {
  test('marks a task complete -> 200', async () => {
    const task = await createTask();

    const res = await request(app).patch(`/tasks/${task.id}/complete`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.completedAt).not.toBeNull();
  });

  test('unknown task -> 404', async () => {
    const res = await request(app).patch('/tasks/nope/complete');
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  test('deletes a task -> 204', async () => {
    const task = await createTask();

    const res = await request(app).delete(`/tasks/${task.id}`);
    expect(res.status).toBe(204);
  });

  test('unknown task -> 404', async () => {
    const res = await request(app).delete('/tasks/nope');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /tasks/:id/assign (new feature)', () => {
  test('assigns a task to a person -> 200', async () => {
    const task = await createTask();

    const res = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Amit' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Amit');
  });

  test('removes extra spaces from the name', async () => {
    const task = await createTask();

    const res = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '  Priya  ' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Priya');
  });

  test('unknown task -> 404', async () => {
    const res = await request(app)
      .patch('/tasks/does-not-exist/assign')
      .send({ assignee: 'Amit' });

    expect(res.status).toBe(404);
  });

  test('empty name -> 400', async () => {
    const task = await createTask();

    const res = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '' });

    expect(res.status).toBe(400);
  });

  test('missing name -> 400', async () => {
    const task = await createTask();

    const res = await request(app).patch(`/tasks/${task.id}/assign`).send({});

    expect(res.status).toBe(400);
  });

  test('can reassign to a different person -> 200', async () => {
    const task = await createTask();
    await request(app).patch(`/tasks/${task.id}/assign`).send({ assignee: 'Amit' });

    const res = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Priya' });

    expect(res.status).toBe(200);
    expect(res.body.assignee).toBe('Priya');
  });
});
