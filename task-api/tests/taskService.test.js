// Tests for taskService.js. We call the functions directly (no HTTP), so it is fast.

const taskService = require('../src/services/taskService');

// The tasks are kept in one shared array. Clear it before every test so tests do not affect each other.
beforeEach(() => {
  taskService._reset();
});

describe('create()', () => {
  test('creates a task with default values', () => {
    const task = taskService.create({ title: 'My task' });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('My task');
    expect(task.description).toBe('');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.dueDate).toBeNull();
    expect(task.completedAt).toBeNull();
    expect(task.createdAt).toBeDefined();
  });

  test('keeps the values I give', () => {
    const task = taskService.create({
      title: 'Custom',
      description: 'desc',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-01-01T00:00:00.000Z',
    });

    expect(task.status).toBe('in_progress');
    expect(task.priority).toBe('high');
  });
});

describe('getAll()', () => {
  test('returns all tasks', () => {
    taskService.create({ title: 'a' });
    taskService.create({ title: 'b' });
    expect(taskService.getAll()).toHaveLength(2);
  });

  test('returns a copy, so changing the result does not change the store', () => {
    const list = taskService.getAll();
    list.push({ title: 'sneaky' });
    expect(taskService.getAll()).toHaveLength(0);
  });
});

describe('findById()', () => {
  test('finds a task that exists', () => {
    const created = taskService.create({ title: 'find me' });
    expect(taskService.findById(created.id)).toEqual(created);
  });

  test('returns undefined for an unknown id', () => {
    expect(taskService.findById('does-not-exist')).toBeUndefined();
  });
});

describe('update()', () => {
  test('updates a task that exists', () => {
    const created = taskService.create({ title: 'old' });
    const updated = taskService.update(created.id, { title: 'new' });
    expect(updated.title).toBe('new');
  });

  test('returns null for an unknown id', () => {
    expect(taskService.update('nope', { title: 'x' })).toBeNull();
  });
});

describe('remove()', () => {
  test('removes a task and returns true', () => {
    const created = taskService.create({ title: 'delete me' });
    expect(taskService.remove(created.id)).toBe(true);
    expect(taskService.getAll()).toHaveLength(0);
  });

  test('returns false for an unknown id', () => {
    expect(taskService.remove('nope')).toBe(false);
  });
});

describe('completeTask()', () => {
  test('sets status to done and fills completedAt', () => {
    const created = taskService.create({ title: 'finish me' });
    const done = taskService.completeTask(created.id);

    expect(done.status).toBe('done');
    expect(done.completedAt).not.toBeNull();
  });

  test('returns null for an unknown id', () => {
    expect(taskService.completeTask('nope')).toBeNull();
  });

  // BUG #1 (now fixed): completing a task must not change its priority.
  test('keeps the same priority when completing', () => {
    const created = taskService.create({ title: 'urgent', priority: 'high' });
    const done = taskService.completeTask(created.id);
    expect(done.priority).toBe('high');
  });
});

describe('getPaginated()', () => {
  // BUG #2 (now fixed): page 1 must return the first items, not skip them.
  test('page 1 returns the first items', () => {
    taskService.create({ title: 'first' });
    taskService.create({ title: 'second' });
    taskService.create({ title: 'third' });

    const pageOne = taskService.getPaginated(1, 2);
    expect(pageOne).toHaveLength(2);
    expect(pageOne[0].title).toBe('first');
  });

  test('page 2 returns the next items', () => {
    taskService.create({ title: 'first' });
    taskService.create({ title: 'second' });
    taskService.create({ title: 'third' });

    const pageTwo = taskService.getPaginated(2, 2);
    expect(pageTwo).toHaveLength(1);
    expect(pageTwo[0].title).toBe('third');
  });
});

describe('getByStatus()', () => {
  test('returns only tasks with the exact status', () => {
    taskService.create({ title: 'a', status: 'todo' });
    taskService.create({ title: 'b', status: 'done' });
    expect(taskService.getByStatus('done')).toHaveLength(1);
  });

  // BUG #3 (now fixed): a partial word like 'o' must not match real statuses.
  test('a partial word does not match real statuses', () => {
    taskService.create({ title: 'a', status: 'todo' });
    taskService.create({ title: 'b', status: 'done' });
    expect(taskService.getByStatus('o')).toHaveLength(0);
  });
});

describe('assignTask() (new feature)', () => {
  test('saves the name on the task', () => {
    const created = taskService.create({ title: 'do this' });
    const updated = taskService.assignTask(created.id, 'Amit');
    expect(updated.assignee).toBe('Amit');
  });

  test('returns null for an unknown id', () => {
    expect(taskService.assignTask('nope', 'Amit')).toBeNull();
  });
});

describe('getStats()', () => {
  test('counts tasks by status', () => {
    taskService.create({ title: 'a', status: 'todo' });
    taskService.create({ title: 'b', status: 'todo' });
    taskService.create({ title: 'c', status: 'in_progress' });

    const stats = taskService.getStats();
    expect(stats.todo).toBe(2);
    expect(stats.in_progress).toBe(1);
    expect(stats.done).toBe(0);
  });

  test('counts an overdue task (past date and not done)', () => {
    taskService.create({
      title: 'late',
      status: 'todo',
      dueDate: '2000-01-01T00:00:00.000Z',
    });
    expect(taskService.getStats().overdue).toBe(1);
  });
});
