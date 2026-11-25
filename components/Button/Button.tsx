import style from './style.module.css';

import type {AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentChildren} from 'preact';
import classNames from 'clsx';
import Icon, {IconType} from '../Icon/Icon';
import {Motif} from '../../util/motif';

export const Button = ({children, className, icon, compact, motif, ...props}: {
    children?: ComponentChildren;
    icon?: IconType;
    compact?: boolean;
    motif?: Motif;
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button type="button" {...props} className={classNames(
            style.button,
            compact && style.compact,
            className,
            motif === Motif.SUCCESS && style.green,
            motif === Motif.WARNING && style.yellow,
            motif === Motif.DANGER && style.red,
        )}>
            {icon && <Icon type={icon} title={null} size={compact ? 16 : undefined} />}
            {/* eslint-disable-next-line eqeqeq */}
            {children != null && !(Array.isArray(children) && children.length === 0) &&
                <span className={style.buttonContents}>
                    {children}
                </span>
            }
        </button>
    );
};

export const LinkButton = ({children, className, icon, compact, motif, ...props}: {
    children: ComponentChildren;
    icon?: IconType;
    compact?: boolean;
    motif?: Motif;
} & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return (
        <a {...props} className={classNames(
            style.button,
            compact && style.compact,
            className,
            motif === Motif.SUCCESS && style.green,
            motif === Motif.WARNING && style.yellow,
            motif === Motif.DANGER && style.red,
        )}>
            {icon && <Icon type={icon} title={null} size={compact ? 16 : undefined} />}
            {/* eslint-disable-next-line eqeqeq */}
            {children != null && !(Array.isArray(children) && children.length === 0) &&
                <span className={style.buttonContents}>
                    {children}
                </span>
            }
        </a>
    );
};
