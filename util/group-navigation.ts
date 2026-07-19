/**
 * Compute the destination index for arrow-key navigation within a group of items (menu items,
 * tabs, etc.), following the ARIA authoring practices: arrows move through the group and wrap
 * at the ends, Home/End jump to the first/last item.
 *
 * Callers are responsible for filtering out disabled items before computing indices, and for
 * applying the result (moving focus, updating selection, calling preventDefault).
 * @param key The pressed key, as in KeyboardEvent.key.
 * @param orientation Which arrow pair navigates the group: 'horizontal' for Left/Right (e.g.
 * tabs), 'vertical' for Up/Down (e.g. menus).
 * @param currentIndex Index of the current item, or -1 if none (the next-arrow then lands on
 * the first item and the previous-arrow on the last).
 * @param itemCount Number of items in the group; must be at least 1.
 * @returns The new index, or null if the key doesn't navigate the group.
 */
export const navigateGroup = (
    key: string,
    orientation: 'horizontal' | 'vertical',
    currentIndex: number,
    itemCount: number,
): number | null => {
    const [prevKey, nextKey] = orientation === 'horizontal' ?
        ['ArrowLeft', 'ArrowRight'] :
        ['ArrowUp', 'ArrowDown'];
    switch (key) {
        case prevKey:
            return currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
        case nextKey:
            return currentIndex === itemCount - 1 ? 0 : currentIndex + 1;
        case 'Home':
            return 0;
        case 'End':
            return itemCount - 1;
        default:
            return null;
    }
};
