// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import CheckPoint from '.';

const action = actions();

export default {
  title: 'CheckPoint',
  component: CheckPoint,
};

const Template = (args) => {
  return <CheckPoint {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
