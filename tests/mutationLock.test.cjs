const test = require('node:test');
const assert = require('node:assert/strict');
const { createMutationLock } = require('../src/utils/mutationLock');

test('acquires synchronously and rejects overlapping mutations', () => {
    const lock = createMutationLock();

    assert.equal(lock.tryAcquire(), true);
    assert.equal(lock.isLocked(), true);
    assert.equal(lock.tryAcquire(), false);
});

test('can be acquired again after success or failure cleanup', () => {
    const lock = createMutationLock();

    assert.equal(lock.tryAcquire(), true);
    lock.release();
    assert.equal(lock.isLocked(), false);
    assert.equal(lock.tryAcquire(), true);
});

test('stays locked while an async mutation is pending and recovers after rejection', async () => {
    const lock = createMutationLock();
    let rejectMutation;
    const pendingMutation = new Promise((resolve, reject) => {
        rejectMutation = reject;
    });

    const runMutation = async () => {
        if (!lock.tryAcquire()) {
            return 'blocked';
        }

        try {
            await pendingMutation;
            return 'completed';
        } finally {
            lock.release();
        }
    };

    const firstMutation = runMutation();
    assert.equal(await runMutation(), 'blocked');

    rejectMutation(new Error('storage failed'));
    await assert.rejects(firstMutation, /storage failed/);
    assert.equal(lock.tryAcquire(), true);
});
