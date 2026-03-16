import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Vercel Blob with a timestamped filename to avoid conflicts
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filename = `study-materials/${timestamp}-${safeName}`

    const buffer = await file.arrayBuffer()

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      const relativePath = path.join('uploads', 'study-materials', `${timestamp}-${safeName}`)
      const absolutePath = path.join(process.cwd(), 'public', relativePath)
      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, Buffer.from(buffer))

      return NextResponse.json({
        url: `/${relativePath.replace(/\\/g, '/')}`,
        filename: file.name,
        size: file.size,
        type: file.type,
        storage: 'local',
      })
    }

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
      storage: 'blob',
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 })
  }
}
