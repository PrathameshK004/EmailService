"use client"

import { Spinner } from "@/components/ui/spinner"

import React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Server, Lock, User, CheckCircle, Loader2 } from "lucide-react"

function SmtpSettingsContent() {
  const { token } = useAuth()
  const [host, setHost] = useState("")
  const [port, setPort] = useState("465")
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [secure, setSecure] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const response = await fetch("/api/smtp", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (data.credentials) {
          setHost(data.credentials.host || "")
          setPort(data.credentials.port?.toString() || "465")
          setUser(data.credentials.user || "")
          setSecure(data.credentials.secure ?? true)
        }
      } catch {
        console.error("Failed to fetch SMTP credentials")
      } finally {
        setIsFetching(false)
      }
    }

    if (token) {
      fetchCredentials()
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ host, port, user, pass, secure }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save SMTP settings")
      }

      setSuccess("SMTP settings saved successfully!")
      setPass("") // Clear password field after save
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          SMTP Configuration
        </CardTitle>
        <CardDescription>
          Configure your SMTP server credentials to send emails. Your credentials are encrypted and stored securely.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="host">SMTP Host</Label>
              <Input
                id="host"
                type="text"
                placeholder="smtp.gmail.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="465"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">SMTP Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="user"
                type="text"
                placeholder="your-email@gmail.com"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pass">SMTP Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pass"
                type="password"
                placeholder={user ? "Enter new password to update" : "Your SMTP password or app password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="pl-10"
                required={!user}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              For Gmail, use an App Password instead of your regular password
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="secure">Use SSL/TLS</Label>
              <p className="text-sm text-muted-foreground">
                Enable for port 465, disable for port 587 with STARTTLS
              </p>
            </div>
            <Switch
              id="secure"
              checked={secure}
              onCheckedChange={setSecure}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Saving..." : "Save SMTP Settings"}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}

export default function SmtpSettingsPage() {
  return (
    <ProtectedRoute>
      <SmtpSettingsContent />
    </ProtectedRoute>
  )
}
