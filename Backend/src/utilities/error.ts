import * as uuid from "uuid";

export type E = {
    cause: string;
    message: string;
};

export class ServerError extends Error {
    public readonly _id: string;
    public readonly code: string;
    public readonly status: number;
    public readonly errors: Array<E>;

    constructor(code: string, status: number, errors: Array<E>) {
        super();

        this._id = uuid.v4();
        this.code = code;
        this.status = status;
        this.errors = errors;
    }
}

export const Errors = {
    INTERNAL_SERVER_ERROR: (errors: Array<E>) => new ServerError("INTERNAL_SERVER_ERROR", 500, errors),
    ACCESS_FORBIDDEN_ERROR: (errors: Array<E>) => new ServerError("ACCESS_FORBIDDEN_ERROR", 403, errors),
    AUTHETICATION_ERROR: (errors: Array<E>) => new ServerError("AUTHETICATION_ERROR", 401, errors),
    VALIDATION_ERROR: (errors: Array<E>) => new ServerError("VALIDATION_ERROR", 400, errors),
};

// 500 - Internal Server Error
// 403 - Forbidden
// 401 - Unauthorized
// 400 - Bad Request
