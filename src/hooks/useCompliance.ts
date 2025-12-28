import { useMemo } from 'react';

// Prohibited content patterns
const PROHIBITED_PATTERNS = [
    // Adult content
    /\b(porn|xxx|adult\s+content|escort|sex\s+services?)\b/i,
    // Drug sales
    /\b(drugs?\s+for\s+sale|buy\s+cocaine|buy\s+heroin|illegal\s+substances?)\b/i,
    // Weapons
    /\b(weapons?\s+for\s+sale|buy\s+gun|illegal\s+firearms?)\b/i,
    // Scams
    /\b(click\s+here\s+to\s+win|free\s+money|you('ve)?\s+won\s+\$?\d+|act\s+now\s+or\s+lose|limited\s+time\s+offer\s+expires?\s+now)\b/i,
    // Phishing
    /\b(verify\s+your\s+account|your\s+account\s+will\s+be\s+suspended|confirm\s+your\s+password|update\s+your\s+payment)\b/i,
    // Crypto scams
    /\b(guaranteed\s+returns?|double\s+your\s+(bitcoin|crypto|money)|risk.?free\s+investment)\b/i,
];

// Spam indicators
const SPAM_INDICATORS = {
    excessiveCapsThreshold: 0.5,
    excessivePunctuationThreshold: 3,
    suspiciousLinkPatterns: [
        /bit\.ly/i,
        /tinyurl/i,
        /t\.co/i,
        /click\s*here/i,
    ],
};

export interface ComplianceViolation {
    type: 'PROHIBITED_CONTENT' | 'SPAM' | '24_HOUR_WINDOW' | 'NO_OPT_IN' | 'RATE_LIMIT';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: string;
}

export interface ComplianceCheckResult {
    allowed: boolean;
    violations: ComplianceViolation[];
    score: number; // 0-100, higher is better
}

export interface MessageToCheck {
    content: string;
    contactPhone: string;
    lastInboundMessageAt?: Date | string | null;
    contactOptInStatus?: string;
}

export function useCompliance() {

    /**
     * Check content for prohibited patterns and spam indicators
     */
    const checkContent = (content: string): ComplianceViolation[] => {
        const violations: ComplianceViolation[] = [];

        if (!content || content.trim().length === 0) {
            return violations;
        }

        // Check prohibited patterns
        for (const pattern of PROHIBITED_PATTERNS) {
            if (pattern.test(content)) {
                violations.push({
                    type: 'PROHIBITED_CONTENT',
                    severity: 'critical',
                    message: 'Message contains prohibited content',
                    details: `Pattern matched: ${pattern.source}`,
                });
                break; // One prohibited content violation is enough
            }
        }

        // Check for spam indicators
        const spamScore = calculateSpamScore(content);
        if (spamScore > 70) {
            violations.push({
                type: 'SPAM',
                severity: spamScore > 90 ? 'high' : 'medium',
                message: 'Message appears to be spam',
                details: `Spam score: ${spamScore}/100`,
            });
        }

        return violations;
    };

    /**
     * Calculate spam score (0-100, higher = more likely spam)
     */
    const calculateSpamScore = (content: string): number => {
        let score = 0;

        // Check excessive caps
        const capsCount = (content.match(/[A-Z]/g) || []).length;
        const capsRatio = capsCount / content.length;
        if (capsRatio > SPAM_INDICATORS.excessiveCapsThreshold && content.length > 20) {
            score += 25;
        }

        // Check excessive punctuation
        const excessivePunctuation = (content.match(/[!?]{2,}/g) || []).length;
        if (excessivePunctuation > SPAM_INDICATORS.excessivePunctuationThreshold) {
            score += 20;
        }

        // Check suspicious links
        for (const pattern of SPAM_INDICATORS.suspiciousLinkPatterns) {
            if (pattern.test(content)) {
                score += 15;
            }
        }

        // Check for common spam phrases
        const spamPhrases = [
            'act now', 'limited time', 'free money', 'claim your prize',
            'urgent action required', 'congratulations you won', 'no risk',
        ];
        for (const phrase of spamPhrases) {
            if (content.toLowerCase().includes(phrase)) {
                score += 15;
            }
        }

        // Check for repeated characters
        if (/(.)\1{4,}/.test(content)) {
            score += 10;
        }

        return Math.min(100, score);
    };

    /**
     * Check if within 24-hour messaging window
     */
    const check24HourWindow = (lastInboundMessageAt: Date | string | null | undefined): ComplianceViolation[] => {
        if (!lastInboundMessageAt) {
            return [{
                type: '24_HOUR_WINDOW',
                severity: 'high',
                message: 'No recent inbound message from contact',
                details: 'Cannot send message outside 24-hour window without an approved template',
            }];
        }

        const lastMessage = new Date(lastInboundMessageAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
            return [{
                type: '24_HOUR_WINDOW',
                severity: 'high',
                message: '24-hour messaging window has expired',
                details: `Last inbound message was ${Math.round(hoursDiff)} hours ago`,
            }];
        }

        return [];
    };

    /**
     * Check opt-in status
     */
    const checkOptInStatus = (status: string | undefined): ComplianceViolation[] => {
        if (!status || status === 'pending') {
            return [{
                type: 'NO_OPT_IN',
                severity: 'medium',
                message: 'Contact has not confirmed opt-in',
                details: 'Consider sending opt-in request first',
            }];
        }

        if (status === 'opted_out') {
            return [{
                type: 'NO_OPT_IN',
                severity: 'critical',
                message: 'Contact has opted out of messages',
                details: 'You cannot send messages to contacts who have opted out',
            }];
        }

        return [];
    };

    /**
     * Full compliance check for outbound message
     */
    const checkMessage = (message: MessageToCheck): ComplianceCheckResult => {
        const violations: ComplianceViolation[] = [];

        // Content check
        violations.push(...checkContent(message.content));

        // 24-hour window check (skip for template messages)
        violations.push(...check24HourWindow(message.lastInboundMessageAt));

        // Opt-in check
        violations.push(...checkOptInStatus(message.contactOptInStatus));

        // Calculate compliance score
        let score = 100;
        for (const violation of violations) {
            switch (violation.severity) {
                case 'critical': score -= 40; break;
                case 'high': score -= 25; break;
                case 'medium': score -= 15; break;
                case 'low': score -= 5; break;
            }
        }

        const hasCritical = violations.some(v => v.severity === 'critical');

        return {
            allowed: !hasCritical && violations.length === 0,
            violations,
            score: Math.max(0, score),
        };
    };

    /**
     * Check if message can be sent (quick check)
     */
    const canSendMessage = (message: MessageToCheck): boolean => {
        const result = checkMessage(message);
        return result.allowed;
    };

    /**
     * Sanitize content by removing prohibited patterns
     * Returns null if content cannot be sanitized
     */
    const sanitizeContent = (content: string): string | null => {
        let sanitized = content;

        // Check for critical violations first
        for (const pattern of PROHIBITED_PATTERNS) {
            if (pattern.test(sanitized)) {
                return null; // Cannot sanitize prohibited content
            }
        }

        // Remove excessive caps (convert to normal case)
        const capsRatio = (sanitized.match(/[A-Z]/g) || []).length / sanitized.length;
        if (capsRatio > 0.5 && sanitized.length > 20) {
            sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();
        }

        // Remove excessive punctuation
        sanitized = sanitized.replace(/[!?]{3,}/g, '!');

        return sanitized;
    };

    return useMemo(() => ({
        checkContent,
        checkMessage,
        canSendMessage,
        check24HourWindow,
        checkOptInStatus,
        calculateSpamScore,
        sanitizeContent,
    }), []);
}

export default useCompliance;
