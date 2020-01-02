/**
 * Returns SuspiciousKeywords
 * @param {String} content 
 */
export const getSuspiciousKeywords = (content: string): string[] => {
    const blackList = [
        'keto',
        'porn',
        'pills'
    ]

    const suspiciousWords = []

    blackList.forEach(keyword => {
        if(content.includes(keyword)){
            suspiciousWords.push(keyword)
        }
    });

    return suspiciousWords
}
