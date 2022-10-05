// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import UserStep from '.';

const action = actions();

export default {
  title: 'UserStep',
  component: UserStep,
};

const Template = (args) => {
  return <UserStep {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
