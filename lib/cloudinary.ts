import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse, TransformationOptions } from 'cloudinary'

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

export interface ImageTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west'
  effect?: string
  blur?: number
  grayscale?: boolean
}

const DEFAULT_THUMBNAIL: ImageTransformOptions = {
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
  gravity: 'auto',
}

const DEFAULT_OPTIMIZED: ImageTransformOptions = {
  quality: 'auto',
  format: 'auto',
}

export function getOptimizedImageUrl(publicId: string, options: ImageTransformOptions = {}): string {
  const transformOptions: TransformationOptions = {
    ...DEFAULT_OPTIMIZED,
    ...options,
    fetch_format: 'auto',
    quality: 'auto',
  }
  
  return cloudinary.url(publicId, transformOptions)
}

export function getThumbnailUrl(publicId: string, options: ImageTransformOptions = {}): string {
  const transformOptions: TransformationOptions = {
    ...DEFAULT_THUMBNAIL,
    ...options,
    fetch_format: 'auto',
    quality: 'auto',
  }
  
  return cloudinary.url(publicId, transformOptions)
}

export function getResponsiveImageUrl(
  publicId: string,
  widths: number[] = [400, 800, 1200, 1600]
): string[] {
  return widths.map(width => 
    cloudinary.url(publicId, {
      width,
      crop: 'scale',
      quality: 'auto',
      fetch_format: 'auto',
    })
  )
}

export function getBlurPlaceholder(publicId: string): string {
  return cloudinary.url(publicId, {
    width: 30,
    quality: 'auto:low',
    fetch_format: 'auto',
    effect: 'blur:1000',
  })
}

export function getGalleryImageUrl(publicId: string, width: number = 800): string {
  return cloudinary.url(publicId, {
    width,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
    gravity: 'auto',
  })
}

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
