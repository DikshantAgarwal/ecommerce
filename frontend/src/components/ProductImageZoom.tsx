import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
}

const LENS_SIZE = 120;
const LENS_ZOOM = 2.5;
const MODAL_ZOOM = 3.5;

interface LensPosition {
  x: number;
  y: number;
}

function useLensMovement<T extends HTMLElement>(enabled: boolean, zoom: number) {
  const containerRef = useRef<T>(null);
  const [position, setPosition] = useState<LensPosition | null>(null);

  const handleEnter = useCallback(() => {
    if (window.matchMedia('(hover: hover)').matches) {
      setPosition({ x: 50, y: 50 });
    }
  }, []);

  const handleMove = useCallback((e: React.MouseEvent<T>) => {
    if (!enabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  }, [enabled]);

  const handleLeave = useCallback(() => {
    setPosition(null);
  }, []);

  return { containerRef, position, handleEnter, handleMove, handleLeave, zoom };
}

function ZoomBackground({
  src,
  position,
  zoom,
  lensSize,
}: {
  src: string;
  position: LensPosition;
  zoom: number;
  lensSize: number;
}) {
  const lensStyle = {
    top: `calc(${position.y}% - ${lensSize / 2}px)`,
    left: `calc(${position.x}% - ${lensSize / 2}px)`,
    backgroundImage: `url(${src})`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${position.x}% ${position.y}%`,
  };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full border-2 border-neutral-200 bg-neutral-0 bg-no-repeat shadow-lg"
      style={{ width: lensSize, height: lensSize, ...lensStyle }}
    />
  );
}

export default function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const {
    containerRef,
    position,
    handleEnter,
    handleMove,
    handleLeave,
  } = useLensMovement<HTMLDivElement>(!modalOpen, LENS_ZOOM);

  const modalHandler = useLensMovement<HTMLDivElement>(modalOpen, MODAL_ZOOM);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-100"
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {position && <ZoomBackground src={src} position={position} zoom={LENS_ZOOM} lensSize={LENS_SIZE} />}

        <button
          onClick={() => setModalOpen(true)}
          className="absolute right-3 top-3 rounded-full bg-neutral-0/90 p-2 text-neutral-700 shadow-sm transition-colors hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
          aria-label={`Zoom ${alt}`}
        >
          <Maximize2 className="size-5" />
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed view of ${alt}`}
          onClick={() => setModalOpen(false)}
        >
          <button
            onClick={() => setModalOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label="Close zoom"
          >
            <X className="size-6" />
          </button>

          <div
            ref={modalHandler.containerRef}
            onMouseEnter={modalHandler.handleEnter}
            onMouseMove={modalHandler.handleMove}
            onMouseLeave={modalHandler.handleLeave}
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[4/5] w-full max-w-xl overflow-hidden rounded-lg"
          >
            <img src={src} alt={alt} className="h-full w-full object-cover" />
            {modalHandler.position && (
              <ZoomBackground
                src={src}
                position={modalHandler.position}
                zoom={MODAL_ZOOM}
                lensSize={LENS_SIZE}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}