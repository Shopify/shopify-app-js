import {Job} from './job';

export class IdempotentJobScheduler {
  protected jobIdentifiers: Set<string>;

  constructor() {
    this.jobIdentifiers = new Set<string>();
  }

  scheduleJob(job: Job<any>, options?: {jobIdentifier?: string}): Promise<any> {
    if (this.isJobRunnable(options?.jobIdentifier)) {
      job.run();
    }

    return Promise.resolve();
  }

  // eslint-disable-next-line no-warning-comments
  // TODO: Make this atomic
  private isJobRunnable(jobIdentifier?: string) {
    if (!jobIdentifier) return true;

    if (!this.jobIdentifiers.has(jobIdentifier)) {
      this.jobIdentifiers.add(jobIdentifier);
      return true;
    }
    return false;
  }
}
