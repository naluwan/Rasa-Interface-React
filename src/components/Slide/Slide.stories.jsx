// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Slide from '.';

const action = actions();

export default {
  title: 'Slide',
  component: Slide,
};

const Template = (args) => {
  return <Slide {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
