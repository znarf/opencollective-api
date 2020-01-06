interface Collective {
    id: string;
}

class SpamControl {
    private collectiveCheckList: string[] = ['name', 'website', 'description', 'longDescription']
    private blackList: string[] = [
        "keto",
        "porn",
        "pills"
    ];

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
    private collectiveCheck(collective: Collective): {collectiveId: string; warnings: object} {
        const result = {
            collectiveId: collective.id,
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

const spamController = new SpamControl()
export default spamController