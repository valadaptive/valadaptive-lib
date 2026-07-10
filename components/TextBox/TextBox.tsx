import style from './style.module.scss';

import type {InputHTMLAttributes, TargetedEvent} from 'preact';
import {useCallback} from 'preact/hooks';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';

export const TextBox = ({
    value,
    small,
    className,
    ...props
}: {value: Signal<string>; small?: boolean} & InputHTMLAttributes<HTMLInputElement>) => {
    const updateTextbox = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        value.value = event.currentTarget.value;
    }, [value]);

    return (
        <input
            type="text"
            className={classNames(className, small && style.small)}
            {...props}
            value={value}
            onInput={updateTextbox}
        />
    );
};
