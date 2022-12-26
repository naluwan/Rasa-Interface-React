/* eslint-disable testing-library/no-node-access */
/* eslint-disable no-unused-vars */
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from '@jest/globals';
import { toBeInTheDocument } from '@testing-library/jest-dom';
import { Routes, MemoryRouter, Route } from 'react-router-dom';
import Login from '../Login/Login';

expect.extend({
  toBeInTheDocument: (element) => {
    // 判断 element 是否在文檔中
    const pass = element.parentElement !== null;
    if (pass) {
      return {
        message: () => '',
        pass: true,
      };
    }
    return {
      message: () => 'Element is not in the document',
      pass: false,
    };
  },
});

describe('登入流程設定', () => {
  test('登入按鈕功能', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>,
    );
    const loginBtn = screen.getByTestId('loginBtn');
    fireEvent.click(loginBtn);
  });
});
