import * as uuid from "uuid";

export class ServerError extends Error {
    public readonly id: string;
    public readonly code: string;
    public readonly status: number;
    public readonly errors: Array<{ cause: string; message: string }>;

    private constructor(code: string, status: number, errors: Array<{ cause: string; message: string }>) {
        super();
        this.id = uuid.v4();
        this.code = code;
        this.status = status;
        this.errors = errors;
    }

    // 500 - Internal Server Error
    static InternalServerError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("INTERNAL_SERVER_ERROR", 500, errors);
    }

    // 403 - Forbidden
    static AccessForbiddenError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("ACCESS_FORBIDDEN_ERROR", 403, errors);
    }

    // 401 - Unauthorized
    static AuthenticationError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("AUTHETICATION_ERROR", 401, errors);
    }

    // 400 - Bad Request
    static ValidationError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("VALODATION_ERROR", 400, errors);
    }
}
