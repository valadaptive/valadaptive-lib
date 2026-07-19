import style from './style.module.css';

import {ComponentChildren, FunctionComponent, createContext} from 'preact';
import {Signal, useComputed, useSignal} from '@preact/signals';
import {useCallback, useContext, useLayoutEffect, useRef} from 'preact/hooks';
import classNames from 'clsx';

import FakeImmutable from '../../util/fake-immutable';
import {Motif} from '../../util/motif';

import Icon, {IconButton} from '../Icon/Icon';
import {Overlay} from '../Overlay/Overlay';

type ToastInnerComponent = FunctionComponent<{
    closeToast: () => void;
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
}> | Exclude<ComponentChildren, Function>;

type ToastInnerComponentHack = FunctionComponent<{
    closeToast: () => void;
}> | Exclude<ComponentChildren, object>;

type ToastCtxTy = {
    toasts: Signal<FakeImmutable<{inner: ComponentChildren}[]>>;
    addToast: (options: AddToastOptions) => void;
};

const ToastContext = createContext<ToastCtxTy | undefined>(undefined);

const Toast = ({children, toastRef, closeToast, showCloseButton, timeout, motif = Motif.PRIMARY, title}: {
    children?: ComponentChildren;
    toastRef: (elem: HTMLDivElement | null) => void;
    closeToast: () => void;
    showCloseButton: boolean;
    timeout?: number;
    motif?: Motif;
    title?: ComponentChildren;
}) => {

    let iconType, iconTitle;
    switch (motif) {
        case Motif.SUCCESS:
            iconType = 'check' as const;
            iconTitle = 'Success' as const;
            break;
        case Motif.WARNING:
            iconType = 'warning' as const;
            iconTitle = 'Warning' as const;
            break;
        case Motif.ERROR:
            iconType = 'error' as const;
            iconTitle = 'Error' as const;
            break;
    }

    useLayoutEffect(() => {
        if (typeof timeout === 'number') {
            const timeoutId = setTimeout(closeToast, timeout);
            return () => clearTimeout(timeoutId);
        }
    }, []);

    // Announce toasts to screen readers when they appear; errors interrupt, the rest wait their turn
    const isUrgent = motif === Motif.ERROR || motif === Motif.WARNING;

    return (
        <div className={style.toastWrapper} ref={toastRef}>
            <div
                role={isUrgent ? 'alert' : 'status'}
                aria-live={isUrgent ? 'assertive' : 'polite'}
                className={classNames(style.toast, {
                    [style.primary]: motif === Motif.PRIMARY,
                    [style.success]: motif === Motif.SUCCESS,
                    [style.warning]: motif === Motif.WARNING,
                    [style.error]: motif === Motif.ERROR,
                })}
            >
                <div className={style.toastRow}>
                    {motif === Motif.PRIMARY ?
                        null :
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                        <Icon type={iconType!} title={iconTitle!} className={style.toastIcon} />}
                    {typeof title === 'undefined' || title === null ?
                        <div className={style.toastContents}>
                            {children}
                        </div> :
                        <div className={classNames(style.toastTitle, typeof title !== 'object' && style.plain)}>
                            {title}
                        </div>
                    }
                    {showCloseButton && <IconButton
                        type='close'
                        title='Close'
                        onClick={closeToast}
                    />}
                </div>
                {typeof title === 'undefined' || title === null ?
                    null :
                    <div className={classNames(style.toastContents, style.separateContents)}>
                        {children}
                    </div>}
                {typeof timeout === 'number' &&
                    <div className={style.timeoutBar} style={{animationDuration: `${timeout}ms`}} />}
            </div>
        </div>
    );
};

const ToastDisplay = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('ToastDisplay must be placed under a ToastProvider');

    const toasts = useComputed(() => context.toasts.value.value.map(t => t.inner));

    return (
        <Overlay>
            <div className={style.toastContainer}>
                {toasts}
            </div>
        </Overlay>
    );
};

