// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Home from '.';

const action = actions();

export default {
  title: 'Home',
  component: Home,
};

const Template = (args) => {
  return (
    <Home
      {...args}
      {...action}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
