import type {ComponentChildren} from 'preact';
import style from './style.module.css';
import classNames from 'clsx';
import {useSignal, type Signal} from '@preact/signals';
import {useCallback, useRef} from 'preact/hooks';

const useResizablePanel = (
    initialSize: string,
    minSize: string,
    maxSize: string,
    edge: 'top' | 'bottom' | 'left' | 'right',
):  {
    resizerRef: (element: HTMLElement | null) => void;
    panelRef: (element: HTMLElement | null) => void;
    panelSize: Signal<string>;
    resizeBy: (delta: number) => void;
} => {
    const isVertical = edge === 'top' || edge === 'bottom';
    const panelSize = useSignal(initialSize);
    const ac = useRef<AbortController>(null);
    const panel = useRef<HTMLElement | null>(null);
    const panelRef = useCallback((element: HTMLElement | null) => {
        panel.current = element;
    }, []);

    const resizeBy = useCallback((delta: number) => {
        const rect = panel.current?.getBoundingClientRect();
        if (!rect) return;
        const currentSize = isVertical ? rect.height : rect.width;
        const sizeDelta = edge === 'top' || edge === 'left' ? -delta : delta;
        panelSize.value = `clamp(${minSize}, ${currentSize + sizeDelta}px, ${maxSize})`;
    }, [edge, isVertical, maxSize, minSize, panelSize]);

    const refCallback = useCallback((element: HTMLElement | null) => {
        if (ac.current) {
            ac.current.abort();
            ac.current = null;
        }
        if (!element) return;
        const abortController = new AbortController();
        ac.current = abortController;
        let onPointerMove: (event: PointerEvent) => void, onPointerUp: () => void;
        const onPointerDown = (event: PointerEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const startPos = isVertical ? event.clientY : event.clientX;
            const rect = panel.current?.getBoundingClientRect();
            if (!rect) return;
            const startSize = isVertical ? rect.height : rect.width;
            onPointerMove = (moveEvent: PointerEvent) => {
                moveEvent.preventDefault();
                moveEvent.stopPropagation();
                let delta = (isVertical ? moveEvent.clientY : moveEvent.clientX) - startPos;
                if (edge === 'top' || edge === 'left') delta *= -1;
                const newSize = startSize + delta;
                panelSize.value = `clamp(${minSize}, ${newSize}px, ${maxSize})`;
            };
            onPointerUp = () => {
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);
                document.removeEventListener('pointerleave', onPointerUp);
            };
            document.addEventListener('pointermove', onPointerMove, {signal: abortController.signal});
            document.addEventListener('pointerup', onPointerUp, {signal: abortController.signal});
            document.addEventListener('pointerleave', onPointerUp, {signal: abortController.signal});
        };

        if (element) {
            element.addEventListener('pointerdown', onPointerDown, {signal: abortController.signal});
        }
    }, [edge, isVertical, maxSize, minSize, panelSize]);

    return {
        resizerRef: refCallback,
        panelRef,
        panelSize,
        resizeBy,
    };
};

const ResizablePanel = ({
    initialSize,
    minSize,
    maxSize,
    edge,
    children,
    className,
    separatorLabel = 'Resize panel',
}: {
    initialSize: number | string,
    minSize: number | string,
    maxSize: number | string,
    edge: 'top' | 'bottom' | 'left' | 'right',
    children?: ComponentChildren,
    className?: string,
    separatorLabel?: string,
}) => {
    const isVertical = edge === 'top' || edge === 'bottom';
    const {resizerRef, panelRef, panelSize, resizeBy} = useResizablePanel(
        typeof initialSize === 'number' ? `${initialSize}px` : initialSize,
        typeof minSize === 'number' ? `${minSize}px` : minSize,
        typeof maxSize === 'number' ? `${maxSize}px` : maxSize,
        edge,
    );

    const onSeparatorKeyDown = (event: KeyboardEvent) => {
        let delta = event.key === (isVertical ? 'ArrowUp' : 'ArrowLeft') ? -1 :
            event.key === (isVertical ? 'ArrowDown' : 'ArrowRight') ? 1 :
                null;
        if (delta === null) return;

        if (event.shiftKey) {
            // Shift key makes the delta coarser
            delta *= 100;
        } else if (!event.altKey) {
            // Alt key makes the delta finer
            delta *= 10;
        }

        event.preventDefault();
        resizeBy(delta);
    };

    return <div
        className={classNames(
            style.resizablePanel,
            isVertical ? style.vertical : style.horizontal,
            edge === 'top' && style.topEdge,
            edge === 'bottom' && style.bottomEdge,
            edge === 'left' && style.leftEdge,
            edge === 'right' && style.rightEdge,
            className,
        )}
        ref={panelRef}
        style={{[isVertical ? 'height' : 'width']: panelSize.value}}
    >
        <div
            className={style.splitter}
            ref={resizerRef}
            role="separator"
            aria-label={separatorLabel}
            aria-orientation={isVertical ? 'horizontal' : 'vertical'}
            tabIndex={0}
            onKeyDown={onSeparatorKeyDown}
        />
        {children}
    </div>;
};

export default ResizablePanel;
