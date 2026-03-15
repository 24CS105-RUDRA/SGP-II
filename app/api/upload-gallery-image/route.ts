import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

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
    const filename = `gallery/${Date.now()}-${file.name}`

    console.log('[v0] Upload API: Uploading to Blob storage as:', filename)

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    })

    console.log('[v0] Upload API: Upload successful, URL:', blob.url)
    return NextResponse.json({ url: blob.url })
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
