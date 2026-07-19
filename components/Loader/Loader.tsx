import style from './style.module.css';

const Loader = ({progress, size = 100, className, label = 'Loading'}: {
    progress?: number;
    size?: number;
    className?: string;
    /** Accessible name announced for the loader. */
    label?: string;
}) => {
    const STROKE_WIDTH = Math.min(size / 10, 10);
    const radius = (size - STROKE_WIDTH) * 0.5;

    // Dash values are in pathLength="100" units, i.e. percentages of the circumference
    let dashArray, dashOffset;
    if (typeof progress === 'number') {
        progress = Math.max(0, Math.min(1, progress));
        dashArray = 100;
        dashOffset = 100 - (progress * 100);
    } else {
        dashArray = 50;
        dashOffset = 0;
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={typeof progress === 'number' ? Math.round(progress * 100) : undefined}
        >
            {typeof progress === 'number' && size >= 64 &&
                <text
                    x="50%"
                    y="50%"
                    text-anchor="middle"
                    dy=".3em"
                    font-size={`${size * 0.2}px`}
                    font-weight={600}
                    fill="currentColor"
                    className="tabular-nums"
                >
                    {Math.round(progress * 100)
                        .toString()
                        .padStart(2, '0') + '%'}
                </text>
            }
            <circle
                cx="50%"
                cy="50%"
                r={radius}
                pathLength={100}
                stroke-width={STROKE_WIDTH}
                stroke="currentColor"
                fill="none"
                stroke-dasharray={dashArray}
                stroke-dashoffset={dashOffset}
                className={typeof progress !== 'number' ? style.spinner : undefined}
            />
        </svg>
    );
};

export default Loader;
