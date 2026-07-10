import style from './style.module.scss';

import type {TargetedEvent} from 'preact';
import {useCallback, useId} from 'preact/hooks';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';

export const CheckboxToggle = ({label, title, checked, disabled, indeterminate, className}: {
    label: string;
    title?: string | null;
    checked: Signal<boolean>;
    disabled?: boolean;
    indeterminate?: boolean;
    className?: string;
}) => {
    const handleInput = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        event.preventDefault();
        checked.value = event.currentTarget.checked;
    }, [checked]);

    const preventSelection = useCallback((event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const id = useId();

    return (
        <label
            className={classNames(style.checkboxToggle, disabled && style.disabled, className)}
            title={title ?? undefined}
            aria-disabled={disabled}
            for={id}
        >
            <input
                type="checkbox"
                checked={checked.value}
                onInput={handleInput}
                disabled={disabled}
                indeterminate={indeterminate}
                id={id}
            />
            <span className={style.checkboxLabel} onMouseDown={preventSelection}>{label}</span>
        </label>
    );
};
