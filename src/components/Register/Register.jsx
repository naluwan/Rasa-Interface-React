import * as React from 'react';
import shallow from 'zustand/shallow';
import { Link } from 'react-router-dom';
import MyButton from 'components/MyButton';
import style from './Register.module.scss';
import useStore from '../../store';

const Register = () => {
  const [userInfo, setUserInfo] = React.useState({
    cpnyId: '',
    cpnyName: '',
    chatbotName: '',
    email: '',
    password: '',
    passwordCheck: '',
    image: '',
  });
  const { onRegister } = useStore((state) => {
    return {
      onRegister: state.onRegister,
    };
  }, shallow);
  const atInput = React.useCallback((e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);

  const atRegister = React.useCallback(
    (
      cpnyId: string,
      cpnyName: string,
      chatbotName: string,
      email: string,
      password: string,
      passwordCheck: string,
      image: file,
    ) => {
      console.log('atRegister cpnyId:', cpnyId);
      console.log('atRegister cpnyName:', cpnyName);
      console.log('atRegister chatbotName:', chatbotName);
      console.log('atRegister email:', email);
      console.log('atRegister password:', password);
      console.log('atRegister passwordCheck:', passwordCheck);
      console.log('atRegister image:', image);
      return onRegister(
        cpnyId,
        cpnyName,
        chatbotName,
        email,
        password,
        passwordCheck,
        image,
      )
        .then((data) => {
          console.log('at register:', data);
        })
        .catch((err) => console.log(err));
    },
    [onRegister],
  );
  console.log({ userInfo });
  return (
    <div className="container">
      <div className={style.register}>
        <div className={style.registerContainer}>
          <h1 className={style.title}>使用者註冊</h1>
          <div className={style.inputBlock}>
            <input
              type="text"
              id="cpnyId"
              name="cpnyId"
              placeholder="公司代號"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="text"
              id="cpnyName"
              name="cpnyName"
              placeholder="公司名稱"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="text"
              id="chatbotName"
              name="chatbotName"
              placeholder="機器人名稱"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="登入帳號"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="密碼"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="password"
              id="passwordCheck"
              name="passwordCheck"
              placeholder="再次輸入密碼"
              onChange={atInput}
              required
            />
          </div>
          <div className={style.inputBlock}>
            <input
              type="file"
              id="image"
              name="image"
              required
              onChange={atInput}
            />
          </div>

          <div className={style.inputBlock}>
            <MyButton
              className="btn"
              variant="primary"
              onClick={() =>
                atRegister(
                  userInfo.cpnyId,
                  userInfo.cpnyName,
                  userInfo.chatbotName,
                  userInfo.email,
                  userInfo.password,
                  userInfo.passwordCheck,
                  userInfo.image,
                )
              }
            >
              註冊
            </MyButton>
          </div>
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
