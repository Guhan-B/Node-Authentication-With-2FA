export interface ErrorType {
    field?: string;
    message: string;
    details?: string;
} 

export class ServerError extends Error {
    public readonly error?: ErrorType;
    public readonly errors?: ErrorType[];
    public readonly status: number;

    private constructor(status: number, e: ErrorType | ErrorType[]) {
        super();
        
        this.status = status;

        if (Array.isArray(e)) {
            this.errors = e;
        }
        else {
            this.error = e;
        }
    }

    // 500 - Internal Server Error
    public static InternalServerError(e: ErrorType | ErrorType[]): ServerError {
        return new ServerError(500, e);
    }

    // 403 - Forbidden
    public static AccessForbiddenError(e: ErrorType | ErrorType[]): ServerError {
        return new ServerError(403, e);
    }

    // 401 - Unauthorized
    public static AuthenticationError(e: ErrorType | ErrorType[]): ServerError {
        return new ServerError(401, e);
    }

    // 400 - Bad Request
    public static ValidationError(e: ErrorType | ErrorType[]): ServerError {
        return new ServerError(400, e);
    }
}
