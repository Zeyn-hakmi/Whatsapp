import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfService() {
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
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Terms of Service</span>
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 26, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing or using WhatsApp Bot Builder ("Service"), you agree to be bound by these Terms
                            of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Service</h2>
                        <p className="text-muted-foreground mb-4">
                            WhatsApp Bot Builder is a SaaS platform that enables businesses to:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Connect and manage WhatsApp Business accounts</li>
                            <li>Create automated chatbot flows</li>
                            <li>Send and receive messages</li>
                            <li>Manage contacts and templates</li>
                            <li>Access analytics and reporting</li>
                            <li>Utilize AI-powered conversation features</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">3. Account Registration</h2>
                        <p className="text-muted-foreground mb-4">To use the Service, you must:</p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Be at least 18 years old</li>
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Accept all responsibility for activities under your account</li>
                            <li>Notify us immediately of any unauthorized account use</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Subscription and Billing</h2>

                        <h3 className="text-lg font-medium text-foreground mb-3">4.1 Subscription Plans</h3>
                        <p className="text-muted-foreground mb-4">
                            We offer various subscription tiers with different features and usage limits.
                            Details are available on our pricing page.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">4.2 Payment</h3>
                        <p className="text-muted-foreground mb-4">
                            Subscription fees are billed in advance on a monthly or annual basis.
                            All fees are non-refundable except as required by law.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">4.3 Cancellation</h3>
                        <p className="text-muted-foreground">
                            You may cancel your subscription at any time. Access continues until the end
                            of your current billing period.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Acceptable Use</h2>
                        <p className="text-muted-foreground mb-4">
                            You agree to use the Service in compliance with our <Link to="/legal/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link>.
                            You must not:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Send spam or unsolicited messages</li>
                            <li>Violate Meta's WhatsApp Business policies</li>
                            <li>Use the Service for illegal purposes</li>
                            <li>Attempt to gain unauthorized access</li>
                            <li>Interfere with or disrupt the Service</li>
                            <li>Resell or redistribute the Service without authorization</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. WhatsApp Business Compliance</h2>
                        <p className="text-muted-foreground mb-4">
                            As a WhatsApp Business API provider, we and you must comply with Meta's policies:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>Obtain proper consent before messaging contacts</li>
                            <li>Respect the 24-hour messaging window</li>
                            <li>Use approved message templates for business-initiated messages</li>
                            <li>Provide opt-out mechanisms for recipients</li>
                            <li>Maintain message quality to preserve quality ratings</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">7. Intellectual Property</h2>
                        <p className="text-muted-foreground mb-4">
                            The Service and its contents are owned by us and protected by intellectual property laws.
                            You retain ownership of content you create, but grant us a license to use it for providing the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">8. Data Protection</h2>
                        <p className="text-muted-foreground">
                            We process personal data in accordance with our <Link to="/legal/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                            You are responsible for ensuring your use of the Service complies with applicable data protection laws.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">9. Service Availability</h2>
                        <p className="text-muted-foreground">
                            We strive to maintain high availability but do not guarantee uninterrupted service.
                            We may suspend or terminate the Service for maintenance, updates, or other reasons
                            with reasonable notice when possible.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                            special, consequential, or punitive damages, including loss of profits, data, or business opportunities,
                            arising from your use of the Service.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">11. Disclaimer of Warranties</h2>
                        <p className="text-muted-foreground">
                            The Service is provided "as is" without warranties of any kind, either express or implied.
                            We do not warrant that the Service will be error-free or uninterrupted.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">12. Termination</h2>
                        <p className="text-muted-foreground">
                            We may terminate or suspend your account immediately, without prior notice, for conduct that
                            violates these Terms or is harmful to other users, us, or third parties.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">13. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these Terms at any time. We will provide notice of material
                            changes. Your continued use of the Service after changes become effective constitutes acceptance.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">14. Governing Law</h2>
                        <p className="text-muted-foreground">
                            These Terms shall be governed by the laws of [Jurisdiction], without regard to conflict of law provisions.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">15. Contact Information</h2>
                        <p className="text-muted-foreground">
                            For questions about these Terms, please contact us at:
                        </p>
                        <p className="text-muted-foreground mt-2">
                            Email: legal@example.com<br />
                            Address: [Your Business Address]
                        </p>
                    </section>
                </div>
            </motion.main>

            {/* Footer */}
            <footer className="border-t border-border py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex justify-center gap-6 mb-4">
                        <Link to="/legal/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link to="/legal/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</Link>
                        <Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                    <p>© {new Date().getFullYear()} WhatsApp Bot Builder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
