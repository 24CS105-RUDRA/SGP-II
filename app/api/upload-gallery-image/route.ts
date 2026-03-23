import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Upload API: Starting image upload to Cloudinary')
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

    const result = await uploadImage(file, 'school/gallery')

    if (!result.success) {
      console.error('[v0] Upload API: Upload failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to upload image' },
        { status: 500 }
      )
    }

    console.log('[v0] Upload API: Upload successful, URL:', result.url)
    return NextResponse.json({ 
      url: result.url, 
      publicId: result.publicId,
      storage: 'cloudinary' 
    })
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
