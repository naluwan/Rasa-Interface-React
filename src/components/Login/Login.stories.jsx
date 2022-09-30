// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Login from '.';

const action = actions();

export default {
  title: 'Login',
  component: Login,
};

const Template = (args) => {
  return (
    <Login
      {...args}
      {...action}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
