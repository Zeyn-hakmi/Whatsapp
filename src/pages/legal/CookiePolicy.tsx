import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiePolicy() {
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
                        <Cookie className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">Cookie Policy</span>
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
                    <h1 className="text-3xl font-bold text-foreground mb-2">Cookie Policy</h1>
                    <p className="text-muted-foreground mb-8">Last updated: December 26, 2024</p>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
                        <p className="text-muted-foreground">
                            Cookies are small text files stored on your device when you visit our platform. They help
                            us provide you with a better experience by remembering your preferences, keeping you signed in,
                            and understanding how you use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">2. Types of Cookies We Use</h2>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.1 Essential Cookies</h3>
                        <p className="text-muted-foreground mb-4">
                            These cookies are necessary for the platform to function. They enable core features like
                            authentication and security. You cannot opt out of these cookies.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.2 Preference Cookies</h3>
                        <p className="text-muted-foreground mb-4">
                            These cookies remember your settings and preferences, such as language and display options,
                            to provide a more personalized experience.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.3 Analytics Cookies</h3>
                        <p className="text-muted-foreground mb-4">
                            These cookies help us understand how visitors use our platform by collecting anonymous
                            information about page visits, traffic sources, and user behavior.
                        </p>

                        <h3 className="text-lg font-medium text-foreground mb-3">2.4 Marketing Cookies</h3>
                        <p className="text-muted-foreground">
                            These cookies track your activity across websites to deliver relevant advertisements
                            and measure the effectiveness of our marketing campaigns.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">3. Cookies We Use</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-4 text-foreground">Cookie Name</th>
                                        <th className="text-left p-4 text-foreground">Purpose</th>
                                        <th className="text-left p-4 text-foreground">Duration</th>
                                        <th className="text-left p-4 text-foreground">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <td className="p-4">sb-auth-token</td>
                                        <td className="p-4">Authentication session</td>
                                        <td className="p-4">Session</td>
                                        <td className="p-4">Essential</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4">theme</td>
                                        <td className="p-4">User theme preference</td>
                                        <td className="p-4">1 year</td>
                                        <td className="p-4">Preference</td>
                                    </tr>
                                    <tr className="border-b border-border">
                                        <td className="p-4">_ga</td>
                                        <td className="p-4">Google Analytics</td>
                                        <td className="p-4">2 years</td>
                                        <td className="p-4">Analytics</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">4. Managing Cookies</h2>
                        <p className="text-muted-foreground mb-4">
                            You can control cookies through your browser settings. Most browsers allow you to:
                        </p>
                        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                            <li>View what cookies are stored on your device</li>
                            <li>Delete all or specific cookies</li>
                            <li>Block cookies from being set</li>
                            <li>Set preferences for specific websites</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                            Note that blocking essential cookies may prevent you from using the platform.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">5. Third-Party Cookies</h2>
                        <p className="text-muted-foreground">
                            Some cookies are set by third-party services that appear on our pages. We do not have
                            control over these cookies. Please refer to the respective third-party privacy policies
                            for more information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">6. Updates to This Policy</h2>
                        <p className="text-muted-foreground">
                            We may update this Cookie Policy periodically to reflect changes in our practices or
                            for legal reasons. We encourage you to review this page regularly.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">7. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have questions about our use of cookies, please contact us at privacy@example.com.
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
                        <Link to="/legal/acceptable-use" className="hover:text-foreground transition-colors">Acceptable Use</Link>
                    </div>
                    <p>© {new Date().getFullYear()} WhatsApp Bot Builder. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
