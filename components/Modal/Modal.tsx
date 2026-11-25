import type {JSX, ComponentChildren} from 'preact';
import style from './style.module.css';
import classnames from 'clsx';
import Icon, {CloseButton, IconType} from '../Icon/Icon';
import {useId} from 'preact/hooks';

const Modal = ({onClose, title, icon, children, className, 'aria-label': label}: {
    onClose?: (event: Event) => unknown;
    /** If provided, renders a header with the title and close button. Omit if the dialog renders its own header. */
    title?: string;
    icon?: IconType;
    children: ComponentChildren;
    className?: string;
    /** Accessible name for the dialog when no `title` is provided. */
    'aria-label'?: string;
}): JSX.Element => {
    const titleId = useId();

    return (
        <div className={style.modalWrapper}>
            <div className={style.modalBg} onClick={onClose} />
            <div className={style.modalPositioner}>
                <div
                    className={classnames(style.modal, className)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title !== undefined ? titleId : undefined}
                    aria-label={title === undefined ? label : undefined}
                >
                    {title !== undefined &&
                        <header className={style.modalHeader}>
                            <div className={style.modalHeaderLeft}>
                                {icon && <Icon type={icon} title={null} size="1em" />}
                                <span className={style.modalTitle} id={titleId}>{title}</span>
                            </div>
                            {onClose && <CloseButton onClick={onClose} className={style.closeButton} />}
                        </header>}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
