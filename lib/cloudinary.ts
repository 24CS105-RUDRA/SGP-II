import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export type UploadResult = {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

export type ResourceType = 'image' | 'video' | 'raw' | 'auto'

export async function uploadFile(
  file: File | Buffer,
  options: {
    folder?: string
    resourceType?: ResourceType
    allowedFormats?: string[]
    maxFileSize?: number
  } = {}
): Promise<UploadResult> {
  try {
    const { folder = 'school', resourceType = 'auto', allowedFormats, maxFileSize } = options

    if (maxFileSize && file instanceof File && file.size > maxFileSize) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
      }
    }

    if (allowedFormats && file instanceof File) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedFormats.includes(extension)) {
        return {
          success: false,
          error: `File format not allowed. Allowed formats: ${allowedFormats.join(', ')}`,
        }
      }
    }

    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file
    const buffer = Buffer.from(arrayBuffer instanceof ArrayBuffer ? new Uint8Array(arrayBuffer) : arrayBuffer)

    return new Promise((resolve) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            resolve({
              success: false,
              error: error?.message || 'Upload failed',
            })
            return
          }

          resolve({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          })
        }
      )

      uploadStream.end(buffer)
    })
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function uploadImage(
  file: File | Buffer,
  folder: string = 'school/images'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 10 * 1024 * 1024,
  })
}

export async function uploadDocument(
  file: File | Buffer,
  folder: string = 'school/documents'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'raw',
    allowedFormats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
    maxFileSize: 50 * 1024 * 1024,
  })
}

export async function deleteFile(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    if (result.result === 'ok') {
      return { success: true }
    }
    return { success: false, error: 'Failed to delete file' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

export { cloudinary }
