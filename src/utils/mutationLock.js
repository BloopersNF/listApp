const createMutationLock = () => {
    let locked = false;

    return {
        tryAcquire() {
            if (locked) {
                return false;
            }

            locked = true;
            return true;
        },
        release() {
            locked = false;
        },
        isLocked() {
            return locked;
        },
    };
};

module.exports = { createMutationLock };
