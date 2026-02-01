import { MongoClient } from 'mongodb'

/**
 * This script sets up TTL (Time To Live) indexes for MongoDB collections
 * to automatically delete old documents after a specified time period.
 * 
 * TTL Indexes:
 * - email_logs: Auto-delete after 5 days (432000 seconds)
 * - otp_attempts: Auto-delete after 15 minutes (900 seconds)
 */

async function setupTTLIndexes() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  const client = new MongoClient(mongoUri)

  try {
    await client.connect()
    const db = client.db()

    console.log('Setting up TTL indexes...')

    // Create TTL index for email_logs (5 days = 432000 seconds)
    const emailLogsCollection = db.collection('email_logs')
    await emailLogsCollection.createIndex(
      { sentAt: 1 },
      { expireAfterSeconds: 432000 } // 5 days
    )
    console.log('✓ Created TTL index for email_logs (5 days)')

    // Create TTL index for otp_attempts (15 minutes = 900 seconds)
    const otpCollection = db.collection('otp_attempts')
    await otpCollection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 900 } // 15 minutes
    )
    console.log('✓ Created TTL index for otp_attempts (15 minutes)')

    console.log('TTL indexes setup completed successfully!')
  } catch (error) {
    console.error('Error setting up TTL indexes:', error)
    throw error
  } finally {
    await client.close()
  }
}

// Run the setup
setupTTLIndexes().catch(console.error)
