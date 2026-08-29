import React from 'react';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef(({
    checked = false,
    onCheckedChange,
    disabled = false,
    size = 'default',
    color = 'primary',
    className,
    id,
    ...props
}, ref) => {
    const colors = {
        primary: {
            track: 'bg-gradient-to-r from-primary to-primary/80',
            glow: 'bg-primary/30',
            thumbShadow: 'shadow-[0_2px_6px_rgba(0,0,0,0.22)]',
            dot: 'bg-primary',
        },
        success: {
            track: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
            glow: 'bg-emerald-500/30',
            thumbShadow: 'shadow-[0_2px_6px_rgba(16,185,129,0.35)]',
            dot: 'bg-emerald-500',
        },
    };

    const c = colors[color] || colors.primary;

    // Knob size (square) fitted to the track's inner height (h-* minus p-1).
    const sizes = {
        sm: { track: 'w-9 h-5', knob: 12 },
        default: { track: 'w-12 h-7', knob: 20 },
        lg: { track: 'w-14 h-8', knob: 24 },
    };

    const s = sizes[size] || sizes.default;

    return (
        <button
            ref={ref}
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange?.(!checked)}
            className={cn(
                'group relative inline-flex shrink-0 cursor-pointer items-center overflow-hidden rounded-full p-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                s.track,
                checked
                    ? c.track
                    : 'bg-muted-foreground/15',
                disabled && 'opacity-40 cursor-not-allowed',
                className
            )}
            {...props}
        >
            {/* Glow effect when active */}
            {checked && (
                <div className={`pointer-events-none absolute inset-0 rounded-full blur-[6px] ${c.glow}`} />
            )}

            {/* Knob: animated via logical margin-inline-start (RTL-safe), kept inside the track. */}
            <span
                className={cn(
                    'relative z-10 flex items-center justify-center rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                    checked ? c.thumbShadow : 'shadow-sm'
                )}
                style={{
                    width: s.knob,
                    height: s.knob,
                    marginInlineStart: checked ? `calc(100% - ${s.knob}px)` : '0px',
                }}
            >
                {/* Inner dot indicator */}
                <span
                    className={cn(
                        'rounded-full transition-colors duration-200',
                        checked ? c.dot : 'bg-muted-foreground/30'
                    )}
                    style={{ width: '35%', height: '35%' }}
                />
            </span>
        </button>
    );
});

Switch.displayName = 'Switch';

export { Switch };
