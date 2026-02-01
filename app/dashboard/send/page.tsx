"use client"

import { Spinner } from "@/components/ui/spinner"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Paperclip, X, CheckCircle, Mail, Loader2 } from "lucide-react"

interface Attachment {
  filename: string
  content: string
  contentType: string
  size: number
}

function SendEmailContent() {
  const { token } = useAuth()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [text, setText] = useState("")
  const [html, setHtml] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newAttachments: Attachment[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const reader = new FileReader()

      await new Promise<void>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1]
          newAttachments.push({
            filename: file.name,
            content: base64,
            contentType: file.type,
            size: file.size,
          })
          resolve()
        }
        reader.readAsDataURL(file)
      })
    }

    setAttachments([...attachments, ...newAttachments])
    e.target.value = ""
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          text: text || undefined,
          html: html || undefined,
          attachments: attachments.length > 0
            ? attachments.map(({ filename, content, contentType }) => ({
                filename,
                content,
                contentType,
              }))
            : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setSuccess(`Email sent successfully! Message ID: ${data.messageId}`)
      // Reset form
      setTo("")
      setSubject("")
      setText("")
      setHtml("")
      setAttachments([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Email
        </CardTitle>
        <CardDescription>
          Compose and send emails using your configured SMTP settings
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
              <Label htmlFor="from">From</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="from"
                  type="email"
                  placeholder="sender@example.com"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Message Content</Label>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Plain Text</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
              <TabsContent value="text" className="mt-2">
                <Textarea
                  placeholder="Write your message here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                />
              </TabsContent>
              <TabsContent value="html" className="mt-2">
                <Textarea
                  placeholder="<p>Your HTML content here...</p>"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="rounded-lg border border-dashed p-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <Paperclip className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click or drag files to attach
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="max-w-xs cursor-pointer"
                />
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-muted p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{file.filename}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </CardContent>
      </form>
    </Card>
  )
}

export default function SendEmailPage() {
  return (
    <ProtectedRoute>
      <SendEmailContent />
    </ProtectedRoute>
  )
}
