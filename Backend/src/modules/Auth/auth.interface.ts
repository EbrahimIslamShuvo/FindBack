export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  institutionId: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IVerifyOtpPayload {
  email: string;
  otp: string;
}

export interface IResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}