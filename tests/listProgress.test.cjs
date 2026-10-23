const test = require('node:test');
const assert = require('node:assert/strict');
const { getListProgress } = require('../src/utils/listProgress');

test('reports empty lists without progress', () => {
    assert.deepEqual(getListProgress([]), {
        completed: 0,
        total: 0,
        ratio: 0,
        status: 'empty',
    });
    assert.deepEqual(getListProgress(null), getListProgress([]));
});

test('derives partial progress and treats missing checked as pending', () => {
    assert.deepEqual(
        getListProgress([{ checked: true }, { checked: false }, {}]),
        {
            completed: 1,
            total: 3,
            ratio: 1 / 3,
            status: 'inProgress',
        }
    );
});

test('reports a completed non-empty list', () => {
    assert.deepEqual(getListProgress([{ checked: true }, { checked: true }]), {
        completed: 2,
        total: 2,
        ratio: 1,
        status: 'completed',
    });
});
