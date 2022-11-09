import {Session} from '@shopify/shopify-api';

// compare two arrays of sessions that should contain
// the same sessions but may be in a different order
export function sessionArraysEqual(
  sessionArray1: Session[],
  sessionArray2: Session[],
): boolean {
  if (sessionArray1.length !== sessionArray2.length) {
    return false;
  }

  for (const session1 of sessionArray1) {
    let found = false;
    for (const session2 of sessionArray2) {
      if (session1.equals(session2)) {
        found = true;
        continue;
      }
    }
    if (!found) return false;
  }
  return true;
}
