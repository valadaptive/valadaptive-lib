import style from './style.module.scss';

import type {ComponentChildren} from 'preact';
import {useCallback} from 'preact/hooks';
import type {Signal} from '@preact/signals';

import Icon from '../Icon/Icon';
import {Motif} from '../../util/motif';

export const CollapsibleHeader = ({collapsed, bodyId, children, auxiliaryItems, className}: {
    collapsed: Signal<boolean>;
    bodyId: string;
    children: ComponentChildren;
    auxiliaryItems?: ComponentChildren;
    className?: string;
}) => {
    const toggleCollapsed = useCallback(() => {
        collapsed.value = !collapsed.value;
    }, [collapsed]);

    return (
        <header className={className}>
            <button
                className={style.collapsibleHeaderTitle}
                aria-expanded={collapsed.value ? 'false' : 'true'}
                aria-controls={bodyId}
                onClick={toggleCollapsed}
            >
                <Icon type={collapsed.value ? 'arrow-right' : 'arrow-down'} title={null} motif={Motif.MONOCHROME} />
                <span className={style.collapsibleHeaderTitleText}>
                    {children}
                </span>
            </button>
            {auxiliaryItems}
        </header>
    );
};
