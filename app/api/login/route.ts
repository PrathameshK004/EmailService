import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before logging in. Check your inbox for the OTP.",
          isEmailVerified: false,
          email: user.email,
        },
        { status: 403 },
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
