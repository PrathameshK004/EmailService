import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()

    if (!email || !otp || !type) {
      return NextResponse.json(
        { error: "Email, OTP, and type are required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    const otpCollection = db.collection("otp_attempts")

    // Find OTP record
    const otpRecord = await otpCollection.findOne({
      email: email.toLowerCase(),
      type,
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired" },
        { status: 404 }
      )
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await otpCollection.deleteOne({
        email: email.toLowerCase(),
        type,
      })
      return NextResponse.json(
        { error: "OTP has expired" },
        { status: 400 }
      )
    }

    // Check max attempts (3 attempts)
    if (otpRecord.attempts >= 3) {
      await otpCollection.deleteOne({
        email: email.toLowerCase(),
        type,
      })
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 429 }
      )
    }

    // Verify OTP
    if (otpRecord.otp !== otp.toString()) {
      // Increment attempts
      await otpCollection.updateOne(
        { email: email.toLowerCase(), type },
        { $inc: { attempts: 1 } }
      )
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      )
    }

    // OTP verified, delete the record
    await otpCollection.deleteOne({
      email: email.toLowerCase(),
      type,
    })

    return NextResponse.json({
      message: "OTP verified successfully",
      verified: true,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    )
  }
}
