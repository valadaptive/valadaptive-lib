import style from './style.module.css';

import type {ComponentChildren, Ref} from 'preact';
import {useCallback} from 'preact/hooks';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';

import Icon, {IconType} from '../Icon/Icon';

export const ToggleIcon = ({type, title, toggled, disabled, innerRef, className}: {
    type: IconType;
    title: string;
    toggled: Signal<boolean>;
    disabled?: boolean;
    innerRef?: Ref<HTMLButtonElement>;
    className?: string;
}) => {
    const handleClick = useCallback(() => {
        if (!disabled) toggled.value = !toggled.value;
    }, [toggled, disabled]);
    return (
        <button
            className={classNames(
                style.iconButton,
                style.toggleIcon,
                toggled.value && style.toggledOn,
                className,
                disabled && style.disabled,
            )}
            onClick={handleClick}
            role="button"
            aria-pressed={toggled.value}
            title={title}
            aria-label={title}
            ref={innerRef}
            disabled={disabled}
        >
            <Icon type={type} title={null} />
        </button>
    );
};

// eslint-disable-next-line @stylistic/comma-dangle
export const SelectableButton = <T, >({children, title, currentValue, value, disabled}: {
    children?: ComponentChildren;
    title?: string;
    currentValue: Signal<T>;
    value: T;
    disabled?: boolean;
}) => {
    const handleClick = useCallback(() => {
        currentValue.value = value;
    }, [currentValue]);
    return (
        <button
            className={classNames(
                style.iconButton,
                style.toggleIcon,
                {[style.toggledOn]: currentValue.value === value},
            )}
            onClick={handleClick}
            role="button"
            aria-pressed={currentValue.value === value}
            title={title}
            aria-label={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
