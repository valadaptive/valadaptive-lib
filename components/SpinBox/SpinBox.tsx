import style from './style.module.css';

import type {JSX, TargetedEvent} from 'preact';
import {useCallback, useEffect, useId, useRef} from 'preact/hooks';
import {useSignal, type Signal} from '@preact/signals';
import classNames from 'clsx';

export const SpinBox = ({
    value,
    customDisplay,
    min,
    max,
    sensitivity,
    step = 1,
    smartAim = 0,
    disabled,
    className,
    inputId,
    width,
    'aria-labelledby': labelledBy,
}: {
    value: Signal<number>;
    customDisplay?: SpinBoxDisplayFuncs,
    min?: number;
    max?: number;
    sensitivity?: number;
    step?: number | 'any';
    smartAim?: number;
    disabled?: boolean;
    className?: string;
    inputId?: string;
    width?: number;
    'aria-labelledby'?: string;
}): JSX.Element => {
    const handleInput = useCallback((newValue: number) => {
        value.value = newValue;
    }, [value]);

    return <ImperativeSpinBox
        value={value.value}
        onInput={handleInput}
        customDisplay={customDisplay}
        min={min}
        max={max}
        sensitivity={sensitivity}
        step={step}
        smartAim={smartAim}
        disabled={disabled}
        className={className}
        inputId={inputId}
        width={width}
        aria-labelledby={labelledBy}
    />;
};

export type SpinBoxDisplayFuncs = {
    display: (value: number) => string,
    parse: (value: string) => number | null,
};

