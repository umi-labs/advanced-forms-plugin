import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import path from 'path'
import type { BlocksField } from 'payload'
import { buildConfig } from 'payload'
import { formPlugin, TravelDateBlock } from '@foundrykit/advanced-forms-plugin'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { testEmailAdapter } from './helpers/testEmailAdapter.js'
import { seed } from './seed.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.ROOT_DIR) {
  process.env.ROOT_DIR = dirname
}

const buildConfigWithMemoryDB = async () => {
  if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL) {
    const memoryDB = await MongoMemoryReplSet.create({
      replSet: { count: 1, dbName: 'payloadmemory' },
    })
    process.env.DATABASE_URL = `${memoryDB.getUri()}&retryWrites=true`
  }

  return buildConfig({
    admin: {
      importMap: {
        baseDir: path.resolve(dirname),
      },
    },
    collections: [
      {
        slug: 'media',
        fields: [],
        upload: {
          staticDir: path.resolve(dirname, 'media'),
        },
      },
    ],
    db: mongooseAdapter({
      ensureIndexes: true,
      url: process.env.DATABASE_URL || '',
    }),
    editor: lexicalEditor(),
    email: testEmailAdapter,
    onInit: async (payload) => {
      await seed(payload)
    },
    plugins: [
      formPlugin({ fields: { travelDate: { block: TravelDateBlock } } }),
      // Consumers hide staff-only fields (CRM mappings, recipients) behind field
      // access; the int tests check the public form-data endpoint honours it.
      (incoming) => {
        const forms = incoming.collections?.find((c) => c.slug === 'forms')
        const actions = forms?.fields.find(
          (f) => 'name' in f && f.name === 'submissionActions',
        ) as BlocksField | undefined
        if (actions) {
          actions.access = { read: ({ req }) => Boolean(req.user) }
        }
        return incoming
      },
    ],
    secret: process.env.PAYLOAD_SECRET || 'test-secret_key',
    sharp,
    typescript: {
      outputFile: path.resolve(dirname, 'payload-types.ts'),
    },
  })
}

export default buildConfigWithMemoryDB()
