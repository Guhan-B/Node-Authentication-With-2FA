import axios from "axios";

export interface ErrorType {
    field?: string;
    message: string;
    details?: string;
} 

export class ClientError extends Error {
    public readonly error?: ErrorType;
    public readonly errors?: ErrorType[];
    public readonly status: number;

    public constructor(status: number, e: ErrorType | ErrorType[]) {
        super();
        
        this.status = status;

        if (Array.isArray(e)) {
            this.errors = e;
        }
        else {
            this.error = e;
        }
    }
}

export async function useRequest<T, D>(method: string, endpoint: string, payload: T): Promise<D> {
    try {
        const response = await axios.request<D>({
            baseURL: "http://localhost:8080/",
            responseType: "json",
            url: endpoint,
            data: payload,
            method: method,
            withCredentials: true,
        });

        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error) && error.response) {           
            if (error.response.data.errors)
                throw new ClientError(error.response.status, error.response.data.errors);
            else if (error.response.data.error)
                throw new ClientError(error.response.status, error.response.data.error);
            else
                throw new ClientError(0, { message: "Oops! Something went wrong" });
        }
        else {
            throw new ClientError(0, { message: "Oops! Something went wrong" });
        }
    }
}