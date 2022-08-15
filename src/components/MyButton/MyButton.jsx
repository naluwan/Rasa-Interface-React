import * as React from 'react';
import cx from 'classnames';
import style from './MyButton.module.css';

type MyButtonProps = {
  onClick?: () => void,
  rounded: boolean,
  color?: string,
  className?: string,
  variant: 'primary' | 'secondary',
};

const MyButton: React.FC<MyButtonProps> = (props) => {
  const {
    onClick,
    children,
    rounded,
    className,
    color = 'black',
    variant = 'primary',
  } = props;
  const attrStyle = {
    color,
  };
  return (
    <button
      style={attrStyle}
      data-variant={variant}
      className={cx(style.root, className)}
      type="button"
      data-rounded={rounded}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default React.memo(MyButton);
