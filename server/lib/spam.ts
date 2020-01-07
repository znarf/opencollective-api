import slackLib from '../lib/slack';
import activities from '../constants/activities';

interface Collective {
  id: string;
}

/**
 * SpamControl: Singleton Design Pattern
 */
export class SpamControl {
  private static instance: SpamControl;
  private collectiveCheckList: string[] = ['name', 'website', 'description', 'longDescription'];
  private blackList: string[] = ['keto', 'porn', 'pills'];

  public static getInstance(): SpamControl {
    if (!SpamControl.instance) {
      SpamControl.instance = new SpamControl();
    }

    return SpamControl.instance;
  }

  /**
   * Returns SuspiciousKeywords
   * @param {String} content
   */
  private getSuspiciousKeywords(content: string): string[] {
    const suspiciousWords = [];
    this.blackList.forEach(keyword => {
      if (content.includes(keyword)) {
        suspiciousWords.push(keyword);
      }
    });
    return suspiciousWords;
  }

  /**
   *
   * @param collective {Collective}
   */
  private collectiveCheck(collective: Collective): { collective: Collective; warnings: object } {
    const result = {
      collective,
      warnings: {},
    };
    this.collectiveCheckList.forEach(prop => {
      const suspiciousKeywords = this.getSuspiciousKeywords(collective[prop] || '');
      if (suspiciousKeywords.length) {
        result.warnings[prop] = suspiciousKeywords;
      }
    });

    // Send Notification on Slack
    // TODO: Add WEBHOOK
    if (Object.keys(result).length) {
        slackLib.postActivityOnPublicChannel(
          {
            type: activities.COLLECTIVE_BADWORD_DETECTED,
            data: result,
          },
          'WEBHOOK',
        );
    }
    return
  }

}

export default SpamControl.getInstance();
