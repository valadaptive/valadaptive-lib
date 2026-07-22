import style from './style.module.css';

import type {AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentChildren} from 'preact';
import classNames from 'clsx';

export const Button = ({children, className, ...props}: {
    children: ComponentChildren
} & ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
        <button type="button" {...props} className={classNames(style.button, className)}>
            <span className={style.buttonContents}>
                {children}
            </span>
        </button>
    );
};

export const LinkButton = ({children, className, ...props}: {
    children: ComponentChildren
} & AnchorHTMLAttributes<HTMLAnchorElement>) => {
    return (
        <a {...props} className={classNames(style.button, className)}>
            <span className={style.buttonContents}>
                {children}
            </span>
        </a>
    );
};
