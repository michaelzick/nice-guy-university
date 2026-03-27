export type XapiStatement = {
  actor: { mbox: string; name: string };
  verb: { id: string; display: Record<string, string> };
  object: { id: string; definition?: { name?: Record<string, string> } };
  result?: { completion?: boolean; duration?: string; score?: { scaled?: number } };
  timestamp: string;
};

const VERBS = {
  initialized: 'http://adlnet.gov/expapi/verbs/initialized',
  progressed: 'http://adlnet.gov/expapi/verbs/progressed',
  completed: 'http://adlnet.gov/expapi/verbs/completed',
} as const;

export class XapiTracker {
  private endpoint: string;
  private activityId: string;
  private actorEmail: string;
  private actorName: string;
  private onInitialized?: (statement: XapiStatement) => Promise<void>;
  private onProgressed?: (statement: XapiStatement, progressPercent: number, positionSeconds: number) => Promise<void>;
  private onCompleted?: (statement: XapiStatement) => Promise<void>;

  constructor(config: {
    endpoint: string;
    activityId: string;
    actorEmail: string;
    actorName: string;
    onInitialized?: (statement: XapiStatement) => Promise<void>;
    onProgressed?: (statement: XapiStatement, progressPercent: number, positionSeconds: number) => Promise<void>;
    onCompleted?: (statement: XapiStatement) => Promise<void>;
  }) {
    this.endpoint = config.endpoint;
    this.activityId = config.activityId;
    this.actorEmail = config.actorEmail;
    this.actorName = config.actorName;
    this.onInitialized = config.onInitialized;
    this.onProgressed = config.onProgressed;
    this.onCompleted = config.onCompleted;
  }

  private buildStatement(verbId: string, verbDisplay: string, result?: XapiStatement['result']): XapiStatement {
    return {
      actor: { mbox: `mailto:${this.actorEmail}`, name: this.actorName },
      verb: { id: verbId, display: { 'en-US': verbDisplay } },
      object: { id: this.activityId },
      result,
      timestamp: new Date().toISOString(),
    };
  }

  private async sendStatement(statement: XapiStatement) {
    // Send to external LRS if configured
    if (this.endpoint) {
      try {
        await fetch(`${this.endpoint}/statements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statement),
        });
      } catch (err) {
        console.error('Failed to send xAPI statement to LRS:', err);
      }
    }

    if (statement.verb.id === VERBS.completed) {
      await this.onCompleted?.(statement);
      return;
    }

    await this.onInitialized?.(statement);
  }

  async initialized() {
    await this.sendStatement(this.buildStatement(VERBS.initialized, 'initialized'));
  }

  async progressed(progressPercent: number, positionSeconds: number) {
    const statement = this.buildStatement(VERBS.progressed, 'progressed', {
      score: { scaled: progressPercent / 100 },
    });

    if (this.endpoint) {
      try {
        await fetch(`${this.endpoint}/statements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(statement),
        });
      } catch (err) {
        console.error('Failed to send xAPI statement to LRS:', err);
      }
    }

    await this.onProgressed?.(statement, progressPercent, positionSeconds);
  }

  async completed() {
    await this.sendStatement(this.buildStatement(VERBS.completed, 'completed', {
      completion: true,
      score: { scaled: 1 },
    }));
  }
}