export const ImperativeSpinBox = ({
    value,
    onInput,
    customDisplay,
    min,
    max,
    sensitivity,
    step = 1,
    smartAim = 0,
    disabled,
    className,
    inputId,
    width,
    'aria-labelledby': labelledBy,
}: {
    value: number;
    onInput: (value: number) => unknown,
    customDisplay?: SpinBoxDisplayFuncs,
    min?: number;
    max?: number;
    sensitivity?: number;
    step?: number | 'any';
    smartAim?: number;
    disabled?: boolean;
    className?: string;
    inputId?: string;
    width?: number;
    'aria-labelledby'?: string;
}): JSX.Element => {
    const currentValue = useRef(value);
    currentValue.current = value;

    const handleInput = useCallback((event: TargetedEvent<HTMLInputElement, InputEvent>) => {
        let newValue = customDisplay ?
            customDisplay.parse(event.currentTarget.value) :
            Number(event.currentTarget.value);
        if (newValue === null || !Number.isFinite(newValue)) return;
        if (typeof min === 'number') newValue = Math.max(min, newValue);
        if (typeof max === 'number') newValue = Math.min(max, newValue);
        onInput(newValue);
    }, [currentValue, customDisplay?.parse, min, max, onInput]);

    const increment = useCallback(() => {
        let incremented = currentValue.current + (step === 'any' ? 1 : step);
        if (typeof max === 'number') incremented = Math.min(incremented, max);
        onInput(incremented);
    }, [currentValue, max, step, onInput]);

    const decrement = useCallback(() => {
        let decremented = currentValue.current - (step === 'any' ? 1 : step);
        if (typeof min === 'number') decremented = Math.max(decremented, min);
        onInput(decremented);
    }, [currentValue, min, step, onInput]);

    const spinboxId = useId();

    const isEditing = useSignal(false);

    const pointerListeners = useRef<{
        move: (event: PointerEvent) => unknown;
        up: (event: PointerEvent) => unknown;
    } | null>(null);
    useEffect(() => {
        return () => {
            if (pointerListeners.current) {
                window.removeEventListener('pointermove', pointerListeners.current.move);
                window.removeEventListener('pointerup', pointerListeners.current.up);
            }
        };
    }, []);

    // Drag up/down to change the value
    const handlePointerDown = useCallback((event: TargetedEvent<HTMLInputElement, PointerEvent>) => {
        // For the first drag, focus the input element and prevent selecting text until subsequent pointer events
        if (document.activeElement !== event.currentTarget) {
            event.preventDefault();
            event.currentTarget.focus();
        } else {
            return;
        }
        if (disabled) return;
        // Don't count up/down drags if the cursor is inside the spinbox
        const target = event.currentTarget;
        const deadZone = target.getBoundingClientRect();
        const valueStart = currentValue.current;

        const onMove = (event: PointerEvent) => {
            let mouseDelta = 0;
            if (event.clientY < deadZone.top) {
                mouseDelta += event.clientY - deadZone.top;
            } else if (event.clientY > deadZone.bottom) {
                mouseDelta += event.clientY - deadZone.bottom;
            }

            if (event.clientX < deadZone.left) {
                mouseDelta -= event.clientX - deadZone.left;
            } else if (event.clientX > deadZone.right) {
                mouseDelta -= event.clientX - deadZone.right;
            }

            if (mouseDelta === 0) return;

            document.getSelection()?.empty();

            // 200px (in either direction; it's the "radius", not "diameter") for the slider to go from min to max
            let computedSensitivity;
            if (sensitivity) {
                computedSensitivity = sensitivity;
            } else if (typeof min === 'number' && typeof max === 'number') {
                computedSensitivity = (max - min) / 200;
            } else {
                computedSensitivity = 1;
            }
            const valueDelta = mouseDelta * computedSensitivity;

            const newValue = valueStart - valueDelta;
            let clampedValue = newValue;
            if (typeof max === 'number') clampedValue = Math.min(clampedValue, max);
            if (typeof min === 'number') clampedValue = Math.max(clampedValue, min);
            let roundedValue = step === 'any' ? clampedValue : Math.round(clampedValue / step) * step;
            if (smartAim > 0) {
                let roundedToAim = Math.round(newValue / smartAim) * smartAim;
                if (Math.abs(roundedToAim - newValue) < smartAim / 4) {
                    if (typeof max === 'number') roundedToAim = Math.min(roundedToAim, max);
                    if (typeof min === 'number') roundedToAim = Math.max(roundedToAim, min);
                    roundedValue = roundedToAim;
                }
            }
            onInput(roundedValue);
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
        pointerListeners.current = {move: onMove, up: onUp};

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    }, [min, max, sensitivity, step, smartAim, onInput, currentValue, disabled]);

    const handleFocus = useCallback(() => {
        if (disabled) return;
        isEditing.value = true;
    }, [isEditing, disabled]);
    const handleBlur = useCallback(() => {
        isEditing.value = false;
        // Ensure the value is clamped to min/max when editing ends
        let clampedValue = currentValue.current;
        if (typeof max === 'number') clampedValue = Math.min(clampedValue, max);
        if (typeof min === 'number') clampedValue = Math.max(clampedValue, min);
        onInput(clampedValue);
    }, [isEditing, currentValue, min, max, onInput]);

    return (
        <div
            className={classNames(
                style.spinboxWrapper,
                className,
                disabled && style.disabled,
            )}
            aria-disabled={disabled}
            style={{
                width: width ? `calc(${width}ch + var(--padding-right) * 2 + 1rem)` : undefined,
                flexShrink: width ? '0' : undefined,
            }}
        >
            <input
                className={classNames(
                    style.spinboxField,
                    !isEditing.value && style.spinboxIdle,
                    'tabular-nums',
                    disabled && style.disabled,
                )}
                type={customDisplay ? 'text' : 'number'}
                min={min}
                max={max}
                step={step}
                value={customDisplay ? customDisplay.display(value) : Number(value.toPrecision(12))}
                disabled={disabled}
                onInput={handleInput}
                id={inputId ?? spinboxId}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onPointerDown={handlePointerDown}
                aria-labelledby={labelledBy}
            />
            <div className={style.spinboxButtons}>
                <button
                    onClick={increment}
                    disabled={disabled || (value === max)}
                    className={style.spinboxButton}
                    role="button"
                    aria-controls={inputId ?? spinboxId}
                    aria-label="Increment"
                >
                    <div className={style.spinboxUp} />
                </button>
                <div className={style.spinboxButtonDivider} />
                <button
                    onClick={decrement}
                    disabled={disabled || (value === min)}
                    className={style.spinboxButton}
                    role="button"
                    aria-controls={inputId ?? spinboxId}
                    aria-label="Decrement"
                >
                    <div className={style.spinboxDown} />
                </button>
            </div>
        </div>
    );
};
