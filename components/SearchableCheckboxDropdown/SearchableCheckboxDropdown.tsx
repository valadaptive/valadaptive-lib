import style from './style.module.css';

import type {ComponentChildren, TargetedEvent} from 'preact';
import {useCallback, useEffect, useMemo, useRef} from 'preact/hooks';
import {computed, useSignal, type Signal} from '@preact/signals';
import classNames from 'clsx';
import {flip, offset, shift, size} from '@floating-ui/dom';
import uFuzzy from '@leeoniya/ufuzzy';

import Icon from '../Icon/Icon';
import {Overlay} from '../Overlay/Overlay';
import useFloating from '../../util/floating';

const searcher = new uFuzzy({});

export const SearchableCheckboxDropdown = <T extends string | number>({
    options,
    selectedOptions,
    placeholder = 'Search...',
    className,
    id,
    renderOption,
}: {
    options: Array<{
        id: T;
        name: string;
        searchable?: string;
    }>;
    selectedOptions: Record<T, Signal<boolean>>;
    placeholder?: string;
    className?: string;
    id?: string;
    renderOption?: (option: {id: T; name: string; searchable?: string}) => ComponentChildren;
}) => {
    const isOpen = useSignal(false);
    const searchValue = useSignal('');
    const buttonRef = useRef<HTMLButtonElement>(null);

    const {reference, floating} = useFloating(() => ({
        placement: 'bottom-start',
        middleware: [
            offset(4),
            shift({padding: 8}),
            size({
                apply({availableHeight, elements}) {
                    const {floating, reference} = elements;
                    floating.style.width = `${reference.getBoundingClientRect().width}px`;
                    floating.style.maxHeight = `${Math.max(availableHeight - 8, 320)}px`;
                },
                padding: 8,
            }),
            flip(),
        ],
    }));
    const setButtonRef = useCallback((button: HTMLButtonElement | null) => {
        reference(button);
        buttonRef.current = button;
    }, []);

    const optionNames = useMemo(() => options.map(option => option.searchable ?? option.name), [options]);

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        if (!searchValue.value) return options;

        const [idxs, info, order] = searcher.search(optionNames, searchValue.value) as
            uFuzzy.RankedResult | uFuzzy.AbortedResult;
        if (!info) return options;
        const searchResults = order.map(i => options[idxs[i]]);
        return searchResults;
    }, [options, searchValue.value]);

    // Get selected options for display
    const selectedItemsText = useMemo(() => {
        return computed(() => {
            const optionsText = [];
            for (const option of options) {
                if (selectedOptions[option.id].value) {
                    optionsText.push(option.name);
                }
            }
            return optionsText.length === 0 ? null : optionsText.join(', ');
        });
    }, [options, selectedOptions]);

    const focusSearchInput = useCallback((searchInput: HTMLInputElement | null) => {
        if (searchInput) searchInput.focus();
    }, []);

    const handleToggleDropdown = useCallback(() => {
        isOpen.value = !isOpen.value;
        if (!isOpen.value) {
            // Clear search when closing
            searchValue.value = '';
        }
    }, [isOpen, searchValue]);

    const handleSearchChange = useCallback((event: TargetedEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        searchValue.value = input.value;
    }, [searchValue]);

    const handleOptionToggle = useCallback((optionId: T) => {
        const signal = selectedOptions[optionId];
        signal.value = !signal.value;
    }, [selectedOptions]);

    const handleFocusOut = useCallback((event: TargetedEvent<HTMLDivElement, FocusEvent>) => {
        if (!event.relatedTarget || (
            event.relatedTarget !== buttonRef.current &&
            event.currentTarget?.contains(event.relatedTarget as HTMLElement) === false
        )) {
            isOpen.value = false;
            searchValue.value = '';
        }
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            isOpen.value = false;
            searchValue.value = '';
            buttonRef.current?.focus();
        }
    }, [isOpen, searchValue]);

    useEffect(() => {
        if (isOpen.value) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen.value, handleKeyDown]);

    const buttonText = selectedItemsText.value ?? placeholder;

    return (
        <div className={classNames(style.searchableDropdownWrapper, className)} id={id}>
            <button
                ref={setButtonRef}
                className={classNames(style.searchableDropdownButton, isOpen.value && style.open)}
                onClick={handleToggleDropdown}
                type="button"
                role="combobox"
            >
                <span
                    className={style.searchableDropdownButtonText}
                    title={selectedItemsText.value ?? undefined}
                >{buttonText}</span>
                <Icon
                    type={isOpen.value ? 'arrow-up' : 'arrow-down'}
                    title=""
                    className={style.searchableDropdownArrow}
                />
            </button>

            {isOpen.value && (
                <Overlay>
                    <div
                        ref={floating}
                        className={style.searchableDropdownPanel}
                        onFocusOut={handleFocusOut}
                        tabIndex={0}
                        role="menu"
                    >
                        <div className={style.searchableDropdownSearch}>
                            <input
                                ref={focusSearchInput}
                                type="text"
                                placeholder="Search..."
                                role="searchbox"
                                value={searchValue.value}
                                onInput={handleSearchChange}
                                className={style.searchableDropdownSearchInput}
                            />
                        </div>
                        <div className={style.searchableDropdownOptions}>
                            {filteredOptions.map((option: {id: T; name: string; searchable?: string}) => (
                                <label
                                    key={option.id}
                                    className={style.searchableDropdownOption}
                                    onClick={(e) => e.stopPropagation()}
                                    role="menuitem"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedOptions[option.id]?.value || false}
                                        onChange={() => handleOptionToggle(option.id)}
                                        className={style.searchableDropdownCheckbox}
                                    />
                                    <span className={style.searchableDropdownOptionText}>
                                        {renderOption ? renderOption(option) : option.name}
                                    </span>
                                </label>
                            ))}
                            {filteredOptions.length === 0 && (
                                <div className={style.searchableDropdownNoResults}>
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                </Overlay>
            )}
        </div>
    );
};
