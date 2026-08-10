import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ProductImageZoomProps {
  src: string;
  alt: string;
}

const LENS_SIZE = 120;
const LENS_ZOOM = 2.5;
const MODAL_ZOOM = 3.5;
const MODAL_LENS_SIZE = 150;

interface LensHandlers {
  containerRef: React.RefObject<HTMLDivElement | null>;
  lensRef: React.RefObject<HTMLDivElement | null>;
  zoomImgRef: React.RefObject<HTMLImageElement | null>;
  handleEnter: () => void;
  handleMove: (e: React.MouseEvent) => void;
  handleLeave: () => void;
}

const HOVER_QUERY = '(hover: hover) and (pointer: fine)';

function useLens(enabled: boolean, zoom: number, lensSize: number): LensHandlers {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const activeRef = useRef(false);
  const cursorRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const paint = useCallback(() => {
    frameRef.current = null;
    const container = containerRef.current;
    const lens = lensRef.current;
    const zoomImg = zoomImgRef.current;
    if (!container || !lens) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const half = lensSize / 2;
    const minX = Math.min(half / rect.width, 0.5);
    const maxX = Math.max(1 - half / rect.width, 0.5);
    const minY = Math.min(half / rect.height, 0.5);
    const maxY = Math.max(1 - half / rect.height, 0.5);
    const { x, y } = cursorRef.current;
    const cx = Math.max(minX, Math.min(maxX, x));
    const cy = Math.max(minY, Math.min(maxY, y));

    const dx = cx * rect.width;
    const dy = cy * rect.height;

    lens.style.left = `${dx - half}px`;
    lens.style.top = `${dy - half}px`;
    lens.style.opacity = activeRef.current ? '1' : '0';

    if (zoomImg) {
      if (sizeRef.current.w !== rect.width || sizeRef.current.h !== rect.height) {
        sizeRef.current = { w: rect.width, h: rect.height };
        zoomImg.style.width = `${zoom * rect.width}px`;
        zoomImg.style.height = `${zoom * rect.height}px`;
      }
      zoomImg.style.transform = `translate(${half - zoom * dx}px, ${half - zoom * dy}px)`;
    }
  }, [lensSize, zoom]);

  const schedule = useCallback(() => {
    if (frameRef.current == null) {
      frameRef.current = requestAnimationFrame(paint);
    }
  }, [paint]);

  useEffect(
    () => () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const handleEnter = useCallback(() => {
    if (!enabled) return;
    if (
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia(HOVER_QUERY).matches
    ) {
      return;
    }
    cursorRef.current = { x: 0.5, y: 0.5 };
    activeRef.current = true;
    schedule();
  }, [enabled, schedule]);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activeRef.current) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;
      cursorRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
      schedule();
    },
    [schedule],
  );

  const handleLeave = useCallback(() => {
    activeRef.current = false;
    schedule();
  }, [schedule]);

  return { containerRef, lensRef, zoomImgRef, handleEnter, handleMove, handleLeave };
}

function Lens({
  src,
  lensRef,
  zoomImgRef,
  size,
}: {
  src: string;
  lensRef: React.RefObject<HTMLDivElement | null>;
  zoomImgRef: React.RefObject<HTMLImageElement | null>;
  size: number;
}) {
  return (
    <div
      ref={lensRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-20 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8),0_6px_18px_rgba(0,0,0,0.22)]"
      style={{ width: size, height: size, opacity: 0, willChange: 'left, top' }}
    >
      <img
        ref={zoomImgRef}
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="absolute left-0 top-0 max-w-none object-cover"
        style={{ willChange: 'transform' }}
      />
    </div>
  );
}

export default function ProductImageZoom({ src, alt }: ProductImageZoomProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const lens = useLens(!modalOpen, LENS_ZOOM, LENS_SIZE);
  const modalLens = useLens(modalOpen, MODAL_ZOOM, MODAL_LENS_SIZE);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => {
    setModalOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [modalOpen, closeModal]);

  return (
    <>
      <div
        ref={lens.containerRef}
        onMouseEnter={lens.handleEnter}
        onMouseMove={lens.handleMove}
        onMouseLeave={lens.handleLeave}
        className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-lg bg-neutral-100"
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <Lens src={src} lensRef={lens.lensRef} zoomImgRef={lens.zoomImgRef} size={LENS_SIZE} />

        <button
          ref={triggerRef}
          type="button"
          onClick={openModal}
          aria-label={`Open full-size preview of ${alt}`}
          className="group absolute inset-0 z-30 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-neutral-0/95 text-neutral-700 shadow-sm ring-1 ring-neutral-200/80 transition-colors group-hover:text-primary-900"
          >
            <Maximize2 className="size-5" />
          </span>
        </button>
      </div>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed preview of ${alt}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 p-4 sm:p-8"
          onClick={closeModal}
        >
          <button
            type="button"
            autoFocus
            onClick={closeModal}
            aria-label="Close zoom preview"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          <div
            ref={modalLens.containerRef}
            onMouseEnter={modalLens.handleEnter}
            onMouseMove={modalLens.handleMove}
            onMouseLeave={modalLens.handleLeave}
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[4/5] w-full max-w-xl overflow-hidden rounded-lg"
          >
            <img src={src} alt={alt} className="h-full w-full object-cover" />
            <Lens
              src={src}
              lensRef={modalLens.lensRef}
              zoomImgRef={modalLens.zoomImgRef}
              size={MODAL_LENS_SIZE}
            />
          </div>
        </div>
      )}
    </>
  );
}