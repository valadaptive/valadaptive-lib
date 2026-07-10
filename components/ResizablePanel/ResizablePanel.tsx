import {ComponentChildren} from 'preact';
import style from './style.module.css';
import classNames from 'clsx';
import {Signal, useSignal} from '@preact/signals';
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
} => {
    const panelSize = useSignal(initialSize);
    const ac = useRef<AbortController>(null);
    const panel = useRef<HTMLElement | null>(null);
    const panelRef = useCallback((element: HTMLElement | null) => {
        panel.current = element;
    }, [panelSize]);

    const refCallback = useCallback((element: HTMLElement | null) => {
        const isVertical = edge === 'top' || edge === 'bottom';
        if (ac.current) {
            ac.current.abort();
            ac.current = null;
        }
        if (!element) return;
        const abortController = new AbortController();
        ac.current = abortController;
        let onMouseMove: (event: MouseEvent) => void, onMouseUp: (event: MouseEvent) => void;
        const onMouseDown = (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const startPos = isVertical ? event.clientY : event.clientX;
            const rect = panel.current?.getBoundingClientRect();
            if (!rect) return;
            const startSize = isVertical ? rect.height : rect.width;
            onMouseMove = (moveEvent: MouseEvent) => {
                moveEvent.preventDefault();
                moveEvent.stopPropagation();
                let delta = (isVertical ? moveEvent.clientY : moveEvent.clientX) - startPos;
                if (edge === 'top' || edge === 'left') delta *= -1;
                const newSize = startSize + delta;
                panelSize.value = `clamp(${minSize}, ${newSize}px, ${maxSize})`;
            };
            onMouseUp = () => {
                document.removeEventListener('pointermove', onMouseMove);
                document.removeEventListener('pointerup', onMouseUp);
                document.removeEventListener('pointerleave', onMouseUp);
            };
            document.addEventListener('pointermove', onMouseMove, {signal: abortController.signal});
            document.addEventListener('pointerup', onMouseUp, {signal: abortController.signal});
            document.addEventListener('pointerleave', onMouseUp, {signal: abortController.signal});
        };

        if (element) {
            element.addEventListener('pointerdown', onMouseDown, {signal: abortController.signal});
        }
    }, [minSize, maxSize, panelSize, edge]);

    return {
        resizerRef: refCallback,
        panelRef,
        panelSize,
    };
};

const ResizablePanel = ({
    initialSize,
    minSize,
    maxSize,
    edge,
    children,
    className,
}: {
    initialSize: number | string,
    minSize: number | string,
    maxSize: number | string,
    edge: 'top' | 'bottom' | 'left' | 'right',
    children?: ComponentChildren,
    className?: string,
}) => {
    const isVertical = edge === 'top' || edge === 'bottom';
    const {resizerRef, panelRef, panelSize} = useResizablePanel(
        typeof initialSize === 'number' ? `${initialSize}px` : initialSize,
        typeof minSize === 'number' ? `${minSize}px` : minSize,
        typeof maxSize === 'number' ? `${maxSize}px` : maxSize,
        edge,
    );

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
        <div className={style.splitter} ref={resizerRef} />
        {children}
    </div>;
};

export default ResizablePanel;
