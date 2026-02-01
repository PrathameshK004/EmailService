import { NextRequest, NextResponse } from "next/server"
import { verifyToken, getTokenFromHeader, UserPayload } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import crypto from "crypto"

export type AuthenticatedRequest = NextRequest & {
  user: UserPayload
}

function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex")
}

async function verifyApiKey(apiKey: string): Promise<UserPayload | null> {
  try {
    const { db } = await connectToDatabase()
    const apiKeysCollection = db.collection("api_keys")
    const usersCollection = db.collection("users")

    const keyHash = hashApiKey(apiKey)
    const apiKeyDoc = await apiKeysCollection.findOne({ keyHash })

    if (!apiKeyDoc) {
      return null
    }

    // Update last used timestamp
    await apiKeysCollection.updateOne(
      { keyHash },
      { $set: { lastUsedAt: new Date() } }
    )

    // Get user details
    const user = await usersCollection.findOne({ _id: apiKeyDoc.userId })
    if (!user) {
      return null
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    }
  } catch (error) {
    console.error("API key verification error:", error)
    return null
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization")
  
  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization required" },
      { status: 401 }
    )
  }

  let payload: UserPayload | null = null

  // Check if it's an API key (starts with "ms_")
  if (authHeader.startsWith("Bearer ms_")) {
    const apiKey = authHeader.replace("Bearer ", "")
    payload = await verifyApiKey(apiKey)
  } else {
    // Try JWT token
    const token = getTokenFromHeader(authHeader)
    if (token) {
      payload = await verifyToken(token)
    }
  }

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired credentials" },
      { status: 401 }
    )
  }

  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = payload

  return handler(authenticatedRequest)
}
