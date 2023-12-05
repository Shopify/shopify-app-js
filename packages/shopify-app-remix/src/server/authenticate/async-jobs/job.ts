export abstract class Job<T> {
  parameters: T;
  jobName: string;
  constructor(parameters: T) {
    this.parameters = parameters;
    this.jobName = this.constructor.name;
  }

  abstract run(): Promise<void>;
}
