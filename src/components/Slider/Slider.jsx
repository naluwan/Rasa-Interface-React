import * as React from 'react';
import cx from 'classnames';
import style from './Slider.module.scss';

// slide
type SlideProps = {
  slideObj: object,
  onClick: (e: React.MouseEvent) => void,
  current: number,
};

const Slide: React.FC<SlideProps> = (props) => {
  const { current, slideObj, onClick } = props;
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);
  const ref = React.useRef();
  // 播放影片
  const playYoutube = (e) => {
    const allopenView = document.querySelectorAll('[data-dis]');
    allopenView.forEach((allopenViewElement) => {
      allopenViewElement.setAttribute('data-dis', 'none');
    });

    const alliframe = document.querySelectorAll('[data-dis] .videoId');
    alliframe.forEach((allIframeElement) => {
      allIframeElement.contentWindow.postMessage(
        '{"event":"command", "func":"pauseVideo", "args":""}',
        '*',
      );
    });

    document
      .querySelector('[data-choose="current"] ')
      .setAttribute('data-dis', 'open');
    const iframea = document.querySelector('[data-choose="current"] .videoId');
    try {
      iframea.contentWindow.postMessage(
        '{"event":"command","func":"playVideo","args":""}',
        '*',
      );
    } catch (error) {
      console.log(error);
    }
    e.stopPropagation();
  };
  // 屬標移動
  const handleMouseMove = (event: any) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    setX(event.clientX - (r.left + Math.floor(r.width / 2)));
    setY(event.clientY - (r.top + Math.floor(r.height / 2)));
  };
  const handleMouseLeave = () => {
    setX(0);
    setY(0);
  };

  const imageLoaded = (event: any) => {
    event.target.style.opacity = 1;
  };
  // 關閉輪播
  const closeSlider = () => {
    const allopenView = document.querySelectorAll('[data-dis]');
    allopenView.forEach((allopenViewElement) => {
      allopenViewElement.setAttribute('data-dis', 'none');
    });
    const alliFrame = document.querySelectorAll('[data-dis] .videoId');
    alliFrame.forEach((alliFrameElement) => {
      alliFrameElement.contentWindow.postMessage(
        '{"event":"command", "func":"pauseVideo", "args":""}',
        '*',
      );
    });
    document
      .querySelector('[data-videoblock]')
      .setAttribute('data-videoblock', 'none');
  };
  const { src, headline, index } = slideObj;
  let anyclass = '';

  if (current === index) anyclass = 'current';
  else if (current - 1 === index) anyclass = 'previous';
  else if (current + 1 === index) anyclass = 'next';

  return (
    <li
      data-dis="none"
      ref={ref}
      data-number={index}
      data-choose={anyclass}
      className={cx(style.slide)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--x': x,
        '--y': y,
      }}
    >
      <button className={cx(style.slide__image_wrapper)} onClick={onClick}>
        <img
          className={cx(style.slide__image)}
          alt={headline}
          src={src}
          onLoad={imageLoaded}
        />
      </button>
      <div className={cx(style.video)}>
        <iframe
          className="videoId"
          type="text/html"
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/n61ULEU7CO0?enablejsapi=1"
          title="YouTube video player"
          frameBorder="0"
        />
      </div>
      <article className={cx(style.slide__content)}>
        <h2 className={cx(style.slide__headline)}>{headline}</h2>
        <button
          className={cx(style.slide__action, style.btn)}
          onClick={playYoutube}
        >
          播放
        </button>
      </article>
      <span className={cx(style.closeBlock)}>
        <button
          data-bs-dismiss="modal"
          type="button"
          aria-label="Close"
          className={cx(style.close)}
          onClick={closeSlider}
        />
      </span>
    </li>
  );
};

// SliderControl
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

// slider
type SliderProps = {
  heading: string,
  slides: object,
};

const Slider: React.FC<SliderProps> = (props) => {
  const { heading, slides } = props;

  // 處理上一個點擊
  const handlePreviousClick = () => {
    let lastpoint = 0;
    const type = Number(
      document
        .querySelector('[data-choose="current"]')
        .getAttribute('data-number'),
    );
    const previous = type - 1;
    if (previous < 0) {
      lastpoint = slides.length - 1;
    } else {
      lastpoint = previous;
    }
    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${lastpoint * 110}%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(lastpoint)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(lastpoint) - 1 !== -1
            ? Number(lastpoint) - 1
            : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(lastpoint) + 1 > slides.length - 1 ? 0 : Number(lastpoint) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };

  // 處理下一個點擊
  const handleNextClick = () => {
    let Nextpoint = 0;
    const type = Number(
      document
        .querySelector('[data-choose="current"]')
        .getAttribute('data-number'),
    );
    const next = type + 1;
    if (next === slides.length) {
      Nextpoint = 0;
    } else {
      Nextpoint = next;
    }
    console.log(slides.length);
    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${Nextpoint * 110}%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(Nextpoint)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(Nextpoint) - 1 !== -1
            ? Number(Nextpoint) - 1
            : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(Nextpoint) + 1 > slides.length - 1 ? 0 : Number(Nextpoint) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };

  // 滑動點擊
  const handleSlideClick = (type) => {
    const allopenView = document.querySelectorAll('[data-dis]');
    allopenView.forEach((allopenViewElement) => {
      allopenViewElement.setAttribute('data-dis', 'none');
    });
    let current = 0;
    if (current !== slides[type].index) {
      current = type;
    }
    const alliframe = document.querySelectorAll('[data-dis] .videoId');
    alliframe.forEach((alliframeElement) => {
      alliframeElement.contentWindow.postMessage(
        '{"event":"command", "func":"pauseVideo", "args":""}',
        '*',
      );
    });
    document
      .querySelector('#wrapperTransform')
      .setAttribute(
        'style',
        `transform:translateX(-${type * 110}%);transition: all .3s;`,
      );
    document
      .querySelector(`#wrapperTransform [data-number="${Number(type)}"]`)
      .setAttribute('data-choose', 'current');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(type) - 1 !== -1 ? Number(type) - 1 : slides.length - 1
        }"]`,
      )
      .setAttribute('data-choose', 'previous');
    document
      .querySelector(
        `#wrapperTransform [data-number="${
          Number(type) + 1 > slides.length - 1 ? 0 : Number(type) + 1
        }"]`,
      )
      .setAttribute('data-choose', 'next');
  };
  const wrapperTransform = {
    transform: `translateX(-${0 * 110}%) transition: all .3s`,
  };
  const headingId = `slider-heading__${heading}`;

  return (
    <div className={cx(style.slider)} aria-labelledby={headingId}>
      <ul
        id="wrapperTransform"
        className={cx(style.slider__wrapper)}
        style={wrapperTransform}
      >
        {slides.map((slide) => {
          return (
            <Slide
              key={slide.index}
              current={0}
              slideObj={slide}
              onClick={() => handleSlideClick(slide.index)}
            />
          );
        })}
      </ul>
      <div className={cx(style.slider__controls)}>
        <SliderControl
          type="previous"
          title="Go to previous slide"
          onClick={handlePreviousClick}
        />

        <SliderControl
          type="next"
          title="Go to next slide"
          onClick={handleNextClick}
        />
      </div>
    </div>
  );
};

export default React.memo(Slider);
