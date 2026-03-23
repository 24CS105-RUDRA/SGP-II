import { type NextRequest, NextResponse } from 'next/server'
import { uploadDocument } from '@/lib/cloudinary'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Upload API: Starting material upload to Cloudinary')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const standard = formData.get('standard') as string | null
    const division = formData.get('division') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Upload API: File received:', file.name, 'Size:', file.size, 'Type:', file.type)

    const folder = standard && division 
      ? `school/materials/${standard}-${division}` 
      : 'school/materials'

    const result = await uploadDocument(file, folder)

    if (!result.success) {
      console.error('[v0] Upload API: Upload failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to upload file' },
        { status: 500 }
      )
    }

    console.log('[v0] Upload API: Upload successful, URL:', result.url)
    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      filename: file.name,
      size: file.size,
      type: file.type,
      storage: 'cloudinary',
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
    return NextResponse.json({ error: `Upload failed: ${errorMessage}` }, { status: 500 })
  }
}
