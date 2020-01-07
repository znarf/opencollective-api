interface Collective {
    id: string;
}

/**
 * SpamControl: Singleton Design Pattern
 */
class SpamControl {
    private static instance: SpamControl
    private collectiveCheckList: string[] = ['name', 'website', 'description', 'longDescription']
    private blackList: string[] = [
        "keto",
        "porn",
        "pills"
    ];

    public static getInstance(): SpamControl {
        if(!SpamControl.instance) {
            SpamControl.instance = new SpamControl();
        }

        return SpamControl.instance;
    }

    /**
     * Returns SuspiciousKeywords
     * @param {String} content 
     */
    private getSuspiciousKeywords(content: string): string[] {
        const suspiciousWords = []
        this.blackList.forEach(keyword => {
            if(content.includes(keyword)){
                suspiciousWords.push(keyword)
            }
        });
        return suspiciousWords
    }

    /**
     * 
     * @param collective {Collective}
     */
    private collectiveCheck(collective: Collective): {collective: Collective; warnings: object} {
        const result = {
            collective,
            warnings: {}
        }
        this.collectiveCheckList.forEach(prop => {
            const suspiciousKeywords = this.getSuspiciousKeywords(collective[prop] || "");
            if (suspiciousKeywords.length) {
              result.warnings[prop] = suspiciousKeywords
            }
        });
        return result
    }

}

const spamController = SpamControl.getInstance()
<<<<<<< HEAD
export default spamController
=======
export default spamController
>>>>>>> f98a331012bbcd60c065666e0f9b8fe16675b9d7
