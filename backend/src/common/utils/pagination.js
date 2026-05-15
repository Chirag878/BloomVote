const getPagination = ({ page = 1, limit = 10 } = {}) => {
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (safePage - 1) * safeLimit;

    return {
        page: safePage,
        limit: safeLimit,
        skip,
    };
};

const buildMeta = ({ total, page, limit }) => ({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
});

export { getPagination, buildMeta };
