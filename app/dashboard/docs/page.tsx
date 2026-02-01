"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, Code, Terminal, Zap } from "lucide-react"

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"

  const codeExamples = {
    curl: `curl -X POST ${baseUrl}/api/send-email \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ms_your_api_key_here" \\
  -d '{
    "from": "sender@yourdomain.com",
    "to": "recipient@example.com",
    "subject": "Hello from MailSend",
    "text": "This is a test email sent via the API."
  }'`,

    javascript: `// Using fetch with API Key
const API_KEY = "ms_your_api_key_here";  // Get from dashboard
const BASE_URL = "${baseUrl}";

const response = await fetch(\`\${BASE_URL}/api/send-email\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${API_KEY}\`
  },
  body: JSON.stringify({
    from: "sender@yourdomain.com",
    to: "recipient@example.com",
    subject: "Hello from MailSend",
    html: "<h1>Welcome!</h1><p>This is an HTML email.</p>",
  })
});

const result = await response.json();
console.log(result);`,

    node: `// Node.js with axios
const axios = require("axios");

const API_KEY = "ms_your_api_key_here";  // Get from dashboard
const BASE_URL = "${baseUrl}";

async function sendEmail() {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/api/send-email\`,
      {
        from: "sender@yourdomain.com",
        to: "recipient@example.com",
        subject: "Hello from MailSend",
        text: "This is a test email."
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${API_KEY}\`
        }
      }
    );
    
    console.log("Email sent:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data);
  }
}

sendEmail();`,

    python: `import requests

API_KEY = "ms_your_api_key_here"  # Get from dashboard
BASE_URL = "${baseUrl}"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

payload = {
    "from": "sender@yourdomain.com",
    "to": "recipient@example.com",
    "subject": "Hello from MailSend",
    "html": "<h1>Welcome!</h1><p>This is an HTML email.</p>",
}

response = requests.post(f"{BASE_URL}/api/send-email", json=payload, headers=headers)
print(response.json())`,

    php: `<?php
$api_key = "ms_your_api_key_here";  // Get from dashboard
$base_url = "${baseUrl}";

$data = [
    "from" => "sender@yourdomain.com",
    "to" => "recipient@example.com",
    "subject" => "Hello from MailSend",
    "html" => "<h1>Welcome!</h1><p>This is an HTML email.</p>"
];

$options = [
    "http" => [
        "header" => "Content-Type: application/json\\r\\n" .
                    "Authorization: Bearer " . $api_key . "\\r\\n",
        "method" => "POST",
        "content" => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($base_url . "/api/send-email", false, $context);

echo $result;
?>`,

    login: `// Step 1: Login to get JWT token
const loginResponse = await fetch("${baseUrl}/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: "your@email.com",
    password: "your_password"
  })
});

const { token } = await loginResponse.json();

// Step 2: Use token in subsequent requests
const emailResponse = await fetch("${baseUrl}/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`
  },
  body: JSON.stringify({
    to: "recipient@example.com",
    subject: "Test Email",
    body: "Hello World!"
  })
});`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Integrate MailSend into your external projects using our REST API
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with MailSend API in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h3 className="mt-3 font-semibold">Create Account & SMTP</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sign up for an account and configure your SMTP credentials in the dashboard.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h3 className="mt-3 font-semibold">Create API Key</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate an API key from the dashboard for external integrations.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <h3 className="mt-3 font-semibold">Send Emails</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the send-email endpoint with your API key to send emails.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            Two ways to authenticate with the MailSend API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Auth - Recommended */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Option 1: API Key (Recommended)</h3>
              <Badge variant="default">Recommended</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              API keys are the recommended way to authenticate external applications. Create one from the{" "}
              <a href="/dashboard/api-keys" className="text-primary hover:underline">API Keys</a> page.
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`// Include your API key in the Authorization header
const response = await fetch("${baseUrl}/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ms_your_api_key_here"  // API key starts with "ms_"
  },
  body: JSON.stringify({
    to: "recipient@example.com",
    subject: "Hello from MailSend",
    text: "This is a test email."
  })
});`}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(`const response = await fetch("${baseUrl}/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ms_your_api_key_here"
  },
  body: JSON.stringify({
    to: "recipient@example.com",
    subject: "Hello from MailSend",
    text: "This is a test email."
  })
});`, "apikey")}
              >
                {copiedCode === "apikey" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* JWT Auth */}
          <div>
            <h3 className="font-semibold mb-2">Option 2: JWT Token</h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can also use JWT tokens by logging in via the API. Tokens expire after 7 days.
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{codeExamples.login}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(codeExamples.login, "login")}
              >
                {copiedCode === "login" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-green-500/10 border-green-500/20 p-4">
            <p className="text-sm">
              <strong>Tip:</strong> Use API keys for server-to-server integrations. They never expire and are easier to manage.
              API keys start with <code className="mx-1 bg-muted px-1 rounded">ms_</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Complete list of available API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Signup */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/signup</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Create a new user account</p>
              <div className="text-sm">
                <strong>Request Body:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "name": "string",
  "email": "string", 
  "password": "string (min 6 chars)"
}`}</pre>
              </div>
            </div>

            {/* Login */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/login</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Authenticate and receive JWT token</p>
              <div className="text-sm">
                <strong>Request Body:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "email": "string",
  "password": "string"
}`}</pre>
                <strong className="block mt-2">Response:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "...", "name": "..." }
}`}</pre>
              </div>
            </div>

            {/* SMTP */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">GET</Badge>
                <Badge variant="default">POST</Badge>
                <Badge variant="outline">PUT</Badge>
                <Badge variant="destructive">DELETE</Badge>
                <code className="text-sm font-mono">/api/smtp</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Manage SMTP configurations (requires auth)</p>
              <div className="text-sm">
                <strong>POST Request Body:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "name": "string",
  "host": "smtp.example.com",
  "port": 587,
  "secure": false,
  "username": "string",
  "password": "string",
  "fromEmail": "noreply@example.com",
  "fromName": "My App",
  "isDefault": true
}`}</pre>
              </div>
            </div>

            {/* Send Email */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/api/send-email</code>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Send an email using configured SMTP (requires auth)</p>
              <div className="text-sm">
                <strong>Request Body:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "to": "recipient@example.com",    // required
  "subject": "Email Subject",        // required
  "body": "Email content",           // required
  "isHtml": false,                   // optional, default: false
  "cc": "cc@example.com",            // optional
  "bcc": "bcc@example.com",          // optional
  "smtpConfigId": "..."              // optional, uses default if not specified
}`}</pre>
                <strong className="block mt-2">Success Response:</strong>
                <pre className="bg-muted p-2 rounded mt-1 text-xs">{`{
  "message": "Email sent successfully",
  "messageId": "<abc123@smtp.example.com>"
}`}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Copy-paste examples for different programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>

            <TabsContent value="curl" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.curl}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.curl, "curl")}
                >
                  {copiedCode === "curl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="javascript" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.javascript}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.javascript, "javascript")}
                >
                  {copiedCode === "javascript" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="node" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.node}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.node, "node")}
                >
                  {copiedCode === "node" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="python" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.python}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.python, "python")}
                >
                  {copiedCode === "python" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="php" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{codeExamples.php}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(codeExamples.php, "php")}
                >
                  {copiedCode === "php" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Error Codes</CardTitle>
          <CardDescription>Common error responses and their meanings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Error</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="destructive">400</Badge></td>
                  <td className="py-3 px-4">Bad Request</td>
                  <td className="py-3 px-4 text-muted-foreground">Missing or invalid request parameters</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="destructive">401</Badge></td>
                  <td className="py-3 px-4">Unauthorized</td>
                  <td className="py-3 px-4 text-muted-foreground">Missing or invalid JWT token</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="destructive">404</Badge></td>
                  <td className="py-3 px-4">Not Found</td>
                  <td className="py-3 px-4 text-muted-foreground">Resource not found (e.g., SMTP config)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><Badge variant="destructive">409</Badge></td>
                  <td className="py-3 px-4">Conflict</td>
                  <td className="py-3 px-4 text-muted-foreground">Resource already exists (e.g., email taken)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><Badge variant="destructive">500</Badge></td>
                  <td className="py-3 px-4">Server Error</td>
                  <td className="py-3 px-4 text-muted-foreground">Internal server error or SMTP failure</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
