import type {Headers} from './types';

/**
 * Canonicalizes a header name by capitalizing each segment and ensuring consistent hyphenation.
 *
 * @param hdr - The header name to canonicalize.
 * @returns The canonicalized header name.
 */
export function canonicalizeHeaderName(hdr: string): string {
  return hdr.replace(
    /(^|-)(\w+)/g,
    (_fullMatch, start, letters) =>
      start +
      letters.slice(0, 1).toUpperCase() +
      letters.slice(1).toLowerCase(),
  );
}

/**
 * Retrieves all values associated with a canonicalized header name from the headers object.
 *
 * @param headers - The headers object or undefined.
 * @param needle_ - The header name to search for.
 * @returns An array of header values associated with the canonicalized header name.
 */
export function getHeaders(
  headers: Headers | undefined,
  needle_: string,
): string[] {
  const result: string[] = [];
  if (!headers) return result;
  const needle = canonicalizeHeaderName(needle_);
  for (const [key, values] of Object.entries(headers)) {
    if (canonicalizeHeaderName(key) !== needle) continue;
    if (Array.isArray(values)) {
      result.push(...values);
    } else {
      result.push(values);
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
  headers: Headers | undefined,
  needle: string,
): string | undefined {
  if (!headers) return undefined;
  return getHeaders(headers, needle)?.[0];
}
/**
 * Sets a header to a single value, canonicalizing the header name.
 *
 * @param headers - The headers object.
 * @param key - The header name to set.
 * @param value - The value to assign to the header.
 */
export function setHeader(headers: Headers, key: string, value: string) {
  canonicalizeHeaders(headers);
  headers[canonicalizeHeaderName(key)] = [value];
}
/**
 * Adds a value to an existing header, creating a new array if necessary, and canonicalizing the header name.
 *
 * @param headers - The headers object.
 * @param key - The header name to add to.
 * @param value - The value to add.
 */
export function addHeader(headers: Headers, key: string, value: string) {
  canonicalizeHeaders(headers);
  const canonKey = canonicalizeHeaderName(key);
  let list = headers[canonKey];
  if (!list) {
    list = [];
  } else if (!Array.isArray(list)) {
    list = [list];
  }
  headers[canonKey] = list;
  list.push(value);
}

/**
 * Canonicalizes a header value, converting numbers to strings.
 *
 * @param value - The value to canonicalize.
 * @returns The canonicalized value as a string.
 */
function canonicalizeValue(value: any): any {
  if (typeof value === 'number') return value.toString();
  return value;
}

/**
 * Canonicalizes all headers in the headers object by ensuring consistent header names and values.
 *
 * @param hdr - The headers object to canonicalize.
 * @returns The headers object with canonicalized header names and values.
 */
export function canonicalizeHeaders(hdr: Headers): Headers {
  for (const [key, values] of Object.entries(hdr)) {
    const canonKey = canonicalizeHeaderName(key);
    if (!hdr[canonKey]) hdr[canonKey] = [];
    if (!Array.isArray(hdr[canonKey]))
      hdr[canonKey] = [canonicalizeValue(hdr[canonKey])];
    if (key === canonKey) continue;
    delete hdr[key];
    (hdr[canonKey] as any).push(
      ...[values].flat().map((value) => canonicalizeValue(value)),
    );
  }
  return hdr;
}

/**
 * Removes a header from the headers object.
 *
 * @param headers - The headers object.
 * @param needle - The header name to remove.
 */
export function removeHeader(headers: Headers, needle: string) {
  canonicalizeHeaders(headers);
  const canonKey = canonicalizeHeaderName(needle);
  delete headers[canonKey];
}

/**
 * Converts a headers object into an array of tuples, where each tuple represents a header name and value.
 *
 * @param {Object|string[][]} headers - The headers object or undefined/null.
 * @returns {string[][]} An array of tuples where each tuple contains a header name and its corresponding value.
 *
 * @example
 * // Example headers object
 * const headers = {
 *   'Set-Cookie': 'a=b',
 *   'Set-Cookie': 'x=y'
 * };
 *
 * // Converted to an array of tuples
 * const result = convertHeadersToTuples(headers);
 * console.log(result);
 * // Output: [
 * //   ["Set-Cookie", "a=b"],
 * //   ["Set-Cookie", "x=y"]
 * // ]
 */
export function flatHeaders(
  headers: Headers | undefined | null,
): [string, string][] {
  if (!headers) return [];

  return Object.entries(headers).flatMap(([header, values]) =>
    Array.isArray(values)
      ? values.map((value): [string, string] => [header, value])
      : [[header, values]],
  );
}
