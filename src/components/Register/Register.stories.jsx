// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Register from '.';

const action = actions();

export default {
  title: 'Register',
  component: Register,
};

const Template = (args) => {
  return <Register {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
