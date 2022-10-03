/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import shallow from 'zustand/shallow';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { RegisterUserInfoType } from 'components/types';
import style from './Register.module.scss';
import useStore from '../../store';

// 信箱和密碼的驗證 Regex
const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const Register = () => {
  const navigate = useNavigate();

  // 使用react-hook-form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // 從store導入onRegister
  const { onRegister } = useStore((state) => {
    return {
      onRegister: state.onRegister,
    };
  }, shallow);

  // 註冊事件
  const atRegister = React.useCallback(
    (data: RegisterUserInfoType) => {
      return onRegister(data)
        .then((res) => {
          if (res.status === 'success') {
            swal
              .fire({
                position: 'top-end',
                icon: 'success',
                title: '註冊成功',
                text: '請使用註冊的帳號、密碼登入',
                showConfirmButton: false,
                timer: 1500,
              })
              .then(() => navigate('/login'));
            // 上方為成功後顯示提視窗，提視窗結束後跳轉至login頁面
          } else {
            swal.fire({
              icon: 'error',
              title: '註冊失敗',
              text: `${res.message}`,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        })
        .catch((err) => console.log(err));
    },
    [onRegister, navigate],
  );
  return (
    <div className="container">
      <div className={style.register}>
        <div className={style.registerContainer}>
          <h1 className={style.title}>使用者註冊</h1>
          <form onSubmit={handleSubmit(atRegister)} noValidate>
            <div className={style.inputBlock}>
              <input
                type="text"
                placeholder="公司代號"
                {...register('cpnyId', { required: true })}
              />
              {errors.cpnyId && (
                <small className={style.textRed}>公司代號為必填欄位</small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="text"
                placeholder="公司名稱"
                {...register('cpnyName', { required: true })}
              />
              {errors.cpnyName && (
                <small className={style.textRed}>公司名稱為必填欄位</small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="text"
                id="chatbotName"
                name="chatbotName"
                placeholder="機器人名稱"
                {...register('chatbotName', { required: true })}
              />
              {errors.chatbotName && (
                <small className={style.textRed}>機器人名稱為必填欄位</small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="email"
                placeholder="登入帳號"
                {...register('email', {
                  required: true,
                  validate: (value) =>
                    emailPattern.test(value) || 'email格式錯誤',
                })}
              />
              {errors.email && (
                <small className={style.textRed}>{errors.email.message}</small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="password"
                placeholder="密碼"
                {...register('password', {
                  required: true,
                  validate: (value) => pwdPattern.test(value),
                })}
              />
              {errors.password && (
                <small className={style.textRed}>
                  <ul>
                    <li>密碼最少八個字符</li>
                    <li>密碼最少一個數字</li>
                    <li>密碼最少一個大寫字母</li>
                    <li>密碼最少一個小寫字母</li>
                  </ul>
                </small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="password"
                placeholder="再次輸入密碼"
                {...register('passwordCheck', {
                  required: true,
                  validate: (value) => value === watch('password'),
                })}
              />
              {errors.passwordCheck && (
                <small className={style.textRed}>密碼和確認密碼不相符</small>
              )}
            </div>
            <div className={style.inputBlock}>
              <input
                type="file"
                {...register('image', {
                  required: false,
                })}
              />
            </div>

            <div className={style.inputBlock}>
              <button type="submit" className="btn">
                註冊
              </button>
            </div>
          </form>
          <div className={style.account}>
            已有帳號?
            <Link to="/login" className="btn" variant="primary">
              登入
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Register);
