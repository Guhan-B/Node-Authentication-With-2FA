import * as uuid from "uuid";

export type E = {
    cause: string;
    message: string;
};

export type ErrorCode = "INTERNAL_SERVER_ERROR" | "ACCESS_FORBIDDEN_ERROR" | "AUTHETICATION_ERROR" | "VALIDATION_ERROR";

const errorCodetoStatus: Map<ErrorCode, number> = new Map<ErrorCode, number>();

errorCodetoStatus.set("INTERNAL_SERVER_ERROR", 500);
errorCodetoStatus.set("ACCESS_FORBIDDEN_ERROR", 403);
errorCodetoStatus.set("AUTHETICATION_ERROR", 401);
errorCodetoStatus.set("VALIDATION_ERROR", 400);
export class ServerError extends Error {
    public readonly _id: string;
    public readonly code: ErrorCode;
    public readonly status: number;
    public readonly errors: Array<E>;

    constructor(code: ErrorCode, errors: Array<E>) {
        super();
        this._id = uuid.v4();
        this.code = code;
        this.status = errorCodetoStatus.get(this.code) || 500;
        this.errors = errors;
    }
}

// 500 - Internal Server Error
// 403 - Forbidden
// 401 - Unauthorized
// 400 - Bad Request
