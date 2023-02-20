export interface StripeSetupData {
  successURL: string;
  amount: number;
  email: string;
  phone: string;
  name: string;
  wantsBrick: boolean;
  anonymous: boolean;
  giftAid: boolean;
  startDate: number;
  iterations: number;
}

export interface StripeSetupRes {
  sessionURL: string;
}

export interface StripeSubData {
  sessionID: string;
  docID: string;
}
