/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-expressions */
import * as React from 'react';
import { NavItemType } from 'components/types';
import shallow from 'zustand/shallow';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { CgSpinner } from 'react-icons/cg';
import yaml from 'js-yaml';
// import NavItem from './NavItem';
import style from './NavBar.module.scss';
// import Authenticate from '../../containers/Authenticate';
import useStoryStore from '../../store/useStoryStore';
import type { State } from '../types';

type NavBarProps = {
  navItems: NavItemType[],
  nowMode: State,
  atChangeMode: (e: String) => void,
};

const NavBar: React.FC<NavBarProps> = (props) => {
  const { atChangeMode, nowMode } = props;
  const {
    user,
    rasaTrainState,
    stories,
    nlu,
    config,
    domain,
    cloneData,
    currentPage,
    onLogout,
    onSetCurrentPage,
    trainRasa,
  } = useStoryStore((state: State) => {
    return {
      user: state.user,
      rasaTrainState: state.rasaTrainState,
      stories: state.stories,
      nlu: state.nlu,
      domain: state.domain,
      config: state.config,
      cloneData: state.cloneData,
      currentPage: state.currentPage,
      onLogout: state.onLogout,
      onSetCurrentPage: state.onSetCurrentPage,
      trainRasa: state.trainRasa,
    };
  }, shallow);
  const [PersonOption, setPersonOption] = React.useState('none');
  const trainData = React.useMemo(() => {
    const today = new Date().toLocaleString('zh-Hant', { hour12: false });
    const date = today.split(' ')[0].replace(/\//g, '');
    const time = today.split(' ')[1].replace(/:/g, '');
    const data = {
      stories: yaml.dump({ stories }),
      domain: yaml.dump(domain),
      config: yaml.dump(config),
      nlu: { nlu },
      fixed_model_name: `model-${date}T${time}`,
    };

    return data;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, nlu, domain, config, cloneData]);
  //   (currentData: ApiTrainDataType) => {
  //     fetch(`http://192.168.10.105:5005/status`)
  //       .then((res) => {
  //         return res.json();
  //       })
  //       .then((data) => {
  //         return data.num_active_training_jobs;
  //       })
  //       .then((state) => {
  //         if (!state) {
  //           onSetRasaTrainState(1);
  //           console.log('currentData:', currentData);
  //           fetch(
  //             'http://192.168.10.105:5005/model/train?save_to_default_model_directory=true&force_training=true',
  //             {
  //               method: 'post',
  //               body: JSON.stringify(currentData),
  //               headers: {
  //                 'content-Type': 'application/json',
  //               },
  //             },
  //           )
  //             .then((res) => res.headers.get('filename'))
  //             .then((fileName) => {
  //               const payload = {
  //                 model_file: `/home/bill/Work/BF36_RASA_2.8.31_spacy/models/${fileName}`,
  //               };
  //               return fetch('http://192.168.10.105:5005/model', {
  //                 method: 'put',
  //                 body: JSON.stringify(payload),
  //                 headers: {
  //                   'content-Type': 'application/json',
  //                 },
  //               });
  //             })
  //             .then((res) => {
  // if (res.status === 204) {
  //   onSetRasaTrainState(0);
  // }
  //             });
  //         } else {
  // onSetRasaTrainState(state);
  // Toast.fire({
  //   icon: 'warning',
  //   title: '機器人訓練中，請稍後',
  // });
  //         }
  //       });
  //   },
  //   [onSetRasaTrainState],
  // );

  return (
    <nav className={cx(style.navbar)}>
      <div>
        <div className={cx(style.logo)}>
          <Link
            className={cx('navbar-brand', style.logoIcon)}
            onClick={() => onSetCurrentPage('首頁')}
            to="/"
          />
          <div>
            <h6> chat Bot</h6>
          </div>
        </div>
        <div className={cx(style.list)}>
          <div
            className={
              nowMode === ('scenario' || 'storeChid')
                ? cx(style.btn, style.btnCheck)
                : cx(style.btn)
            }
            onClick={() => atChangeMode('scenario')}
          >
            <div className={cx(style.icon)}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 20"
                fill=""
                stroke="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.25 0H16.25C16.913 0 17.5489 0.263392 18.0178 0.732233C18.4866 1.20107 18.75 1.83696 18.75 2.5V15C18.75 15.663 18.4866 16.2989 18.0178 16.7678C17.5489 17.2366 16.913 17.5 16.25 17.5C16.25 18.163 15.9866 18.7989 15.5178 19.2678C15.0489 19.7366 14.413 20 13.75 20H3.75C3.08696 20 2.45107 19.7366 1.98223 19.2678C1.51339 18.7989 1.25 18.163 1.25 17.5H2.5C2.5 17.8315 2.6317 18.1495 2.86612 18.3839C3.10054 18.6183 3.41848 18.75 3.75 18.75H13.75C14.0815 18.75 14.3995 18.6183 14.6339 18.3839C14.8683 18.1495 15 17.8315 15 17.5V5C15 4.66848 14.8683 4.35054 14.6339 4.11612C14.3995 3.8817 14.0815 3.75 13.75 3.75H3.75C3.41848 3.75 3.10054 3.8817 2.86612 4.11612C2.6317 4.35054 2.5 4.66848 2.5 5H1.25C1.25 4.33696 1.51339 3.70107 1.98223 3.23223C2.45107 2.76339 3.08696 2.5 3.75 2.5H13.75C14.413 2.5 15.0489 2.76339 15.5178 3.23223C15.9866 3.70107 16.25 4.33696 16.25 5V16.25C16.5815 16.25 16.8995 16.1183 17.1339 15.8839C17.3683 15.6495 17.5 15.3315 17.5 15V2.5C17.5 2.16848 17.3683 1.85054 17.1339 1.61612C16.8995 1.3817 16.5815 1.25 16.25 1.25H6.25C5.91848 1.25 5.60054 1.3817 5.36612 1.61612C5.1317 1.85054 5 2.16848 5 2.5H3.75C3.75 1.83696 4.01339 1.20107 4.48223 0.732233C4.95107 0.263392 5.58696 0 6.25 0Z"
                  fill=""
                  stroke="none"
                />
                <path
                  d="M1.25 7.5V6.875C1.25 6.70924 1.31585 6.55027 1.43306 6.43306C1.55027 6.31585 1.70924 6.25 1.875 6.25C2.04076 6.25 2.19973 6.31585 2.31694 6.43306C2.43415 6.55027 2.5 6.70924 2.5 6.875V7.5H3.125C3.29076 7.5 3.44973 7.56585 3.56694 7.68306C3.68415 7.80027 3.75 7.95924 3.75 8.125C3.75 8.29076 3.68415 8.44973 3.56694 8.56694C3.44973 8.68415 3.29076 8.75 3.125 8.75H0.625C0.45924 8.75 0.300269 8.68415 0.183058 8.56694C0.065848 8.44973 0 8.29076 0 8.125C0 7.95924 0.065848 7.80027 0.183058 7.68306C0.300269 7.56585 0.45924 7.5 0.625 7.5H1.25ZM1.25 11.25V10.625C1.25 10.4592 1.31585 10.3003 1.43306 10.1831C1.55027 10.0658 1.70924 10 1.875 10C2.04076 10 2.19973 10.0658 2.31694 10.1831C2.43415 10.3003 2.5 10.4592 2.5 10.625V11.25H3.125C3.29076 11.25 3.44973 11.3158 3.56694 11.4331C3.68415 11.5503 3.75 11.7092 3.75 11.875C3.75 12.0408 3.68415 12.1997 3.56694 12.3169C3.44973 12.4342 3.29076 12.5 3.125 12.5H0.625C0.45924 12.5 0.300269 12.4342 0.183058 12.3169C0.065848 12.1997 0 12.0408 0 11.875C0 11.7092 0.065848 11.5503 0.183058 11.4331C0.300269 11.3158 0.45924 11.25 0.625 11.25H1.25ZM1.25 14.375V15H0.625C0.45924 15 0.300269 15.0658 0.183058 15.1831C0.065848 15.3003 0 15.4592 0 15.625C0 15.7908 0.065848 15.9497 0.183058 16.0669C0.300269 16.1842 0.45924 16.25 0.625 16.25H3.125C3.29076 16.25 3.44973 16.1842 3.56694 16.0669C3.68415 15.9497 3.75 15.7908 3.75 15.625C3.75 15.4592 3.68415 15.3003 3.56694 15.1831C3.44973 15.0658 3.29076 15 3.125 15H2.5V14.375C2.5 14.2092 2.43415 14.0503 2.31694 13.9331C2.19973 13.8158 2.04076 13.75 1.875 13.75C1.70924 13.75 1.55027 13.8158 1.43306 13.9331C1.31585 14.0503 1.25 14.2092 1.25 14.375Z"
                  fill=""
                  stroke="none"
                />
              </svg>
            </div>
            <div>
              <h6>情境劇本</h6>
            </div>
          </div>
          <div
            className={
              nowMode === 'statement'
                ? cx(style.btn, style.btnCheck)
                : cx(style.btn)
            }
            onClick={() => atChangeMode('statement')}
          >
            <div className={cx(style.icon)}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 20"
                fill=""
                stroke="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_658_1135)">
                  <path
                    d="M17.5 1.25C17.8315 1.25 18.1495 1.3817 18.3839 1.61612C18.6183 1.85054 18.75 2.16848 18.75 2.5V12.5C18.75 12.8315 18.6183 13.1495 18.3839 13.3839C18.1495 13.6183 17.8315 13.75 17.5 13.75H14.375C13.9869 13.75 13.6041 13.8404 13.257 14.0139C12.9098 14.1875 12.6079 14.4395 12.375 14.75L10 17.9163L7.625 14.75C7.39213 14.4395 7.09017 14.1875 6.74303 14.0139C6.3959 13.8404 6.01311 13.75 5.625 13.75H2.5C2.16848 13.75 1.85054 13.6183 1.61612 13.3839C1.3817 13.1495 1.25 12.8315 1.25 12.5V2.5C1.25 2.16848 1.3817 1.85054 1.61612 1.61612C1.85054 1.3817 2.16848 1.25 2.5 1.25H17.5ZM2.5 0C1.83696 0 1.20107 0.263392 0.732233 0.732233C0.263392 1.20107 0 1.83696 0 2.5L0 12.5C0 13.163 0.263392 13.7989 0.732233 14.2678C1.20107 14.7366 1.83696 15 2.5 15H5.625C5.81906 15 6.01045 15.0452 6.18402 15.132C6.35759 15.2188 6.50857 15.3448 6.625 15.5L9 18.6662C9.11643 18.8215 9.26741 18.9475 9.44098 19.0343C9.61455 19.1211 9.80594 19.1663 10 19.1663C10.1941 19.1663 10.3854 19.1211 10.559 19.0343C10.7326 18.9475 10.8836 18.8215 11 18.6662L13.375 15.5C13.4914 15.3448 13.6424 15.2188 13.816 15.132C13.9896 15.0452 14.1809 15 14.375 15H17.5C18.163 15 18.7989 14.7366 19.2678 14.2678C19.7366 13.7989 20 13.163 20 12.5V2.5C20 1.83696 19.7366 1.20107 19.2678 0.732233C18.7989 0.263392 18.163 0 17.5 0L2.5 0Z"
                    fill=""
                    stroke="none"
                  />
                  <path
                    d="M8.83253 5.95083C8.58903 5.57164 8.22905 5.28172 7.80667 5.12466C7.38429 4.96759 6.92234 4.95185 6.49026 5.07981C6.05817 5.20778 5.67929 5.47252 5.41056 5.83427C5.14183 6.19601 4.99777 6.6352 5.00003 7.08583C5.00025 7.459 5.10068 7.82526 5.29083 8.14635C5.48098 8.46744 5.75386 8.73158 6.08097 8.91116C6.40809 9.09075 6.77743 9.1792 7.1504 9.16727C7.52338 9.15533 7.88631 9.04346 8.20128 8.84333C8.03753 9.32958 7.73253 9.84833 7.23003 10.3683C7.13389 10.4678 7.08119 10.6014 7.08354 10.7397C7.08588 10.878 7.14307 11.0097 7.24253 11.1058C7.34198 11.202 7.47556 11.2547 7.61387 11.2523C7.75217 11.25 7.88389 11.1928 7.98003 11.0933C9.83753 9.16833 9.59628 7.07583 8.83253 5.95333V5.95083ZM13.8325 5.95083C13.589 5.57164 13.229 5.28172 12.8067 5.12466C12.3843 4.96759 11.9223 4.95185 11.4903 5.07981C11.0582 5.20778 10.6793 5.47252 10.4106 5.83427C10.1418 6.19601 9.99777 6.6352 10 7.08583C10.0003 7.459 10.1007 7.82526 10.2908 8.14635C10.481 8.46744 10.7539 8.73158 11.081 8.91116C11.4081 9.09075 11.7774 9.1792 12.1504 9.16727C12.5234 9.15533 12.8863 9.04346 13.2013 8.84333C13.0375 9.32958 12.7325 9.84833 12.23 10.3683C12.1339 10.4678 12.0812 10.6014 12.0835 10.7397C12.0859 10.878 12.1431 11.0097 12.2425 11.1058C12.342 11.202 12.4756 11.2547 12.6139 11.2523C12.7522 11.25 12.8839 11.1928 12.98 11.0933C14.8375 9.16833 14.5963 7.07583 13.8325 5.95333V5.95083Z"
                    fill=""
                    stroke="none"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_658_1135">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div>
              <h6>語句庫</h6>
            </div>
          </div>
          <div
            className={
              nowMode === 'formsDesigan'
                ? cx(style.btn, style.btnCheck)
                : cx(style.btn)
            }
            onClick={() => atChangeMode('formsDesigan')}
          >
            <div className={cx(style.icon)}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 20"
                fill=""
                stroke="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 2.5C0 2.16848 0.131696 1.85054 0.366117 1.61612C0.600537 1.3817 0.918479 1.25 1.25 1.25H18.75C19.0815 1.25 19.3995 1.3817 19.6339 1.61612C19.8683 1.85054 20 2.16848 20 2.5V17.5C20 17.8315 19.8683 18.1495 19.6339 18.3839C19.3995 18.6183 19.0815 18.75 18.75 18.75H1.25C0.918479 18.75 0.600537 18.6183 0.366117 18.3839C0.131696 18.1495 0 17.8315 0 17.5V2.5ZM10.625 2.5V12.5H18.75V2.5H10.625ZM10.625 13.75V17.5H18.75V13.75H10.625ZM9.375 2.5H1.25V6.25H9.375V2.5ZM1.25 17.5H9.375V7.5H1.25V17.5Z"
                  fill=""
                  stroke="none"
                />
              </svg>
            </div>
            <div>
              <h6>表單設計</h6>
            </div>
          </div>
          <div
            className={
              nowMode === 'createStories'
                ? cx(style.btn, style.create, style.btnCheck)
                : cx(style.create, style.btn)
            }
            onClick={() => atChangeMode('createStories')}
          >
            <div className={cx(style.icon)}>
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.05116 2.89844H2.78915C2.31464 2.89844 1.85956 3.08694 1.52403 3.42247C1.1885 3.758 1 4.21307 1 4.68758V17.2116C1 17.6861 1.1885 18.1412 1.52403 18.4767C1.85956 18.8123 2.31464 19.0008 2.78915 19.0008H15.3132C15.7877 19.0008 16.2428 18.8123 16.5783 18.4767C16.9138 18.1412 17.1023 17.6861 17.1023 17.2116V10.9496"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.7602 1.55582C16.1161 1.19993 16.5988 1 17.1021 1C17.6054 1 18.088 1.19993 18.4439 1.55582C18.7998 1.9117 18.9997 2.39438 18.9997 2.89768C18.9997 3.40097 18.7998 3.88365 18.4439 4.23954L9.94548 12.738L6.36719 13.6326L7.26176 10.0543L15.7602 1.55582Z"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h6>創建劇本</h6>
            </div>
          </div>
        </div>
      </div>
      <div className={cx(style.customer)}>
        {user ? (
          <button
            className={cx(style.btn)}
            onClick={() => {
              PersonOption === 'open'
                ? setPersonOption('none')
                : setPersonOption('open');
            }}
          >
            <div className={cx(style.persona)}>
              <ul
                className={cx(
                  PersonOption === 'open' ? '' : style.hidden,
                  style.personaBlock,
                )}
              >
                {currentPage === '故事流程' &&
                  (rasaTrainState > 0 ? (
                    <li className={cx(style.personaItem)} disabled>
                      <CgSpinner className={cx('mx-2', style.loadingIcon)} />
                      機器人訓練中
                    </li>
                  ) : (
                    <li
                      className={cx(style.personaItem)}
                      onClick={() => trainRasa(trainData)}
                    >
                      執行訓練
                    </li>
                  ))}

                <li
                  className={cx(style.personaItem)}
                  onClick={() => onLogout()}
                >
                  登出
                </li>
              </ul>
            </div>
            <div>
              <h6> userName</h6>
            </div>
          </button>
        ) : (
          <Link className="btn btn-outline-light" to="/login">
            登入
          </Link>
        )}
      </div>
    </nav>
  );
};

export default React.memo(NavBar);
