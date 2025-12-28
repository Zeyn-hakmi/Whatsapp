import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Book,
    Code,
    Copy,
    Send,
    Check,
    ChevronRight,
    Search
} from "lucide-react";

interface ApiEndpoint {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    description: string;
    parameters?: Array<{
        name: string;
        type: string;
        required: boolean;
        description: string;
    }>;
    requestBody?: {
        type: string;
        example: string;
    };
    response?: {
        type: string;
        example: string;
    };
}

const API_ENDPOINTS: Record<string, ApiEndpoint[]> = {
    'Contacts': [
        {
            method: 'GET',
            path: '/api/v1/contacts',
            description: 'List all contacts',
            parameters: [
                { name: 'limit', type: 'number', required: false, description: 'Max results to return' },
                { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
                { name: 'search', type: 'string', required: false, description: 'Search by name or phone' },
            ],
            response: {
                type: 'ContactList',
                example: `{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone_number": "+1234567890",
      "tags": ["customer", "vip"],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}`
            }
        },
        {
            method: 'POST',
            path: '/api/v1/contacts',
            description: 'Create a new contact',
            requestBody: {
                type: 'CreateContact',
                example: `{
  "name": "John Doe",
  "phone_number": "+1234567890",
  "email": "john@example.com",
  "tags": ["customer"]
}`
            },
            response: {
                type: 'Contact',
                example: `{
  "id": "uuid",
  "name": "John Doe",
  "phone_number": "+1234567890",
  "created_at": "2024-01-01T00:00:00Z"
}`
            }
        },
    ],
    'Messages': [
        {
            method: 'POST',
            path: '/api/v1/messages',
            description: 'Send a message to a contact',
            requestBody: {
                type: 'SendMessage',
                example: `{
  "to": "+1234567890",
  "type": "text",
  "content": "Hello! How can I help you?",
  "template_id": "optional_template_id"
}`
            },
            response: {
                type: 'Message',
                example: `{
  "id": "uuid",
  "status": "sent",
  "created_at": "2024-01-01T00:00:00Z"
}`
            }
        },
        {
            method: 'GET',
            path: '/api/v1/messages/:id',
            description: 'Get message details',
            parameters: [
                { name: 'id', type: 'string', required: true, description: 'Message ID' },
            ],
        },
    ],
    'Conversations': [
        {
            method: 'GET',
            path: '/api/v1/conversations',
            description: 'List all conversations',
            parameters: [
                { name: 'status', type: 'string', required: false, description: 'Filter by status (open, closed)' },
                { name: 'assigned_to', type: 'string', required: false, description: 'Filter by assigned agent' },
            ],
        },
        {
            method: 'POST',
            path: '/api/v1/conversations/:id/assign',
            description: 'Assign conversation to an agent',
            requestBody: {
                type: 'AssignConversation',
                example: `{
  "agent_id": "agent_uuid"
}`
            },
        },
    ],
    'Webhooks': [
        {
            method: 'GET',
            path: '/api/v1/webhooks',
            description: 'List configured webhooks',
        },
        {
            method: 'POST',
            path: '/api/v1/webhooks',
            description: 'Create a new webhook',
            requestBody: {
                type: 'CreateWebhook',
                example: `{
  "url": "https://your-server.com/webhook",
  "events": ["message.received", "message.sent"],
  "secret": "your_webhook_secret"
}`
            },
        },
    ],
};

export default function ApiDocs() {
    const [selectedCategory, setSelectedCategory] = useState('Contacts');
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-green-500/10 text-green-400 border-green-500/30';
            case 'POST': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
            case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'PATCH': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
            case 'DELETE': return 'bg-red-500/10 text-red-400 border-red-500/30';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Book className="w-7 h-7 text-primary" />
                        API Documentation
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Complete reference for the WhatsApp Bot Builder API
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search endpoints..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Base URL */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Base URL</p>
                                <code className="text-lg font-mono text-primary">https://api.whatsappbot.pro/v1</code>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => copyCode('https://api.whatsappbot.pro/v1', 'base')}>
                                {copiedCode === 'base' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Authentication */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            All API requests must include your API key in the Authorization header:
                        </p>
                        <div className="bg-muted p-4 rounded-lg">
                            <code className="text-sm font-mono text-foreground">
                                Authorization: Bearer YOUR_API_KEY
                            </code>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can generate API keys in the <a href="/developer/api-keys" className="text-primary underline">Developer Settings</a>.
                        </p>
                    </CardContent>
                </Card>

                {/* Endpoints */}
                <div className="grid grid-cols-4 gap-6">
                    {/* Categories */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Resources
                        </h3>
                        {Object.keys(API_ENDPOINTS).map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground hover:bg-muted'
                                    }`}
                            >
                                {category}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ))}
                    </div>

                    {/* Endpoint Details */}
                    <div className="col-span-3 space-y-4">
                        <h2 className="text-xl font-bold text-foreground">{selectedCategory}</h2>

                        {API_ENDPOINTS[selectedCategory]?.map((endpoint, index) => (
                            <motion.div
                                key={`${endpoint.method}-${endpoint.path}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <Badge className={`font-mono font-bold ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </Badge>
                                            <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Parameters */}
                                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-foreground mb-2">Parameters</h4>
                                                <div className="border border-border rounded-lg overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-muted">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-medium">Name</th>
                                                                <th className="px-3 py-2 text-left font-medium">Type</th>
                                                                <th className="px-3 py-2 text-left font-medium">Required</th>
                                                                <th className="px-3 py-2 text-left font-medium">Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {endpoint.parameters.map(param => (
                                                                <tr key={param.name} className="border-t border-border">
                                                                    <td className="px-3 py-2 font-mono text-primary">{param.name}</td>
                                                                    <td className="px-3 py-2 text-muted-foreground">{param.type}</td>
                                                                    <td className="px-3 py-2">
                                                                        <Badge variant={param.required ? 'default' : 'outline'} className="text-xs">
                                                                            {param.required ? 'Yes' : 'No'}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-3 py-2 text-muted-foreground">{param.description}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Request Body */}
                                        {endpoint.requestBody && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">Request Body</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyCode(endpoint.requestBody!.example, `req-${endpoint.path}`)}
                                                    >
                                                        {copiedCode === `req-${endpoint.path}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                                    {endpoint.requestBody.example}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Response */}
                                        {endpoint.response && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-semibold text-foreground">Response</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyCode(endpoint.response!.example, `res-${endpoint.path}`)}
                                                    >
                                                        {copiedCode === `res-${endpoint.path}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono">
                                                    {endpoint.response.example}
                                                </pre>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
