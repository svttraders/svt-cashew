'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  fallbackSrc = '/images/raw_cashews_hero.webp',
  alt,
  ...rest
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      {...rest}
      src={hasError || !imgSrc ? fallbackSrc : imgSrc}
      alt={alt || 'SVT Cashews'}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
