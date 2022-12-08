/* eslint-disable import/no-duplicates */
/* eslint-disable no-restricted-globals */
import * as React from 'react';
import cx from 'classnames';
import style from './Slide.module.scss';

type SlideProps = {
  slide: object,
  onClick: (e: React.MouseEvent) => void,
  current: number,
};

const Slide: React.FC<SlideProps> = (props) => {
  const { current, slide, onClick } = props;
  // 屬標移動
  const handleMouseMove = (event) => {
    const el = slide.current;
    const r = el.getBoundingClientRect();

    el.style.setProperty(
      '--x',
      event.clientX - (r.left + Math.floor(r.width / 2)),
    );
    el.style.setProperty(
      '--y',
      event.clientY - (r.top + Math.floor(r.height / 2)),
    );
  };
  const handleMouseLeave = () => {
    slide.current.style.setProperty('--x', 0);
    slide.current.style.setProperty('--y', 0);
  };

  const imageLoaded = (event) => {
    event.target.style.opacity = 1;
  };

  const { src, headline, index } = slide;
  let anyclass = '';

  if (current === index) anyclass = 'current';
  else if (current - 1 === index) anyclass = 'previous';
  else if (current + 1 === index) anyclass = 'next';

  return (
    <li
      ref={slide}
      data-number={index}
      data-choose={anyclass}
      className={cx(style.slide)}
      onMouseMove={() => handleMouseMove(event)}
      onMouseLeave={() => handleMouseLeave(event)}
      onClick={onClick}
    >
      <div className={cx(style.slide__image_wrapper)}>
        <img
          className={cx(style.slide__image)}
          alt={headline}
          src={src}
          onLoad={() => imageLoaded(event)}
        />
        {/* <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/n61ULEU7CO0"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autop"
        /> */}
      </div>
      {/* <article className={cx(style.slide__content)}>
        <h2 className={cx(style.slide__headline)}>{headline}</h2>
        <button className={cx(style.slide__action, style.btn)}>播放</button>
      </article> */}
    </li>
  );
};

export default React.memo(Slide);
