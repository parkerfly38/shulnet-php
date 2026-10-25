import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import React, { type ReactNode, type RefObject, useState } from 'react';

export interface MapSeat {
    key: string;
    label: string;
    x: number;
    y: number;
}

export interface SeatAppearance {
    /** Fill color (any CSS color). */
    color: string;
    /** Extra classes, e.g. a selection ring. */
    className?: string;
    title?: string;
    disabled?: boolean;
    /** Render the seat hollow (outline only). */
    hollow?: boolean;
    accessible?: boolean;
}

interface SeatMapProps<T extends MapSeat> {
    imageUrl: string | null;
    imageWidth?: number | null;
    imageHeight?: number | null;
    seats: T[];
    appearance: (seat: T) => SeatAppearance;
    onSeatClick?: (seat: T, event: React.MouseEvent) => void;
    onSeatPointerDown?: (seat: T, event: React.PointerEvent) => void;
    onCanvasPointerDown?: (event: React.PointerEvent) => void;
    canvasRef?: RefObject<HTMLDivElement | null>;
    /** Absolutely positioned content drawn over the map (marquee, row preview...). */
    overlay?: ReactNode;
    cursor?: string;
    className?: string;
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

/**
 * Converts a pointer position into percentage coordinates on the canvas.
 */
export function pointToPercent(canvas: HTMLElement, clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    const clamp = (n: number) => Math.min(100, Math.max(0, n));

    return {
        x: clamp(((clientX - rect.left) / rect.width) * 100),
        y: clamp(((clientY - rect.top) / rect.height) * 100),
    };
}

export default function SeatMap<T extends MapSeat>({
    imageUrl,
    imageWidth,
    imageHeight,
    seats,
    appearance,
    onSeatClick,
    onSeatPointerDown,
    onCanvasPointerDown,
    canvasRef,
    overlay,
    cursor,
    className,
}: SeatMapProps<T>) {
    const { t } = useTranslation();
    const [zoomIndex, setZoomIndex] = useState(2);
    const zoom = ZOOM_STEPS[zoomIndex];
    const aspectRatio = imageWidth && imageHeight ? `${imageWidth} / ${imageHeight}` : '16 / 10';
    const seatSize = Math.round(22 * Math.max(1, zoom * 0.9));

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <div className="flex items-center justify-end gap-1">
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label={t('Zoom out')}
                    disabled={zoomIndex === 0} onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-xs text-muted-foreground tabular-nums">{Math.round(zoom * 100)}%</span>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label={t('Zoom in')}
                    disabled={zoomIndex === ZOOM_STEPS.length - 1} onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}>
                    <Plus className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" className="h-8 w-8" aria-label={t('Reset zoom')}
                    onClick={() => setZoomIndex(2)}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-lg border bg-muted/30">
                <div
                    ref={canvasRef}
                    className="relative mx-auto select-none touch-none"
                    style={{ width: `${zoom * 100}%`, aspectRatio, cursor }}
                    onPointerDown={onCanvasPointerDown}
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-fill" />
                    ) : (
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,_var(--border)_1px,_transparent_1px)] [background-size:20px_20px]" />
                    )}

                    {seats.map((seat) => {
                        const look = appearance(seat);

                        return (
                            <button
                                key={seat.key}
                                type="button"
                                title={look.title ?? seat.label}
                                aria-label={look.title ?? seat.label}
                                disabled={look.disabled}
                                onClick={(e) => onSeatClick?.(seat, e)}
                                onPointerDown={(e) => {
                                    if (onSeatPointerDown) {
                                        e.stopPropagation();
                                        onSeatPointerDown(seat, e);
                                    }
                                }}
                                className={cn(
                                    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border-2 font-semibold leading-none text-white shadow-sm transition-transform',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                                    look.disabled ? 'cursor-not-allowed' : 'hover:scale-110',
                                    look.accessible && 'rounded-full',
                                    look.className,
                                )}
                                style={{
                                    left: `${seat.x}%`,
                                    top: `${seat.y}%`,
                                    width: seatSize,
                                    height: seatSize,
                                    fontSize: Math.max(7, seatSize * 0.34),
                                    backgroundColor: look.hollow ? 'var(--background)' : look.color,
                                    borderColor: look.color,
                                    color: look.hollow ? look.color : undefined,
                                }}
                            >
                                {seat.label}
                            </button>
                        );
                    })}

                    {overlay}
                </div>
            </div>
        </div>
    );
}

export function Legend({ items }: { items: { label: string; color: string; hollow?: boolean; round?: boolean }[] }) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {items.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                    <span
                        className={cn('inline-block h-3.5 w-3.5 border-2', item.round ? 'rounded-full' : 'rounded-sm')}
                        style={{ backgroundColor: item.hollow ? 'transparent' : item.color, borderColor: item.color }}
                    />
                    {item.label}
                </span>
            ))}
        </div>
    );
}
