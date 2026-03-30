'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getOptimizedImageUrl, getBlurPlaceholder, getThumbnailUrl } from '@/lib/cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  showBlurPlaceholder?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
  showBlurPlaceholder = false,
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const isCloudinary = src?.includes('res.cloudinary.com') || src?.includes('cloudinary.com');
  
  const optimizedSrc = isCloudinary ? getOptimizedImageUrl(src) : src;
  const placeholderSrc = isCloudinary ? getBlurPlaceholder(src) : '/placeholder.jpg';

  if (error) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {showBlurPlaceholder && isLoading && (
        <Image
          src={placeholderSrc}
          alt=""
          fill
          className={`transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0'}`}
          objectFit="blur"
          aria-hidden="true"
        />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit }}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}

interface GalleryImageProps {
  publicId: string;
  alt: string;
  className?: string;
}

export function GalleryImage({ publicId, alt, className }: GalleryImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={getOptimizedImageUrl(publicId, { width: 1200 })}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`transition-transform duration-300 hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ objectFit: 'cover' }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

interface AvatarImageProps {
  publicId?: string;
  fallback?: string;
  className?: string;
}

export function AvatarImage({ publicId, fallback, className }: AvatarImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const src = publicId 
    ? getThumbnailUrl(publicId, { width: 100, height: 100, crop: 'fill', gravity: 'face' })
    : fallback || '/placeholder-user.jpg';

  return (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
      <Image
        src={src}
        alt="Avatar"
        width={40}
        height={40}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
