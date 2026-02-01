"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Key, Plus, Trash2, Copy, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  _id: string
  name: string
  keyPreview: string
  createdAt: string
  lastUsedAt: string | null
}

interface NewApiKey {
  name: string
  key: string
  keyPreview: string
  createdAt: string
}

function ApiKeysContent() {
  const { token } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<NewApiKey | null>(null)
  const [showNewKey, setShowNewKey] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const fetchApiKeys = useCallback(async () => {
    try {
      const response = await fetch("/api/api-keys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchApiKeys()
    }
  }, [token, fetchApiKeys])

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      const data = await response.json()
      if (response.ok) {
        setNewlyCreatedKey(data.apiKey)
        setShowNewKey(true)
        setNewKeyName("")
        fetchApiKeys()
        toast.success("API key created successfully")
      } else {
        toast.error(data.error || "Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
      toast.error("Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (keyPreview: string) => {
    try {
      const response = await fetch(`/api/api-keys?keyPreview=${encodeURIComponent(keyPreview)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.keyPreview !== keyPreview))
        toast.success("API key deleted successfully")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(true)
      toast.success("API key copied to clipboard")
      setTimeout(() => setCopiedKey(false), 2000)
    } catch {
      toast.error("Failed to copy to clipboard")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-1 text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name to help you identify it later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production Server, My App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {newlyCreatedKey && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="space-y-3">
            <p className="font-medium text-green-800 dark:text-green-200">
              API Key Created Successfully!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              Make sure to copy your API key now. You won&apos;t be able to see it again!
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-green-100 dark:bg-green-900 px-3 py-2 font-mono text-sm">
                {showNewKey ? newlyCreatedKey.key : "•".repeat(48)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNewKey(!showNewKey)}
              >
                {showNewKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(newlyCreatedKey.key)}
              >
                {copiedKey ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewlyCreatedKey(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
          <CardDescription>
            Use these keys to authenticate API requests from external applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No API keys yet</p>
              <p className="text-sm text-muted-foreground">
                Create an API key to start integrating with external applications
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey._id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {apiKey.keyPreview}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(apiKey.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(apiKey.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteKey(apiKey.keyPreview)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Use API Keys
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Include your API key in the Authorization header of your HTTP requests:
          </p>
          <pre className="rounded-lg bg-muted p-4 overflow-x-auto">
            <code className="text-sm">
{`curl -X POST https://email-service-delta-seven.vercel.app/api/send-email \\
  -H "Authorization: Bearer ms_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "sender@example.com",
    "to": "recipient@example.com",
    "subject": "Hello from API",
    "text": "This email was sent via API key!"
  }'`}
            </code>
          </pre>
          <p className="text-sm text-muted-foreground">
            See the <a href="/dashboard/docs" className="text-primary hover:underline">API Documentation</a> for more details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ApiKeysPage() {
  return (
    <ProtectedRoute>
      <ApiKeysContent />
    </ProtectedRoute>
  )
}
