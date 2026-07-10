import style from './style.module.scss';

import {createContext, h, type ComponentChildren, type JSX} from 'preact';
import {useCallback, useContext, useEffect, useLayoutEffect, useMemo} from 'preact/hooks';
import {useSignal} from '@preact/signals';
import {flip, ReferenceElement} from '@floating-ui/dom';

import Icon, {IconType} from '../Icon/Icon';
import {Overlay} from '../Overlay/Overlay';
import useFloating from '../../util/floating';

export type ContextMenuItem = {
    id: string;
    label: string;
    icon?: IconType;
    disabled?: boolean;
    href?: string;
    onClick?: () => void;
};

type ContextMenuState = {
    x: number;
    y: number;
    items: ContextMenuItem[];
};

type ContextMenuContextType = {
    show: (event: MouseEvent, items: ContextMenuItem[]) => void;
    close: () => void;
};

const ContextMenuContext = createContext<ContextMenuContextType | null>(null);

/** Hook to get the context menu API. Returns a function to show the menu. */
export const useContextMenu = (): ((event: MouseEvent, items: ContextMenuItem[]) => void) => {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) {
        throw new Error('useContextMenu must be used within a ContextMenuProvider');
    }
    return ctx.show;
};

export const Menu = ({
    refElement,
    items,
    onClose,
}: {
    refElement: ReferenceElement;
    items: ContextMenuItem[];
    onClose: () => void;
}): JSX.Element | null => {
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // If the user right-clicks outside the menu, close it
    const handleBackdropContextMenu = useCallback((event: MouseEvent) => {
        event.preventDefault();
        onClose();
    }, [onClose]);

    const {reference, floating} = useFloating(() => ({
        placement: 'bottom-start',
        middleware: [
            flip({fallbackPlacements: ['bottom-end', 'top-start', 'top-end']}),
        ],
    }));
    useLayoutEffect(() => {
        reference(refElement);
    }, [refElement]);

    const onMenuOpen = useCallback((element: HTMLDivElement | null) => {
        floating(element);
        if (!element) return;
        element.focus();
    }, []);

    return (
        <>
            <div
                className={style.contextMenuBackdrop}
                onClick={onClose}
                onContextMenu={handleBackdropContextMenu}
            />
            <div ref={onMenuOpen} className={style.contextMenu} tabIndex={0}>
                {items.map(item => h(
                    item.href ? 'a' : 'button',
                    {
                        key: item.id,
                        className: style.contextMenuItem,
                        onClick: item.onClick && (
                            () => {
                                if (!item.disabled) {
                                    item.onClick!();
                                    onClose();
                                }
                            }
                        ),
                        disabled: item.disabled,
                        href: item.href,
                    },
                    item.icon && (
                        <Icon type={item.icon} title="" />
                    ),
                    <span className={style.contextMenuLabel}>{item.label}</span>,
                ))}
            </div>
        </>
    );
};

/** Provider that renders the global context menu. Place at app root. */
export const ContextMenuProvider = ({children}: {children?: ComponentChildren}): JSX.Element => {
    const state = useSignal<ContextMenuState | null>(null);

    const contextValue = useMemo(() => {
        return {
            show: (event: MouseEvent, items: ContextMenuItem[]) => {
                event.preventDefault();
                event.stopPropagation();
                state.value = {x: event.clientX, y: event.clientY, items};
            },
            close: () => {
                state.value = null;
            },
        };
    }, [state]);

    const content = useMemo(() => {
        const stateValue = state.value;
        if (!stateValue) return null;
        // Create a virtual element at the click position
        const virtualEl = {
            getBoundingClientRect() {
                return new DOMRect(stateValue.x, stateValue.y, 0, 0);
            },
        };
        return <Menu refElement={virtualEl} items={stateValue.items} onClose={contextValue.close} />;
    }, [state.value, contextValue]);

    return (
        <ContextMenuContext.Provider value={contextValue}>
            {children}
            {content &&
                <Overlay>
                    {content}
                </Overlay>}
        </ContextMenuContext.Provider>
    );
};
