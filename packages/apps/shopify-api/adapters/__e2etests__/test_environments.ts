import {E2eTestEnvironment} from './test_config_types';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function shutdownEnvironments(environments: E2eTestEnvironment[]): void {
  for (const env of environments) {
    if (typeof env.process.pid !== 'undefined') {
      try {
        process.kill(-env.process.pid);
      } catch (err) {
        // Process might already be dead, ignore ESRCH errors
        if (err.code !== 'ESRCH') {
          throw err;
        }
      }
    }
  }
}

async function serverReady(domain: string): Promise<boolean> {
  try {
    const response = await fetch(domain);
    return response.status === 200;
  } catch (err) {
    return false;
  }
}

function allEnvironmentsReady(environments: E2eTestEnvironment[]): boolean {
  return environments.map((env) => env.ready).every((ready) => ready);
}

export async function runEnvironments(
  environments: E2eTestEnvironment[],
): Promise<boolean> {
  // Give enough time for the servers to start listening
  await sleep(2000);

  const maxAttempts = 5;

  if (allEnvironmentsReady(environments)) return true;

  for (const env of environments) {
    let attempts = 0;
    let ready = false;

    while (!ready && attempts < maxAttempts) {
      attempts++;
      await sleep(100);
      ready = await serverReady(env.domain);
    }
    env.ready = ready;
  }
  return allEnvironmentsReady(environments);
}
