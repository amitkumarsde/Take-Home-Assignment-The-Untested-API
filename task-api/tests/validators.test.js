// Tests for the validator functions. They return null if input is OK, or an error text if not.

const { validateCreateTask, validateUpdateTask, validateAssign } = require('../src/utils/validators');

describe('validateCreateTask', () => {
  test('a valid task returns null (no error)', () => {
    expect(validateCreateTask({ title: 'Valid task' })).toBeNull();
  });

  test('a missing title gives an error', () => {
    expect(validateCreateTask({})).toMatch(/title is required/);
  });

  test('a title with only spaces gives an error', () => {
    expect(validateCreateTask({ title: '   ' })).toMatch(/title is required/);
  });

  test('a wrong status gives an error', () => {
    expect(validateCreateTask({ title: 'x', status: 'urgent' })).toMatch(/status must be/);
  });

  test('a wrong priority gives an error', () => {
    expect(validateCreateTask({ title: 'x', priority: 'huge' })).toMatch(/priority must be/);
  });

  test('a wrong date gives an error', () => {
    expect(validateCreateTask({ title: 'x', dueDate: 'not-a-date' })).toMatch(/dueDate must be/);
  });
});

describe('validateUpdateTask', () => {
  test('an empty body returns null (all fields are optional on update)', () => {
    expect(validateUpdateTask({})).toBeNull();
  });

  test('a title that is present but empty gives an error', () => {
    expect(validateUpdateTask({ title: '' })).toMatch(/title must be/);
  });

  test('a wrong status gives an error', () => {
    expect(validateUpdateTask({ status: 'nope' })).toMatch(/status must be/);
  });
});

describe('validateAssign (new feature)', () => {
  test('a valid name returns null (no error)', () => {
    expect(validateAssign({ assignee: 'Amit' })).toBeNull();
  });

  test('a missing name gives an error', () => {
    expect(validateAssign({})).toMatch(/assignee is required/);
  });

  test('a name with only spaces gives an error', () => {
    expect(validateAssign({ assignee: '   ' })).toMatch(/assignee is required/);
  });
});
