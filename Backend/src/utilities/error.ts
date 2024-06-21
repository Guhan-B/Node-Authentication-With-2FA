import { nanoid } from "nanoid";

export class ServerError extends Error {
    public readonly id: string;
    public readonly code: string;
    public readonly status: number;
    public readonly errors: Array<{ cause: string; message: string }>;

    private constructor(code: string, status: number, errors: Array<{ cause: string; message: string }>) {
        super();
        this.id = nanoid();
        this.code = code;
        this.status = status;
        this.errors = errors;
    }

    // 500 - Internal Server Error
    public static InternalServerError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("INTERNAL_SERVER_ERROR", 500, errors);
    }

    // 403 - Forbidden
    public static AccessForbiddenError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("ACCESS_FORBIDDEN_ERROR", 403, errors);
    }

    // 401 - Unauthorized
    public static AuthenticationError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("AUTHETICATION_ERROR", 401, errors);
    }

    // 400 - Bad Request
    public static ValidationError(errors: Array<{ cause: string; message: string }>): ServerError {
        return new ServerError("VALODATION_ERROR", 400, errors);
    }
}
