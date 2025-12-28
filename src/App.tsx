import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bots from "./pages/Bots";
import BotBuilder from "./pages/BotBuilder";
import Messages from "./pages/Messages";
import Templates from "./pages/Templates";
import Contacts from "./pages/Contacts";
import PhoneNumbers from "./pages/PhoneNumbers";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import AiAgents from "./pages/AiAgents";
import Billing from "./pages/Billing";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoles from "./pages/AdminRoles";
import AdminReports from "./pages/AdminReports";
import AdminActivityLogs from "./pages/AdminActivityLogs";
import AdminAuditReports from "./pages/AdminAuditReports";
import Suspended from "./pages/Suspended";
import AcceptInvite from "./pages/AcceptInvite";
import TeamDashboard from "./pages/TeamDashboard";
import TeamActivityLogs from "./pages/TeamActivityLogs";
import NotFound from "./pages/NotFound";

// New Pages - Legal
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsOfService from "./pages/legal/TermsOfService";
import AcceptableUse from "./pages/legal/AcceptableUse";
import CookiePolicy from "./pages/legal/CookiePolicy";
import ForgotPassword from "./pages/ForgotPassword";

// New Pages - AI & Knowledge
import KnowledgeBase from "./pages/KnowledgeBase";

// New Pages - CRM
import Segments from "./pages/Segments";
import Campaigns from "./pages/Campaigns";

// New Pages - Team
import CannedResponses from "./pages/CannedResponses";
import RoutingRules from "./pages/RoutingRules";

// New Pages - Developer
import ApiKeys from "./pages/developer/ApiKeys";
import ApiDocs from "./pages/developer/ApiDocs";

// New Pages - Security & Privacy
import GDPRTools from "./pages/GDPRTools";

// New Pages - White Label
import Branding from "./pages/settings/Branding";
import AgencyClients from "./pages/AgencyClients";
import Channels from "./pages/settings/Channels";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/register" element={<Navigate to="/auth" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/phone-numbers"
                element={
                  <ProtectedRoute>
                    <PhoneNumbers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bots"
                element={
                  <ProtectedRoute>
                    <Bots />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bots/builder"
                element={
                  <ProtectedRoute>
                    <BotBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute>
                    <Templates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-agents"
                element={
                  <ProtectedRoute>
                    <AiAgents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing"
                element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <ProtectedRoute>
                    <AdminRoles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute>
                    <AdminReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/activity-logs"
                element={
                  <ProtectedRoute>
                    <AdminActivityLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit-reports"
                element={
                  <ProtectedRoute>
                    <AdminAuditReports />
                  </ProtectedRoute>
                }
              />
              <Route path="/suspended" element={<Suspended />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <TeamDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team/activity"
                element={
                  <ProtectedRoute>
                    <TeamActivityLogs />
                  </ProtectedRoute>
                }
              />

              {/* Legal Pages - Public */}
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/acceptable-use" element={<AcceptableUse />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Knowledge Base */}
              <Route
                path="/knowledge-base"
                element={
                  <ProtectedRoute>
                    <KnowledgeBase />
                  </ProtectedRoute>
                }
              />

              {/* CRM - Segments */}
              <Route
                path="/segments"
                element={
                  <ProtectedRoute>
                    <Segments />
                  </ProtectedRoute>
                }
              />

              {/* CRM - Campaigns */}
              <Route
                path="/campaigns"
                element={
                  <ProtectedRoute>
                    <Campaigns />
                  </ProtectedRoute>
                }
              />

              {/* Team - Canned Responses */}
              <Route
                path="/canned-responses"
                element={
                  <ProtectedRoute>
                    <CannedResponses />
                  </ProtectedRoute>
                }
              />

              {/* Developer Tools */}
              <Route
                path="/developer"
                element={
                  <ProtectedRoute>
                    <ApiKeys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/api-keys"
                element={
                  <ProtectedRoute>
                    <ApiKeys />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/developer/api-docs"
                element={
                  <ProtectedRoute>
                    <ApiDocs />
                  </ProtectedRoute>
                }
              />

              {/* Team - Routing Rules */}
              <Route
                path="/routing-rules"
                element={
                  <ProtectedRoute>
                    <RoutingRules />
                  </ProtectedRoute>
                }
              />

              {/* Security & Privacy */}
              <Route
                path="/gdpr-tools"
                element={
                  <ProtectedRoute>
                    <GDPRTools />
                  </ProtectedRoute>
                }
              />

              {/* White Label */}
              <Route
                path="/settings/branding"
                element={
                  <ProtectedRoute>
                    <Branding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings/channels"
                element={
                  <ProtectedRoute>
                    <Channels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agency-clients"
                element={
                  <ProtectedRoute>
                    <AgencyClients />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
