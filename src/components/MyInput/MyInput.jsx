import * as React from 'react';
import cx from 'classnames';
import style from './MyInput.module.scss';

type MyInputProps = {
  variant: 'password' | 'secondary',
  className?: string,
  placeholder: string,
  required: string,
};

// eslint-disable-next-line no-unused-vars, consistent-return
const MyInput: React.FC<MyInputProps> = (props) => {
  const { variant, className, placeholder, required, onChange } = props;
  if (variant === 'password') {
    return (
      <input
        type="password"
        id="password"
        name="password"
        placeholder="請輸入密碼"
        className={cx(style.root, className)}
        data-variant={variant}
        required={required}
        onChange={onChange}
      />
    );
  }
  if (variant === 'email') {
    return (
      <input
        type="email"
        id="email"
        name="email"
        placeholder="請輸入E-mail"
        className={cx(style.root, className)}
        data-variant={variant}
        required={required}
        onChange={onChange}
      />
    );
  }
  <input
    type="text"
    id="email"
    name="email"
    placeholder={placeholder}
    className={cx(style.root, className)}
    data-variant={variant}
    required={required}
  />;
};

export default React.memo(MyInput);
