import type {redirect as ServerRuntimeRedirectFn} from '@remix-run/server-runtime';
import type {redirect as NodeRedirectFn} from '@remix-run/node';

// Define a type that represents the redirect function signature from either package.
type RedirectFunction = typeof ServerRuntimeRedirectFn | typeof NodeRedirectFn;

let redirectFunction: RedirectFunction | undefined;
let importPromise: Promise<RedirectFunction> | null = null;

const packagesToTry = [
  '@remix-run/server-runtime',
  '@remix-run/node',
  'react-router',
] as const;

/**
 * Attempts to dynamically import the 'redirect' function from a given package.
 * Handles MODULE_NOT_FOUND errors gracefully.
 * @param packageName The name of the package to import from.
 * @returns The redirect function if found, otherwise null.
 * @throws Re-throws any error other than MODULE_NOT_FOUND.
 */
async function tryImportRedirect(
  packageName: (typeof packagesToTry)[number],
): Promise<RedirectFunction | null> {
  try {
    const mod = await import(packageName);
    if (mod.redirect) {
      console.log(`Using redirect from ${packageName}`);
      return mod.redirect as RedirectFunction;
    }
    return null;
  } catch (error: any) {
    if (error.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error importing ${packageName}:`, error);
      // Re-throw unexpected errors
      throw error;
    }
    // Log module not found, but don't throw, just return null
    console.log(`${packageName} not found.`);
    return null;
  }
}

/**
 * Dynamically imports the 'redirect' function from available Remix runtimes.
 * Prioritizes '@remix-run/server-runtime', then '@remix-run/node'.
 * Throws an error if neither package can be resolved.
 * Memoizes the result for subsequent calls.
 */
export async function getRedirect(): Promise<RedirectFunction> {
  // Return immediately if already resolved
  if (redirectFunction) {
    return redirectFunction;
  }

  // Return existing promise if import is already in progress
  if (importPromise) {
    return importPromise;
  }

  // Start the import process
  importPromise = (async (): Promise<RedirectFunction> => {
    for (const pkg of packagesToTry) {
      try {
        const importedRedirect = await tryImportRedirect(pkg);
        if (importedRedirect) {
          redirectFunction = importedRedirect;
          return redirectFunction;
        }
        // If null, continue to the next package
      } catch (error) {
        // Handle unexpected errors re-thrown from tryImportRedirect
        importPromise = null;
        throw error;
      }
    }

    // If the loop completes without finding the function
    importPromise = null;
    console.error(
      `Could not load redirect function from ${packagesToTry.join(' or ')}.`,
    );
    throw new Error(
      `Could not find a suitable redirect function. Please ensure either ${packagesToTry
        .map((pkg) => `"${pkg}"`)
        .join(' or ')} is installed and provides a "redirect" export.`,
    );
  })();

  return importPromise;
}
