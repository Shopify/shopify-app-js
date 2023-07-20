import {HeadersArgs} from '@remix-run/server-runtime';

export type ErrorBoundary = (error: unknown) => string | never;
export type HeadersBoundary = (headers: HeadersArgs) => Headers;
