// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Myinput from '.';

const action = actions();

export default {
  title: 'Myinput',
  component: Myinput,
};

const Template = (args) => {
  return <Myinput {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
