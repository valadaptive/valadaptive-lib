import style from './style.module.scss';

import type {JSX, TargetedEvent} from 'preact';
import {useCallback, useId, useLayoutEffect, useMemo, useRef} from 'preact/hooks';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';

export const Slider = ({
    value,
    min,
    max,
    step = 1,
    detents,
    disabled,
    vertical,
    className,
    id,
    'aria-labelledby': labelledBy,
}: {
    value: Signal<number>;
    min: number;
    max: number;
    step?: number | 'any';
    detents?: number[];
    disabled?: boolean;
    vertical?: boolean;
    className?: string;
    id?: string;
    'aria-labelledby'?: string,
}): JSX.Element => {
    const handleInput = useCallback((event: TargetedEvent<HTMLInputElement, InputEvent>) => {
        const newValue = Number(event.currentTarget.value);
        value.value = newValue;
    }, [value]);

    return <ImperativeSlider
        value={value.value}
        onInput={handleInput}
        min={min}
        max={max}
        step={step}
        detents={detents}
        disabled={disabled}
        vertical={vertical}
        className={className}
        id={id}
        aria-labelledby={labelledBy}
    />;
};

const EMPTY_ARRAY: never[] = [];

export const ImperativeSlider = ({
    value,
    onInput,
    min,
    max,
    step = 1,
    detents,
    disabled,
    vertical,
    className,
    id,
    'aria-labelledby': labelledBy,
}: {
    value: number;
    onInput?: (event: TargetedEvent<HTMLInputElement, InputEvent>) => unknown;
    min: number;
    max: number;
    step?: number | 'any';
    detents?: number[];
    disabled?: boolean;
    vertical?: boolean;
    className?: string;
    id?: string;
    'aria-labelledby'?: string,
}): JSX.Element => {
    const sliderInput = useRef<HTMLInputElement>(null);

    const handleInput = useCallback((event: TargetedEvent<HTMLInputElement, InputEvent>) => {
        // Update --val immediately from the DOM to stay in sync with the browser's knob position
        event.currentTarget.style.setProperty('--val', event.currentTarget.value);
        onInput?.(event);
    }, [onInput]);
    // If the detents array has the same contents as a previous one, use the previous one to maintain object identity
    const memoDetents = useMemo(() => detents, detents ?? EMPTY_ARRAY);
    const dlId = useId();

    const dataList = useMemo(() => {
        if (!memoDetents || memoDetents.length === 0) return null;
        return (
            <datalist id={dlId}>
                {memoDetents.map(value => <option value={value} />)}
            </datalist>
        );
    }, [dlId, memoDetents]);

    useLayoutEffect(() => {
        const slider = sliderInput.current!;
        slider.style.setProperty('--min', String(min));
        slider.style.setProperty('--max', String(max));
        slider.style.setProperty('--val', String(value));
    }, [value, min, max]);

    return (
        <input
            className={classNames(style.slider, className, vertical && style.vertical)}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onInput={handleInput}
            ref={sliderInput}
            list={memoDetents?.length ? dlId : undefined}
            id={id}
            aria-labelledby={labelledBy}
        >{dataList}</input>
    );
};
