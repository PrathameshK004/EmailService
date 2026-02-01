import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

/**
 * Admin endpoint to set up TTL (Time To Live) indexes for MongoDB collections
 * This automatically deletes old documents after a specified time period.
 * 
 * Protected by ADMIN_SECRET_KEY environment variable
 * 
 * Usage:
 * POST /api/admin/setup-ttl
 * Headers: { "x-admin-key": "your-admin-secret-key" }
 */

export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get("x-admin-key")
    const secretKey = process.env.ADMIN_SECRET_KEY

    if (!secretKey || !adminKey || adminKey !== secretKey) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid or missing admin key." },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()

    // Create TTL index for email_logs (5 days = 432000 seconds)
    const emailLogsCollection = db.collection("email_logs")
    await emailLogsCollection.createIndex(
      { sentAt: 1 },
      { expireAfterSeconds: 432000 } // 5 days
    )

    // Create TTL index for otp_attempts (15 minutes = 900 seconds)
    const otpCollection = db.collection("otp_attempts")
    await otpCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900 } // 15 minutes
    )

    return NextResponse.json({
      message: "TTL indexes created successfully",
      indexes: [
        { collection: "email_logs", field: "sentAt", expiresAfter: "5 days (432000 seconds)" },
        { collection: "otp_attempts", field: "createdAt", expiresAfter: "15 minutes (900 seconds)" },
      ],
    })
  } catch (error) {
    console.error("Error setting up TTL indexes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to set up TTL indexes" },
      { status: 500 }
    )
  }
}
