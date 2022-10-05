/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import swal from 'sweetalert2';
import type { State } from 'components/types';
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
      const loginInfo = onLogin(email, password);
      loginInfo
        .then((data) => {
          const Toast = swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', swal.stopTimer);
              toast.addEventListener('mouseleave', swal.resumeTimer);
            },
          });

          if (data.status === 'success') {
            Toast.fire({
              icon: 'success',
              title: '登入成功',
            });
          } else {
            Toast.fire({
              icon: 'error',
              title: '登入失敗',
              text: `${data.message}`,
            });
          }
        })
        .catch((err) => console.log(err));
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
    <div className="container">
      {loading && <div className="my-spinner" />}
      <div className={style.login}>
        <div className={style.signin}>
          {/* login.hbs */}
          <h1 className={style.title}>Chat Bot</h1>
          <div className={style.inputBlock}>
            <MyInput
              required=""
              variant="email"
              className="form-control"
              onChange={atInput}
            />
          </div>
          <div className={style.inputBlock}>
            <MyInput
              required=""
              variant="password"
              className="form-control"
              onChange={atInput}
            />
          </div>
          <div className={style.inputBlock}>
            <MyButton
              className="btn"
              variant="primary"
              onClick={() => atLogin(accountInfo.email, accountInfo.password)}
            >
              登入
            </MyButton>
          </div>
          <div className={style.inputBlock}>
            <MyButton
              className="btn"
              variant="secondary"
              onClick={forgetButton}
            >
              忘記密碼
            </MyButton>
          </div>
          <div className={style.account}>
            還沒有帳號?
            <NavLink to="/register" variant="nostyle" className="btn">
              註冊
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
