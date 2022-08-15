// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import NavBar from '.';

const action = actions();

export default {
  title: 'NavBar',
  component: NavBar,
};

const Template = (args) => {
  return (
    <NavBar
      {...args}
      {...action}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
