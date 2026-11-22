import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  objectFit?: 'cover' | 'contain';
  objectPosition?: 'center' | 'top' | 'bottom';
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

export function SafeImage({
  src,
  alt,
  className = '',
  aspectClass = '',
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  fetchPriority = 'auto',
  width = 1200,
  height = 900,
}: SafeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';
  const posClass =
    objectPosition === 'top'
      ? 'object-top'
      : objectPosition === 'bottom'
      ? 'object-bottom'
      : 'object-center';

  if (failed || !src) {
    return (
      <div
        className={`w-full h-full ${aspectClass} bg-gradient-to-br from-[#20252B] via-[#2A3038] to-[#181C21] flex flex-col items-center justify-center p-6 text-center`}
        role="img"
        aria-label={alt}
      >
        <div className="w-11 h-11 rounded-md bg-[#20252B]/80 border border-[#F28C28]/40 flex items-center justify-center mb-3">
          <Wrench className="w-5 h-5 text-[#F28C28]" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-medium text-[#AEB5BD] max-w-[24ch] line-clamp-2">
          {alt || 'WADIE INDUSTRIELLE'}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#20252B] ${aspectClass}`}>
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#20252B] via-[#2C333C] to-[#20252B] animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`w-full h-full ${fitClass} ${posClass} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
}
