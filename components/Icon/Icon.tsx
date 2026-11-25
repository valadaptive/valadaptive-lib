import './style.css';

import type {JSX, Ref} from 'preact';
import classNames from 'clsx';

import {Motif} from '../../util/motif';
import {Button} from '../Button/Button';

export type IconType =
    | 'arrow-down'
    | 'arrow-right'
    | 'arrow-up'
    | 'arrow-left'
    | 'cancel'
    | 'check'
    | 'close'
    | 'copy'
    | 'download'
    | 'edit'
    | 'effect'
    | 'error'
    | 'file'
    | 'folder'
    | 'funnel'
    | 'gear'
    | 'github'
    | 'globe'
    | 'link'
    | 'menu'
    | 'paste'
    | 'pause'
    | 'play'
    | 'pin'
    | 'plus'
    | 'range'
    | 'redo'
    | 'reset'
    | 'search'
    | 'select-arrow-down'
    | 'select-arrow-right'
    | 'select-arrow-up'
    | 'select-arrow-left'
    | 'speaker'
    | 'speaker-mute'
    | 'stack'
    | 'undo'
    | 'upload'
    | 'warning';

const Icon = ({type, title, size, motif, className, clickableStyle}: {
    type: IconType;
    title: string | null;
    size?: string | number;
    motif?: Motif;
    className?: string;
    clickableStyle?: boolean;
}): JSX.Element => {
    const cssSize = typeof size === 'string' ? size : typeof size === 'number' ? `${size}px` : undefined;
    const inlineStyle = cssSize ? {
        width: cssSize,
        height: cssSize,
    } : undefined;
    // The icon is just a mask-image on a div, so it's invisible to assistive technology unless
    // we give it an explicit role and label. An icon without a title is decorative; hide it.
    const hasLabel = typeof title === 'string' && title !== '';
    return (
        <div
            className={classNames(
                'icon',
                `icon-${type}`,
                {
                    'motif-primary': motif === Motif.PRIMARY,
                    'motif-success': motif === Motif.SUCCESS,
                    'motif-warning': motif === Motif.WARNING,
                    'motif-danger': motif === Motif.DANGER,
                    'motif-monochrome': motif === Motif.MONOCHROME,
                    'icon-clickable': clickableStyle,
                },
                className,
            )}
            style={inlineStyle}
            title={title ?? undefined}
            role={hasLabel ? 'img' : undefined}
            aria-label={hasLabel ? title : undefined}
            aria-hidden={hasLabel ? undefined : true}
        />
    );
};

export default Icon;

export const CloseButton = ({
    size,
    onClick,
    disabled,
    title,
    className,
}: {
    size?: string | number;
    onClick?: (event: MouseEvent) => unknown;
    disabled?: boolean;
    title?: string;
    className?: string;
}): JSX.Element => {
    return (
        <button
            type="button"
            className={classNames(
                'icon-button',
                disabled && 'icon-disabled',
                className,
            )}
            onClick={disabled ? undefined : onClick}
            role="button"
            title={title ?? 'Close'}
            aria-label={title ?? 'Close'}
            disabled={disabled}
        >
            <Icon
                type="close"
                title={null}
                size={size}
            />
        </button>
    );
};
export const IconButton = ({
    type,
    title,
    compact,
    motif,
    onClick,
    onMouseDown,
    disabled,
    className,
    innerRef,
}: {
    type: IconType;
    title: string;
    compact?: boolean;
    motif?: Motif;
    onClick?: (event: MouseEvent) => unknown;
    onMouseDown?: (event: MouseEvent) => unknown;
    disabled?: boolean;
    className?: string;
    innerRef?: Ref<HTMLButtonElement>;
}): JSX.Element => {
    return (
        <Button
            icon={type}
            title={title}
            compact={compact}
            motif={motif}
            onClick={onClick}
            onMouseDown={onMouseDown}
            disabled={disabled}
            className={className}
            ref={innerRef}
        />
    );
};
