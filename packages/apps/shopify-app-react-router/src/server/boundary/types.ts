import {HeadersArgs} from 'react-router';

export type ErrorBoundary = (error: unknown) => string | never;
export type HeadersBoundary = (headers: HeadersArgs) => Headers;
