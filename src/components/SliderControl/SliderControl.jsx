import * as React from 'react';
import cx from 'classnames';
import style from './SliderControl.module.scss';

type SliderControlProps = {
  title: String,
  onClick: (e: React.MouseEvent) => void,
  type: String,
};

const SliderControl: React.FC<SliderControlProps> = (props) => {
  const { type, title, onClick } = props;
  const btnType = ` btn--${type}`;
  return (
    <button
      type={type}
      className={cx(style.btn, style[btnType])}
      title={title}
      onClick={onClick}
    >
      <svg
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 12L0 6L6 0L7.4 1.4L2.8 6L7.4 10.6L6 12Z" fill="#fff" />
      </svg>
    </button>
  );
};

export default React.memo(SliderControl);
