import { useCallback, useRef, useState } from 'react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
}

const ZOOM_FACTOR = 2.5;
const LENS_SIZE = 120;

interface LensPosition {
  x: number;
  y: number;
}

export default function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<LensPosition | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (window.matchMedia('(hover: hover)').matches) {
      setPosition({ x: 50, y: 50 });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition(null);
  }, []);

  const lensStyle = position
    ? {
        top: `calc(${position.y}% - ${LENS_SIZE / 2}px)`,
        left: `calc(${position.x}% - ${LENS_SIZE / 2}px)`,
        backgroundImage: `url(${src})`,
        backgroundSize: `${ZOOM_FACTOR * 100}%`,
        backgroundPosition: `${position.x}% ${position.y}%`,
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100"
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      {position && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-10 rounded-full border-2 border-neutral-200 bg-neutral-0 bg-no-repeat shadow-lg"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            ...lensStyle,
          }}
        />
      )}
    </div>
  );
}