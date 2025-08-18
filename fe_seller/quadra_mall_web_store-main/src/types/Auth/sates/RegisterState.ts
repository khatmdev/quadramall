import { RegisterRequest } from "../base/Request/registerRequest";

export interface  RegisterState {
  registerStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  verifyStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  registerData: RegisterRequest | null;

}