export type AddToastOptions = Partial<{
    motif: Motif;
    showCloseButton: boolean;
    timeout: number;
}> & (
    {title: ToastInnerComponent; contents?: ToastInnerComponent} |
    {title?: ToastInnerComponent; contents: ToastInnerComponent}
);

export const useAddToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useAddToast requires a ToastProvider');

    return useCallback((options: AddToastOptions) => {
        context.addToast(options);
    }, [context]);
};

export const useAddErrorToast = () => {
    const addToast = useAddToast();

    return useCallback((title: string, error: unknown) => {
        addToast({
            motif: Motif.ERROR,
            title,
            contents: <>
                <div className={style.errorMessage}>{String(error)}</div>
                {typeof error === 'object' && error !== null && 'stack' in error ?
                    <details className={style.errorStack}>
                        <summary>Stack trace</summary>
                        <code className={style.errorStackTrace}>{(error as Error).stack}</code>
                    </details> :
                    null}
            </>,
        });
    }, []);
};

const ToastPlaceholder = ({height, onCollapsed}: {height: number; onCollapsed: () => void}) => {
    const collapse = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;
        // Unlike a CSS transition, the animation's finished promise settles even with a duration
        // of 0, so reduced motion can collapse instantly without breaking the cleanup
        const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 175;
        void node.animate(
            {minHeight: [`${height}px`, '0px']},
            {duration, easing: 'ease-out'},
        ).finished.then(onCollapsed, () => {
            // Canceled (e.g. the whole toast display unmounted); nothing to clean up
        });
    }, []);

    return <div className={style.toastPlaceholder} ref={collapse} />;
};

export const ToastProvider = ({children}: {children?: ComponentChildren}) => {
    const toastsSignal = useSignal(FakeImmutable.create([] as {inner: ComponentChildren}[]));
    const ctx = useRef<ToastCtxTy | undefined>(undefined);
    const idCounter = useRef(0);

    const addToast = useCallback((options: AddToastOptions) => {
        let ref: HTMLDivElement | null = null;
        const id = idCounter.current++;

        const updateRef = (elem: HTMLDivElement | null) => {
            ref = elem;
        };

        const closeToast = () => {
            toastsSignal.value = toastsSignal.value.update(toasts => {
                const toastIndex = toasts.indexOf(box);
                if (toastIndex === -1) return;

                const removedHeight = ref?.getBoundingClientRect()?.height ?? 0;

                const onCollapsed = () => {
                    toastsSignal.value = toastsSignal.value.update(toasts => {
                        // We need to calculate the index again as an earlier toast could've been removed during the
                        // collapse animation.
                        const toastIndex = toasts.indexOf(box);
                        if (toastIndex === -1) return;
                        toasts.splice(toastIndex, 1);
                        return toasts;
                    });
                };

                const toastPlaceholder = <ToastPlaceholder
                    key={id}
                    height={removedHeight}
                    onCollapsed={onCollapsed}
                />;
                toasts[toastIndex].inner = toastPlaceholder;

                return toasts;
            });
        };

        const ToastTitle = options.title as ToastInnerComponentHack;
        const ToastContents = options.contents as ToastInnerComponentHack;

        const box = {
            inner: <Toast
                key={id}
                toastRef={updateRef}
                motif={options.motif}
                showCloseButton={options.showCloseButton ?? true}
                timeout={options.timeout}
                closeToast={closeToast}
                title={typeof ToastTitle === 'function' ? <ToastTitle closeToast={closeToast} /> : ToastTitle}
            >
                {typeof ToastContents === 'function' ? <ToastContents closeToast={closeToast} /> : ToastContents}
            </Toast>,
        };

        toastsSignal.value = toastsSignal.value.update(toasts => {
            toasts.push(box);
            return toasts;
        });
    }, []);

    if (!ctx.current) {
        ctx.current = {
            toasts: toastsSignal,
            addToast,
        };
    }

    return (
        <ToastContext.Provider value={ctx.current}>
            <ToastDisplay />
            {children}
        </ToastContext.Provider>
    );
};
