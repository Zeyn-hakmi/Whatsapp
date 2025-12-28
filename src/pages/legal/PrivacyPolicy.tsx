import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
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
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Privacy Policy</span>
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 26, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
                        <p className="text-muted-foreground mb-4">
                            Welcome to WhatsApp Bot Builder ("we," "our," or "us"). We are committed to protecting your
                            personal information and your right to privacy. This Privacy Policy explains how we collect,
                            use, disclose, and safeguard your information when you use our platform.
                        </p>
                        <p className="text-muted-foreground">
                            Please read this privacy policy carefully. If you do not agree with the terms of this privacy
                            policy, please do not access the platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.1 Personal Information</h3>
                        <p className="text-muted-foreground mb-4">We may collect personal information that you voluntarily provide, including:</p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                            <li>Name and email address</li>
                            <li>Company name and business information</li>
                            <li>Phone numbers connected to your account</li>
                            <li>Payment and billing information</li>
                            <li>Account credentials</li>
                        </ul>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.2 Message Data</h3>
                        <p className="text-muted-foreground mb-4">
                            When you use our platform to send and receive messages, we process:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-2">
                            <li>Message content and metadata</li>
                            <li>Contact information of message recipients</li>
                            <li>Timestamps and delivery status</li>
                            <li>Media files shared through messages</li>
                        </ul>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.3 Usage Data</h3>
                        <p className="text-muted-foreground">
                            We automatically collect certain information when you use the platform, including your IP address,
                            browser type, operating system, access times, and pages viewed.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Provide, operate, and maintain the platform</li>
                            <li>Process and deliver messages on your behalf</li>
                            <li>Manage your account and provide customer support</li>
                            <li>Process payments and send billing information</li>
                            <li>Send administrative information and updates</li>
                            <li>Analyze usage patterns to improve our services</li>
                            <li>Detect, prevent, and address technical issues</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Information Sharing</h2>
                        <p className="text-muted-foreground mb-4">
                            We may share your information in the following situations:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf</li>
                            <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>With Your Consent:</strong> When you have given us permission to share</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
                        <p className="text-muted-foreground">
                            We implement appropriate technical and organizational security measures to protect your
                            personal information. However, no method of transmission over the Internet is 100% secure,
                            and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                        <p className="text-muted-foreground">
                            We retain your personal information for as long as necessary to fulfill the purposes outlined
                            in this privacy policy, unless a longer retention period is required by law. Message data is
                            retained for the duration of your subscription plus 30 days after account closure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                        <p className="text-muted-foreground mb-4">Depending on your location, you may have rights including:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Access to your personal information</li>
                            <li>Correction of inaccurate data</li>
                            <li>Deletion of your data</li>
                            <li>Data portability</li>
                            <li>Withdrawal of consent</li>
                            <li>Objection to processing</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">8. Third-Party Services</h2>
                        <p className="text-muted-foreground">
                            Our platform integrates with third-party services including Meta (WhatsApp Business API),
                            payment processors, and analytics providers. These services have their own privacy policies
                            and we encourage you to review them.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">9. Children's Privacy</h2>
                        <p className="text-muted-foreground">
                            Our platform is not intended for individuals under the age of 18. We do not knowingly
                            collect personal information from children.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">10. Changes to This Policy</h2>
                        <p className="text-muted-foreground">
                            We may update this privacy policy from time to time. We will notify you of any changes by
                            posting the new policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">11. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions or concerns about this privacy policy, please contact us at:
                        </p>
                        <p className="text-muted-foreground mt-2">
                            Email: privacy@example.com<br />
                            Address: [Your Business Address]
                        </p>
                    </section>
                </div>
            </motion.main>

            {/* Footer */}
            <footer className="border-t border-border py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex justify-center gap-6 mb-4">
                        <Link to="/legal/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link to="/legal/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</Link>
                        <Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                    <p>© {new Date().getFullYear()} WhatsApp Bot Builder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
