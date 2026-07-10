import style from './style.module.css';

import type {JSX} from 'preact';
import {useCallback} from 'preact/hooks';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';

export const Dropdown = <T extends string | number>({
    value,
    options,
    className,
    disabled,
    inputId,
    'aria-labelledby': labelledBy,
}: {
    value: Signal<T | null>;
    options: readonly {
        id: T;
        name: string;
    }[];
    className?: string;
    disabled?: boolean;
    inputId?: string;
    'aria-labelledby'?: string;
}): JSX.Element => {
    const handleChange = useCallback((event: Event) => {
        const select = event.target as HTMLSelectElement;
        if (select.selectedIndex !== -1) {
            value.value = options[select.selectedIndex].id;
        }
    }, [value, options]);

    return (
        <div className={classNames(style.selectWrapper, className, disabled && style.disabled)}>
            <select
                className={style.select}
                onChange={handleChange}
                disabled={disabled}
                id={inputId}
                aria-labelledby={labelledBy}
            >
                {options.map(({id, name}) => (
                    <option value={id} key={id} selected={id === value.value}>{name}</option>
                ))}
            </select>
        </div>
    );
};
