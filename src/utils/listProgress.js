const getListProgress = (items) => {
    const normalizedItems = Array.isArray(items) ? items : [];
    const total = normalizedItems.length;
    const completed = normalizedItems.reduce(
        (count, item) => count + (item?.checked === true ? 1 : 0),
        0
    );

    if (total === 0) {
        return { completed: 0, total: 0, ratio: 0, status: 'empty' };
    }

    if (completed === total) {
        return { completed, total, ratio: 1, status: 'completed' };
    }

    return {
        completed,
        total,
        ratio: completed / total,
        status: 'inProgress',
    };
};

module.exports = { getListProgress };
