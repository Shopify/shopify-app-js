export interface CookiesType {
  [key: string]: string;
}

export interface CallbackInfo {
  params: URLSearchParams;
  cookies: string[];
}
