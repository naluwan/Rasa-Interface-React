import * as React from 'react';
import { Navigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';
import style from './Login.module.scss';
import MyInput from '../MyInput';
import MyButton from '../MyButton';
import UseStore from '../../store';

const Login: React.FC<LoginProps> = () => {
  // const MySwal = withReactContent(Swal);
  const [accountInfo, setAccountInfo] = React.useState({
    email: '',
    password: '',
  });
  const { user, onLogin, loading } = UseStore((state) => {
    return {
      user: state.user,
      onLogin: state.onLogin,
    };
  }, shallow);
  const atInput = (e) => {
    const { name, value } = e.target;
    setAccountInfo((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const atLogin = (email, password) => {
    const loginInfo = onLogin(email, password);
    console.log('loginInfo', loginInfo);
    loginInfo
      .then((data) => {
        console.log('loginInfo:', data);
        if (data.status === 'success') {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: '登入成功',
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: '登入失敗',
            text: `${data.message}`,
            showConfirmButton: false,
            timer: 1500,
          });
        }
      })
      .catch((err) => console.log(err));
  };

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
            <MyButton className="btn" variant="secondary">
              忘記密碼
            </MyButton>
          </div>
          <div />
          <div className={style.account}>
            還沒有帳號?
            <MyButton variant="nostyle">註冊</MyButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);
