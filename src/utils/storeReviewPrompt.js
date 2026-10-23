const REVIEW_PROMPT_COOLDOWN_MS = 90 * 24 * 60 * 60 * 1000;
const MIN_COMPLETED_LISTS_FOR_PROMPT = 1;
const MAX_REMEMBERED_LIST_IDS = 50;

const getInitialState = () => ({
    completedListIds: [],
    completedListCount: 0,
    lastPromptAt: null,
    optedOut: false,
    reviewRequestedAt: null,
    reviewConfirmed: false,
});

const normalizeState = (value) => {
    const initialState = getInitialState();

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return initialState;
    }

    const completedListIds = Array.isArray(value.completedListIds)
        ? [...new Set(value.completedListIds.filter((id) => typeof id === 'string' && id.trim() !== ''))]
            .slice(-MAX_REMEMBERED_LIST_IDS)
        : [];

    return {
        ...initialState,
        completedListIds,
        completedListCount: Number.isInteger(value.completedListCount) && value.completedListCount >= 0
            ? value.completedListCount
            : completedListIds.length,
        lastPromptAt: Number.isFinite(value.lastPromptAt) ? value.lastPromptAt : null,
        optedOut: value.optedOut === true,
        reviewRequestedAt: Number.isFinite(value.reviewRequestedAt) ? value.reviewRequestedAt : null,
        reviewConfirmed: value.reviewConfirmed === true,
    };
};

const recordCompletedList = (storedState, listId, now = Date.now()) => {
    const state = normalizeState(storedState);

    if (typeof listId !== 'string' || listId.trim() === '' || state.completedListIds.includes(listId)) {
        return { state, shouldPrompt: false };
    }

    const nextState = {
        ...state,
        completedListIds: [...state.completedListIds, listId].slice(-MAX_REMEMBERED_LIST_IDS),
        completedListCount: state.completedListCount + 1,
    };
    const cooldownElapsed = !nextState.lastPromptAt || now - nextState.lastPromptAt >= REVIEW_PROMPT_COOLDOWN_MS;
    const shouldPrompt = !nextState.optedOut &&
        !nextState.reviewConfirmed &&
        nextState.completedListCount >= MIN_COMPLETED_LISTS_FOR_PROMPT &&
        cooldownElapsed;

    return {
        state: shouldPrompt ? { ...nextState, lastPromptAt: now } : nextState,
        shouldPrompt,
    };
};

const optOutOfReviewPrompts = (storedState) => ({
    ...normalizeState(storedState),
    optedOut: true,
});

const markReviewRequested = (storedState, now = Date.now()) => ({
    ...normalizeState(storedState),
    reviewRequestedAt: now,
    lastPromptAt: now,
});

const shouldRemindOnLaunch = (storedState) => {
    const state = normalizeState(storedState);
    return state.completedListCount > 0 && !state.optedOut && !state.reviewConfirmed;
};

const confirmReview = (storedState) => ({
    ...normalizeState(storedState),
    reviewConfirmed: true,
});

const requestStoreReviewIfAvailable = async ({ hasAction, requestReview }) => {
    if (typeof hasAction !== 'function' || typeof requestReview !== 'function') {
        return false;
    }

    if (!await hasAction()) {
        return false;
    }

    await requestReview();
    return true;
};

module.exports = {
    MIN_COMPLETED_LISTS_FOR_PROMPT,
    REVIEW_PROMPT_COOLDOWN_MS,
    normalizeState,
    recordCompletedList,
    optOutOfReviewPrompts,
    markReviewRequested,
    shouldRemindOnLaunch,
    confirmReview,
    requestStoreReviewIfAvailable,
};
