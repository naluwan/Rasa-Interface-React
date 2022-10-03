// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Menu from '.';

const action = actions();

export default {
  title: 'Menu',
  component: Menu,
};

const Template = (args) => {
  return (
    <Menu
      {...args}
      {...action}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
