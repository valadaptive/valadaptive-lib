import style from './style.module.css';

import type {JSX, TargetedEvent} from 'preact';
import type {Signal} from '@preact/signals';
import classNames from 'clsx';
import {useMemo} from 'preact/hooks';

export type DropdownOption<T extends string | number> = {
    id: T;
    name: string;
    /** Consecutive options with the same group are rendered in an optgroup. */
    group?: string;
};

type SharedDropdownProps<T extends string | number> = {
    options: readonly DropdownOption<T>[];
    className?: string;
    disabled?: boolean;
    inputId?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
};

const renderOptions = <T extends string | number>(options: readonly DropdownOption<T>[]) => {
    const sections: {group: string | null; options: DropdownOption<T>[]}[] = [];
    for (const option of options) {
        const group = option.group ?? null;
        const current = sections.at(-1);
        if (!current || current.group !== group) sections.push({group, options: [option]});
        else current.options.push(option);
    }

    const elements: JSX.Element[] = [];
    sections.forEach((section, sectionIndex) => {
        const children = section.options.map(option => (
            <option value={option.id} key={option.id}>{option.name}</option>
        ));
        if (section.group === null) elements.push(...children);
        else elements.push(
            <optgroup label={section.group} key={`${section.group}-${sectionIndex}`}>{children}</optgroup>,
        );
    });
    return elements;
};

export const ImperativeDropdown = <T extends string | number>({
    value,
    onChange,
    options,
    className,
    disabled,
    inputId,
    'aria-label': label,
    'aria-labelledby': labelledBy,
}: SharedDropdownProps<T> & {
    value: T | null;
    onChange: (value: T) => unknown;
}): JSX.Element => {
    const handleChange = (event: TargetedEvent<HTMLSelectElement>) => {
        const option = options[event.currentTarget.selectedIndex];
        if (option) onChange(option.id);
    };

    const optionElems = useMemo(() => renderOptions(options), [options]);

    return (
        <div className={classNames(style.selectWrapper, className, disabled && style.disabled)}>
            <select
                className={style.select}
                value={value ?? ''}
                onChange={handleChange}
                disabled={disabled}
                id={inputId}
                aria-label={label}
                aria-labelledby={labelledBy}
            >
                {optionElems}
            </select>
        </div>
    );
};

export const Dropdown = <T extends string | number>({
    value,
    ...props
}: SharedDropdownProps<T> & {
    value: Signal<T | null>;
}): JSX.Element => (
    <ImperativeDropdown
        {...props}
        value={value.value}
        onChange={nextValue => {value.value = nextValue;}}
    />
);
