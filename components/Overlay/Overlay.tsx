import style from './style.module.css';

import {ComponentChildren, createContext, createPortal, RefObject} from 'preact';
import {useContext, useRef} from 'preact/hooks';

export const OverlayContext = createContext<RefObject<HTMLDivElement | null> | undefined>(undefined);

/** Component which renders its children under the corresponding {@link OverlayProvider}. */
export const Overlay = ({children}: {children?: ComponentChildren}) => {
    const context = useContext(OverlayContext);
    if (!context?.current) return null;

    return createPortal(children, context.current);
};

export const OverlayProvider = ({children}: {children?: ComponentChildren}) => {
    const ctx = useRef<HTMLDivElement>(null);

    return (
        <OverlayContext.Provider value={ctx}>
            {children}
            <div className={style.overlays} ref={ctx}></div>
        </OverlayContext.Provider>
    );
};
