import type {Headers} from './types';

/**
 * Canonicalizes a header name by capitalizing each segment and ensuring consistent hyphenation.
 *
 * @param hdr - The header name to canonicalize.
 * @returns The canonicalized header name.
 */
export function canonicalizeHeaderName(hdr: string): string {
  return hdr
    .split('-')
    .map(
      (segment) =>
        segment.slice(0, 1).toLocaleUpperCase() +
        segment.slice(1).toLocaleLowerCase(),
    )
    .join('-');
}

/**
 * Retrieves all values associated with a canonicalized header name from the headers object.
 *
 * @param headers - The headers object or undefined.
 * @param needle_ - The header name to search for.
 * @returns An array of header values associated with the canonicalized header name.
 */
export function getHeaders(
  headers: Headers | Record<string, string | string[]> | undefined,
  needle_: string,
): string[] {
  if (!headers) return [];

  const needle = canonicalizeHeaderName(needle_);
  const result: string[] = [];

  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      if (canonicalizeHeaderName(key) === needle) {
        const values = headers[key];
        if (Array.isArray(values)) {
          result.push(...values);
        } else if (typeof values === 'string') {
          result.push(values);
        }
      }
    }
  }

  return result;
}

/**
 * Retrieves the first value associated with a canonicalized header name from the headers object.
 *
 * @param headers - The headers object or undefined.
 * @param needle - The header name to search for.
 * @returns The first value associated with the canonicalized header name, or undefined if not found.
 */
export function getHeader(
  headers: Headers | Record<string, string | string[]> | undefined,
  needle: string,
): string | undefined {
  if (!headers) return undefined;

  const needleCanonical = canonicalizeHeaderName(needle);

  for (const key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key)) {
      if (canonicalizeHeaderName(key) === needleCanonical) {
        const values = headers[key];
        return Array.isArray(values) ? values[0] : values;
      }
    }
  }

  return undefined;
}

/**
 * Sets a header to a single value, canonicalizing the header name.
 *
 * @param headers - The headers object.
 * @param key - The header name to set.
 * @param value - The value to assign to the header.
 */
export function setHeader(
  headers: Headers | Record<string, string | string[]>,
  key: string,
  value: string,
): void {
  const canonicalKey = canonicalizeHeaderName(key);
  headers[canonicalKey] = [value];
}

/**
 * Adds a value to an existing header, creating a new array if necessary, and canonicalizing the header name.
 *
 * @param headers - The headers object.
 * @param key - The header name to add to.
 * @param value - The value to add.
 */
export function addHeader(
  headers: Headers | Record<string, string | string[]>,
  key: string,
  value: string,
): void {
  const canonicalKey = canonicalizeHeaderName(key);
  const existingValue = headers[canonicalKey];

  if (Array.isArray(existingValue)) {
    existingValue.push(value);
  } else if (typeof existingValue === 'string') {
    headers[canonicalKey] = [existingValue, value];
  } else {
    headers[canonicalKey] = [value];
  }
}

/**
 * Canonicalizes a header value, converting numbers to strings.
 *
 * @param value - The value to canonicalize.
 * @returns The canonicalized value as a string.
 */
function canonicalizeValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

/**
 * Canonicalizes all headers in the headers object by ensuring consistent header names and values.
 *
 * @param hdr - The headers object to canonicalize.
 * @returns A new headers object with canonicalized header names and values.
 */
export function canonicalizeHeaders(
  hdr: Headers | Record<string, string | string[]>,
): Headers | Record<string, string | string[]> {
  const normalizedHeaders: Headers | Record<string, string | string[]> = {};

  for (const key in hdr) {
    if (Object.prototype.hasOwnProperty.call(hdr, key)) {
      const canonKey = canonicalizeHeaderName(key);
      const canonValues = [hdr[key]].flat().map(canonicalizeValue);

      if (normalizedHeaders[canonKey]) {
        if (Array.isArray(normalizedHeaders[canonKey])) {
          (normalizedHeaders[canonKey] as string[]).push(
            ...(canonValues as string[]),
          );
        } else {
          normalizedHeaders[canonKey] = [
            normalizedHeaders[canonKey] as string,
            ...canonValues,
          ];
        }
      } else {
        normalizedHeaders[canonKey] =
          canonValues.length > 1 ? canonValues : canonValues[0];
      }
    }
  }

  return normalizedHeaders;
}

/**
 * Removes a header from the headers object by canonicalizing the header name.
 *
 * @param headers - The headers object.
 * @param needle - The header name to remove.
 */
export function removeHeader(
  headers: Headers | Record<string, string | string[]>,
  needle: string,
): void {
  const canonKey = canonicalizeHeaderName(needle);
  delete headers[canonKey];
}

/**
 * Converts a headers object into an array of tuples, where each tuple represents a header name and value.
 *
 * @param headers - The headers object or undefined/null.
 * @returns An array of tuples where each tuple contains a header name and its corresponding value.
 */
export function flatHeaders(
  headers: Headers | Record<string, string | string[]> | undefined | null,
): [string, string][] {
  if (!headers) return [];

  return Object.entries(headers).flatMap(([header, values]) =>
    Array.isArray(values)
      ? values.map((value) => [header, value] as [string, string])
      : [[header, values] as [string, string]],
  );
}
