const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
    REVIEW_PROMPT_COOLDOWN_MS,
    markReviewRequested,
    optOutOfReviewPrompts,
    recordCompletedList,
    requestStoreReviewIfAvailable,
} = require('../src/utils/storeReviewPrompt');

test('asks after the first completed list', () => {
    const first = recordCompletedList(null, 'weekly', 1_000);

    assert.equal(first.shouldPrompt, true);
});

test('does not ask again for the same completed list or during the cooldown', () => {
    const prompt = recordCompletedList(null, 'weekly', 1_000);
    const duplicate = recordCompletedList(prompt.state, 'weekly', 2_000);
    const cooldown = recordCompletedList(prompt.state, 'pharmacy', 1_000 + REVIEW_PROMPT_COOLDOWN_MS - 1);

    assert.equal(duplicate.shouldPrompt, false);
    assert.equal(cooldown.shouldPrompt, false);
});

test('honors never ask again and a completed review request', () => {
    const optedOut = optOutOfReviewPrompts();
    const afterOptOut = recordCompletedList(optedOut, 'weekly', 1_000);
    const reviewed = markReviewRequested(null, 500);
    const afterReview = recordCompletedList(reviewed, 'weekly', 1_000);

    assert.equal(afterOptOut.shouldPrompt, false);
    assert.equal(afterReview.shouldPrompt, false);
});

test('uses the native review flow only when the platform can present it', async () => {
    let requestCount = 0;
    const requested = await requestStoreReviewIfAvailable({
        hasAction: async () => true,
        requestReview: async () => {
            requestCount += 1;
        },
    });

    assert.equal(requested, true);
    assert.equal(requestCount, 1);
});

test('does not request a review when no native review action is available', async () => {
    let requestCount = 0;
    const requested = await requestStoreReviewIfAvailable({
        hasAction: async () => false,
        requestReview: async () => {
            requestCount += 1;
        },
    });

    assert.equal(requested, false);
    assert.equal(requestCount, 0);
});

test('list completion uses the native review request without a custom rating pre-prompt', () => {
    const listScreenSource = fs.readFileSync(
        path.resolve(__dirname, '../src/screens/listScreen.js'),
        'utf8'
    );

    assert.match(listScreenSource, /requestStoreReviewIfAvailable/);
    assert.doesNotMatch(listScreenSource, /feedbackPromptVisible|store-review-rate/);
});
