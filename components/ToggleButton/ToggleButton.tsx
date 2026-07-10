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
            role="checkbox"
            aria-checked={toggled.value}
            title={title}
            ref={innerRef}
            tabindex={0}
            disabled={disabled}
        >
            <Icon type={type} title={title} />
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
            role="radio"
            aria-checked={currentValue.value === value}
            title={title}
            tabindex={0}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
