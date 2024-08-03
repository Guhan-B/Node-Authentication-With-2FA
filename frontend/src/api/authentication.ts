import { useRequest } from ".";


type RegisterRequestType = { name: string; email: string; password: string; }
type RegisterResponseType = { }

export const registerRequest = async (data: RegisterRequestType): Promise<RegisterResponseType> => {
    return useRequest<RegisterRequestType, RegisterResponseType>("POST", "/authentication/register", data);
}

type LoginGenerateCodeRequestType = { email: string; password: string; }
type LoginGenerateCodeResponseType = { }
 
export const loginGenerateCodeRequest = (data: LoginGenerateCodeRequestType): Promise<LoginGenerateCodeResponseType> => {
    return useRequest<LoginGenerateCodeRequestType, LoginGenerateCodeResponseType>("POST", "/authentication/login", data);
}


type LoginVerifyCodeRequestType = { code: number }
type LoginVerifyCodeResponseType = { }

export const loginVerifyCodeRequest = (data: LoginVerifyCodeRequestType) => { 
    return useRequest<LoginVerifyCodeRequestType, LoginVerifyCodeResponseType>("POST", "/authentication/login/verify", data);
}


type ChangePasswordGenerateCodeRequestType = { }
type ChangePasswordGenerateCodeResponseType = { }

export const changePasswordGenerateCodeRequest = (data: ChangePasswordGenerateCodeRequestType) => { }


type ChangePasswordVerifyCodeRequestType = { }
type ChangePasswordVerifyCodeResponseType = { }

export const changePasswordVerifyCodeRequest = (data: ChangePasswordVerifyCodeRequestType) => {
    
}

type LogoutRequestType = { }
type LogoutResponseType = { }

export const logoutRequest = (data: LogoutRequestType) => {

}