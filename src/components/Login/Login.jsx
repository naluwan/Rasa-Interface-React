/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import swal from 'sweetalert2';
import type { State } from 'components/types';
import cx from 'classnames';
import style from './Login.module.scss';
import MyInput from '../MyInput';
import MyButton from '../MyButton';
import useStoryStore from '../../store/useStoryStore';

// 忘記密碼
const forgetButton = () => {
  swal
    .fire({
      title: '忘記密碼',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: '送出',
      cancelButtonText: '取消',
      inputPlaceholder: '請輸入申請帳號時所填的E-mail',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        return fetch(`//api.github.com/users/${login}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .catch((error) => {
            swal.showValidationMessage(`Request failed: ${error}`);
          });
      },
      allowOutsideClick: () => !swal.isLoading(),
    })
    .then((result) => {
      if (result.isConfirmed) {
        swal.fire({
          title: `${result.value.login}'s avatar`,
          imageUrl: result.value.avatar_url,
        });
      }
    });
};

const Login = () => {
  /**
   * @type {[{email:string,password:string}, Function]}
   */
  const [accountInfo, setAccountInfo] = React.useState({
    email: '',
    password: '',
  });
  const { user, onLogin, loading } = useStoryStore((state: State) => {
    return {
      user: state.user,
      onLogin: state.onLogin,
      loading: state.loading,
    };
  }, shallow);

  const atInput = React.useCallback((e) => {
    const { name, value } = e.target;
    setAccountInfo((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);

  const atLogin = React.useCallback(
    (email: string, password: string) => {
      onLogin(email, password);
    },
    [onLogin],
  );

  if (user) {
    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = decodeURIComponent(
      searchParams.get('redirect_url') ?? '/',
    );
    return <Navigate to={redirectUrl} />;
  }

  return (
    <div className={style.login}>
      {loading && <div className="my-spinner" />}
      <div className={style.signin}>
        {/* login.hbs */}
        <h1 className={style.title}>Chat Bot</h1>
        <div className={style.inputBlock}>
          <label htmlFor="login-Email">帳號</label>
          <MyInput
            id="login-Email"
            required=""
            variant="email"
            className="form-control"
            onChange={atInput}
          />
        </div>
        <div className={style.inputBlock}>
          <label htmlFor="login-password">密碼</label>
          <MyInput
            id="login-password"
            required=""
            variant="password"
            className="form-control"
            onChange={atInput}
          />
        </div>
        <div className={style.inputBlock}>
          <MyButton
            id="loginBtn"
            className="btn"
            variant="primary"
            onClick={() => atLogin(accountInfo.email, accountInfo.password)}
          >
            登入
          </MyButton>
        </div>
        {/* <div className={style.inputBlock}>
          <MyButton className="btn" variant="secondary" onClick={forgetButton}>
            忘記密碼
          </MyButton>
        </div> */}
        <div className={style.account}>
          還沒有帳號?
          <NavLink
            to="/register"
            variant="nostyle"
            className={cx('btn', style.accountBtn)}
          >
            註冊
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
