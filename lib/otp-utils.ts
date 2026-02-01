/**
 * OTP Utilities for Email Verification and Password Reset
 */

/**
 * Generate a 4-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

/**
 * Validate OTP format (must be 4 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{4}$/.test(otp)
}

/**
 * Check if OTP has expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

/**
 * Calculate remaining time for OTP in seconds
 */
export function getRemainingOTPTime(expiresAt: Date): number {
  const remaining = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))
  return remaining
}

/**
 * Get OTP expiration time (default: 10 minutes from now)
 */
export function getOTPExpirationTime(minutesFromNow: number = 10): Date {
  return new Date(Date.now() + minutesFromNow * 60 * 1000)
}

/**
 * OTP type validation
 */
export const OTP_TYPES = {
  SIGNUP: "signup",
  FORGOT_PASSWORD: "forgot-password",
} as const

export type OTPType = typeof OTP_TYPES[keyof typeof OTP_TYPES]

export function isValidOTPType(type: string): type is OTPType {
  return Object.values(OTP_TYPES).includes(type as OTPType)
}

/**
 * OTP configuration
 */
export const OTP_CONFIG = {
  LENGTH: 4,
  VALIDITY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_SECONDS: 60,
} as const

/**
 * Email template for OTP
 */
export function getOTPEmailTemplate(
  otp: string,
  type: OTPType,
  email: string
): { subject: string; html: string } {
  const subject =
    type === "forgot-password" ? "Reset Your Password" : "Verify Your Email"

  const htmlContent =
    type === "forgot-password"
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for ${OTP_CONFIG.VALIDITY_MINUTES} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Thank you for signing up! Use the OTP below to verify your email:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for ${OTP_CONFIG.VALIDITY_MINUTES} minutes.</p>
      </div>
    `

  return { subject, html: htmlContent }
}

/**
 * Error messages for OTP operations
 */
export const OTP_ERROR_MESSAGES = {
  MISSING_EMAIL: "Email is required",
  MISSING_OTP: "OTP is required",
  MISSING_TYPE: "OTP type is required",
  INVALID_TYPE: "Invalid OTP type",
  INVALID_FORMAT: "Invalid OTP format (must be 4 digits)",
  NOT_FOUND: "OTP not found or expired",
  EXPIRED: "OTP has expired",
  INVALID: "Invalid OTP",
  MAX_ATTEMPTS: "Too many failed attempts. Please request a new OTP.",
  USER_NOT_FOUND: "No account found with this email",
  SERVICE_NOT_CONFIGURED: "Email service not configured",
} as const

/**
 * Success messages for OTP operations
 */
export const OTP_SUCCESS_MESSAGES = {
  SENT: "OTP sent successfully",
  VERIFIED: "OTP verified successfully",
  PASSWORD_RESET: "Password reset successfully",
} as const
