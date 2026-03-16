import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Upload API: Starting image upload')
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.error('[v0] Upload API: No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[v0] Upload API: File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    const buffer = await file.arrayBuffer()
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `gallery/${timestamp}-${safeName}`

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const relativePath = path.join('uploads', 'gallery', `${timestamp}-${safeName}`)
      const absolutePath = path.join(process.cwd(), 'public', relativePath)
      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, Buffer.from(buffer))

      const localUrl = `/${relativePath.replace(/\\/g, '/')}`
      console.log('[v0] Upload API: Stored locally at:', localUrl)
      return NextResponse.json({ url: localUrl, storage: 'local' })
    }

    console.log('[v0] Upload API: Uploading to Blob storage as:', filename)

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    })

    console.log('[v0] Upload API: Upload successful, URL:', blob.url)
    return NextResponse.json({ url: blob.url, storage: 'blob' })
  } catch (error) {
    console.error('[v0] Upload error details:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[v0] Upload error message:', errorMessage)
    return NextResponse.json(
      { error: `Failed to upload image: ${errorMessage}` },
      { status: 500 }
    )
  }
}
