import { MongoClient, Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

interface MongoClientCache {
  client: MongoClient | null
  db: Db | null
  promise: Promise<MongoClient> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: MongoClientCache | undefined
}

const cached: MongoClientCache = global._mongoClientPromise || {
  client: null,
  db: null,
  promise: null,
}

if (!global._mongoClientPromise) {
  global._mongoClientPromise = cached
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cached.client && cached.db) {
    return { client: cached.client, db: cached.db }
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI)
  }

  cached.client = await cached.promise
  cached.db = cached.client.db()

  return { client: cached.client, db: cached.db }
}
