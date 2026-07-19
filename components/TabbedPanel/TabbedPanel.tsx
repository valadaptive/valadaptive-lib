import style from './style.module.css';

import type {ComponentChild} from 'preact';
import type {Signal} from '@preact/signals';
import {useCallback, useId, useMemo} from 'preact/hooks';
import classNames from 'clsx';

import {navigateGroup} from '../../util/group-navigation';

export type Tab = {
    id: string,
    panel: ComponentChild | (() => ComponentChild) | null,
    title: ComponentChild,
    actions?: ComponentChild,
    disabled?: boolean
};

type TabbedPanelProps<T extends readonly Tab[]> = {
    tabs: T,
    activeTabID: Signal<T[number]['id'] | null>,
    className?: string,
    auxiliaryItems?: ComponentChild,
};

const isTabDisabled = (tab: Tab): boolean => tab.panel === null || !!tab.disabled;

const TabbedPanel = <T extends readonly Tab[]>({tabs, activeTabID, className, auxiliaryItems}: TabbedPanelProps<T>) => {
    const idPrefix = useId();

    const activeTab = useMemo(() => {
        return tabs.find(tab => tab.id === activeTabID.value);
    }, [tabs, activeTabID.value]);
    const tabPanel = activeTab?.panel;

    const tabElemId = (tabId: string) => `${idPrefix}-tab-${tabId}`;
    const panelElemId = `${idPrefix}-panel`;

    // Roving tabindex + arrow-key navigation, with "automatic activation": moving focus to a tab
    // also selects it.
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const enabledTabs = tabs.filter(tab => !isTabDisabled(tab));
        if (enabledTabs.length === 0) return;
        const currentIndex = enabledTabs.findIndex(tab => tab.id === activeTabID.value);
        const newIndex = navigateGroup(event.key, 'horizontal', currentIndex, enabledTabs.length);
        if (newIndex === null) return;
        event.preventDefault();
        const newTab = enabledTabs[newIndex];
        activeTabID.value = newTab.id;
        document.getElementById(tabElemId(newTab.id))?.focus();
    }, [tabs, activeTabID, idPrefix]);

    // If nothing is selected yet, the first enabled tab is the tablist's single tab stop.
    const firstEnabledTabID = tabs.find(tab => !isTabDisabled(tab))?.id ?? null;

    return (
        <div className={classNames(className, style.tabbedPanel)}>
            <div className={style.tabs}>
                {auxiliaryItems && (
                    <div className={style.auxiliaryItems}>
                        {auxiliaryItems}
                    </div>
                )}
                <div className={style.tabList} role="tablist">
                    {tabs.map(tab => {
                        const disabled = isTabDisabled(tab);
                        const active = activeTabID.value === tab.id;
                        return (
                            <div
                                key={tab.id}
                                role="presentation"
                                className={classNames({
                                    [style.tab]: true,
                                    [style.activeTab]: active,
                                    [style.disabled]: disabled,
                                })}
                            >
                                <button
                                    id={tabElemId(tab.id)}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    aria-controls={panelElemId}
                                    disabled={disabled}
                                    tabIndex={active || (activeTabID.value === null && tab.id === firstEnabledTabID) ?
                                        0 :
                                        -1}
                                    className={style.tabButton}
                                    onKeyDown={handleKeyDown}
                                    onClick={() => {
                                        if (disabled) return;
                                        activeTabID.value = tab.id;
                                    }}
                                >
                                    {tab.title}
                                </button>
                                {tab.actions && (
                                    <div className={style.tabActions}>
                                        {tab.actions}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div
                className={style.panel}
                role="tabpanel"
                id={panelElemId}
                aria-labelledby={activeTab ? tabElemId(activeTab.id) : undefined}
            >
                {typeof tabPanel === 'function' ? tabPanel() : tabPanel}
            </div>
        </div>
    );
};

export default TabbedPanel;
