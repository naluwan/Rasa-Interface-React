/* eslint-disable testing-library/no-node-access */
import { fireEvent, render } from '@testing-library/react';

const Login = require('../Login/Login');
// 登入流程測試
it('登入流程測試', () => {
  const { Logins } = render(<Login />);
  const account = Logins.querySelector('#login-Email');
  const password = Logins.querySelector('#login-password');
  const loginBtn = Logins.querySelector('#loginBtn');
  const pasw = [{ account: 'test123@gmail.com', paw: '123' }];
  //   console.dir(Logins.atLogin(pasw[0].account, pasw[0].paw));
  expect(account).toHaveTextContent(pasw[0].account);
  expect(password).toHaveTextContent(pasw[0].paw);
  fireEvent(
    loginBtn,
    new MouseEvent('click', {
      bubbles: true,
    }),
  );
});

// // const Login = require('../Login/Login');

// // test('使用test123@gmail.com 進行登入流程', () => {
// //   const account = 'test123@gmail.com';
// //   const paw = '123';

// //   expect(Login.Login.atLogin(account, paw));
// // });
// test('login a user', () => {
//   // Send a POST request to the login route with the login form data
//   const response = request(app).post('/login').send({
//     email: 'test123@gmail.com',
//     password: '123;',
//   });

//   // Assert that the response status is 200 OK
//   expect(response.status).toBe(200);
// });
