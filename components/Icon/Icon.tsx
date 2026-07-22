import './style.css';

import type {JSX, Ref} from 'preact';
import classNames from 'clsx';

import {Motif} from '../../util/motif';

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
                    'motif-error': motif === Motif.ERROR,
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

export const IconButton = ({
    type,
    title,
    size,
    onClick,
    onMouseDown,
    disabled,
    motif,
    className,
    innerRef,
}: {
    type: IconType;
    title: string;
    size?: string | number;
    onClick?: (event: MouseEvent) => unknown;
    onMouseDown?: (event: MouseEvent) => unknown;
    disabled?: boolean;
    motif?: Motif;
    className?: string;
    innerRef?: Ref<HTMLButtonElement>;
}): JSX.Element => {
    return (
        <button
            type="button"
            className={classNames(
                'icon-button',
                {
                    'icon-disabled': disabled,
                    'motif-primary': motif === Motif.PRIMARY,
                    'motif-success': motif === Motif.SUCCESS,
                    'motif-warning': motif === Motif.WARNING,
                    'motif-error': motif === Motif.ERROR,
                    'motif-monochrome': motif === Motif.MONOCHROME,
                },
                className,
            )}
            onClick={disabled ? undefined : onClick}
            onMouseDown={disabled ? undefined : onMouseDown}
            role="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            ref={innerRef}
        >
            <Icon
                type={type}
                title={null}
                size={size}
                motif={motif}
            />
        </button>
    );
};
