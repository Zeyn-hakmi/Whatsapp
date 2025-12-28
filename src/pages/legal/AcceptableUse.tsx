import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function AcceptableUse() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Acceptable Use Policy</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto px-4 py-12 max-w-4xl"
            >
                <div className="prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Acceptable Use Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 26, 2024</p>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8">
                        <p className="text-amber-500 font-medium">
                            Violation of this policy may result in immediate suspension or termination of your account.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">1. Purpose</h2>
                        <p className="text-muted-foreground">
                            This Acceptable Use Policy ("Policy") governs your use of WhatsApp Bot Builder and is designed
                            to ensure compliance with WhatsApp Business policies, applicable laws, and to protect all users
                            of our platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. Prohibited Content</h2>
                        <p className="text-muted-foreground mb-4">
                            You must not use our platform to send, store, or distribute content that:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or obscene</li>
                            <li>Promotes violence, discrimination, or hatred against individuals or groups</li>
                            <li>Contains sexually explicit material or promotes sexual services</li>
                            <li>Promotes illegal drugs, weapons, or other regulated products</li>
                            <li>Infringes on intellectual property rights</li>
                            <li>Contains malware, viruses, or other harmful code</li>
                            <li>Is designed to deceive or defraud recipients</li>
                            <li>Violates the privacy of others</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">3. Messaging Rules</h2>

                        <h3 className="text-lg font-medium text-foreground mb-3">3.1 Consent Requirements</h3>
                        <p className="text-muted-foreground mb-4">You must:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                            <li>Obtain explicit opt-in consent before sending messages</li>
                            <li>Document when and how consent was obtained</li>
                            <li>Honor opt-out requests within 24 hours</li>
                            <li>Maintain accurate records of consent status</li>
                        </ul>

                        <h3 className="text-lg font-medium text-foreground mb-3">3.2 Spam Prevention</h3>
                        <p className="text-muted-foreground mb-4">You must not:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                            <li>Send unsolicited bulk messages</li>
                            <li>Send excessive messages to the same recipient</li>
                            <li>Use deceptive subject lines or sender information</li>
                            <li>Harvest or purchase phone numbers for messaging</li>
                        </ul>

                        <h3 className="text-lg font-medium text-foreground mb-3">3.3 24-Hour Window Compliance</h3>
                        <p className="text-muted-foreground">
                            You must respect WhatsApp's 24-hour messaging window. After a user messages you, you have
                            24 hours to respond with free-form messages. Outside this window, you may only send
                            approved template messages.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Account Conduct</h2>
                        <p className="text-muted-foreground mb-4">You must not:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Create multiple accounts to circumvent restrictions</li>
                            <li>Share account credentials with unauthorized users</li>
                            <li>Use automation to circumvent rate limits</li>
                            <li>Attempt to access other users' accounts or data</li>
                            <li>Interfere with the platform's operation or security</li>
                            <li>Reverse engineer or decompile the platform</li>
                            <li>Resell access without authorization</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Industry-Specific Requirements</h2>

                        <h3 className="text-lg font-medium text-foreground mb-3">5.1 Healthcare</h3>
                        <p className="text-muted-foreground mb-4">
                            If you handle protected health information (PHI), you must comply with HIPAA and similar
                            regulations. Do not transmit sensitive medical information without appropriate safeguards.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">5.2 Financial Services</h3>
                        <p className="text-muted-foreground mb-4">
                            Financial institutions must comply with relevant regulations. Do not solicit financial
                            information through messages without proper security measures.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">5.3 E-commerce</h3>
                        <p className="text-muted-foreground">
                            E-commerce users must accurately represent products and services, honor stated prices,
                            and comply with consumer protection laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. Bot and Automation Rules</h2>
                        <p className="text-muted-foreground mb-4">When using automated bots:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Clearly identify automated responses when appropriate</li>
                            <li>Provide easy access to human support</li>
                            <li>Ensure bots respond appropriately to user requests</li>
                            <li>Do not use bots to manipulate or deceive users</li>
                            <li>Test bots thoroughly before deploying to production</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">7. Quality Standards</h2>
                        <p className="text-muted-foreground mb-4">
                            To maintain platform quality and WhatsApp quality ratings, you should:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Send relevant, expected content to recipients</li>
                            <li>Respond promptly to customer inquiries</li>
                            <li>Monitor and maintain good quality ratings</li>
                            <li>Address user complaints and feedback</li>
                            <li>Keep message frequency reasonable</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">8. Enforcement</h2>
                        <p className="text-muted-foreground mb-4">
                            We may take the following actions for policy violations:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Warning:</strong> For minor or first-time violations</li>
                            <li><strong>Feature Restriction:</strong> Limiting access to specific features</li>
                            <li><strong>Temporary Suspension:</strong> Suspending account for investigation</li>
                            <li><strong>Permanent Termination:</strong> For severe or repeated violations</li>
                            <li><strong>Legal Action:</strong> For illegal activities</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">9. Reporting Violations</h2>
                        <p className="text-muted-foreground">
                            If you become aware of any violation of this policy, please report it immediately to
                            abuse@example.com. Include as much detail as possible to help us investigate.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">10. Policy Updates</h2>
                        <p className="text-muted-foreground">
                            We may update this policy to reflect changes in our practices or legal requirements.
                            We will notify users of significant changes through the platform or email.
                        </p>
                    </section>
                </div>
            </motion.main>

            {/* Footer */}
            <footer className="border-t border-border py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex justify-center gap-6 mb-4">
                        <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                    <p>© {new Date().getFullYear()} WhatsApp Bot Builder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
