import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Admins, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [],
  endpoints: [
    {
      path: '/predict',
      method: 'post',
      handler: async (req) => {
        try {
          // Check if formData method is available
          if (!req.formData) {
            return Response.json({ error: 'Invalid request format' }, { status: 400 })
          }

          // Get the raw form data from the request
          const formData = await req.formData()

          // Forward to external API
          const response = await fetch('https://bp4mcfb41472sh.api.runpod.ai', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': 'Bearer rpa_IP0A4LS7YS0PC9LZ5ZECCI7QXETX2XVTMPPVUD1Jv5gw2a',
            },
          })

          // Check content type and return appropriately
          const contentType = response.headers.get('content-type') || ''

          if (contentType.includes('application/json')) {
            const data = await response.json()
            return Response.json(data, { status: response.status })
          }

          // For binary responses (images/videos)
          const blob = await response.blob()
          return new Response(blob, {
            status: response.status,
            headers: { 'Content-Type': contentType },
          })
        } catch (error) {
          console.error('Predict API error:', error)
          return Response.json({ error: 'Failed to process prediction' }, { status: 500 })
        }
      },
    },
  ],
})
