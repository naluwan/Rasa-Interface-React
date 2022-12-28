import * as React from 'react';
import cx from 'classnames';
import style from './MyButton.module.scss';

type MyButtonProps = {
  icon: string,
  disabled: boolean,
  dataTestId: string,
  onClick: (e: React.MouseEvent) => void,
  rounded: boolean,
  id: string,
  color?: string,
  className?: string,
  variant: 'primary' | 'secondary' | 'nostyle' | 'third',
  dataBsToggle: string,
  dataBsTarget: string,
};

const MyButton: React.FC<MyButtonProps> = (props) => {
  const {
    icon,
    onClick,
    disabled,
    children,
    dataTestId,
    rounded,
    className,
    color,
    id,
    variant,
    dataBsToggle,
    dataBsTarget,
  } = props;
  const attrStyle = {
    color,
  };
  return (
    <button
      id={id}
      data-testid={dataTestId}
      style={attrStyle}
      disabled={disabled}
      data-variant={variant}
      className={cx(style.root, className)}
      type="button"
      data-rounded={rounded}
      onClick={onClick}
      data-bs-toggle={dataBsToggle}
      data-bs-target={dataBsTarget}
    >
      {icon}
      {children}
    </button>
  );
};

export default React.memo(MyButton);
