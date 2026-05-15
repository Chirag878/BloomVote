class ApiResponse {
    static send(res, statusCode, message, data = null, meta = undefined) {
        const payload = {
            success: true,
            message,
            data,
        };

        if (meta) payload.meta = meta;
        return res.status(statusCode).json(payload);
    }

    static ok(res, message, data = null, meta = undefined) {
        return ApiResponse.send(res, 200, message, data, meta);
    }

    static created(res, message, data = null) {
        return ApiResponse.send(res, 201, message, data);
    }

    static paginated(res, message, data, meta) {
        return ApiResponse.ok(res, message, data, meta);
    }

    static noContent(res) {
        return res.status(204).send();
    }
}

export default ApiResponse;
