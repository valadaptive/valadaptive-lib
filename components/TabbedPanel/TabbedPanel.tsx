import style from './style.module.css';

import type {ComponentChild} from 'preact';
import {useSignal, useComputed} from '@preact/signals';
import {useCallback, useId} from 'preact/hooks';
import classNames from 'clsx';

import {navigateGroup} from '../../util/group-navigation';

type Tab = {
    id: string,
    panel: ComponentChild | (() => ComponentChild) | null,
    title: ComponentChild,
    disabled?: boolean
};

type TabbedPanelProps<T extends readonly Tab[]> = {
    tabs: T,
    initialTab: T[number]['id'] | null,
    className?: string,
    auxiliaryItems?: ComponentChild,
};

const isTabDisabled = (tab: Tab): boolean => tab.panel === null || !!tab.disabled;

const TabbedPanel = <T extends readonly Tab[]>({tabs, initialTab, className, auxiliaryItems}: TabbedPanelProps<T>) => {
    const activeTabID = useSignal(initialTab);
    const idPrefix = useId();

    const tabsByID = useComputed(() => {
        const tabsRecord: Record<string, Tab> = {};
        for (const tab of tabs) {
            tabsRecord[tab.id] = tab;
        }
        return tabsRecord;
    });

    const activeTab = activeTabID.value ? tabsByID.value[activeTabID.value] : null;
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
                <div className={style.tabList} role="tablist" onKeyDown={handleKeyDown}>
                    {tabs.map(tab => {
                        const disabled = isTabDisabled(tab);
                        const active = activeTabID.value === tab.id;
                        return (
                            <button
                                key={tab.id}
                                id={tabElemId(tab.id)}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                aria-controls={panelElemId}
                                disabled={disabled}
                                tabIndex={active || (activeTabID.value === null && tab.id === firstEnabledTabID) ?
                                    0 :
                                    -1}
                                className={classNames({
                                    [style.tab]: true,
                                    [style.activeTab]: active,
                                    [style.disabled]: disabled,
                                })}
                                onClick={() => {
                                    if (disabled) return;
                                    activeTabID.value = tab.id;
                                }}
                            >
                                {tab.title}
                            </button>
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
