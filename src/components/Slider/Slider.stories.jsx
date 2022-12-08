/* eslint-disable react/jsx-props-no-spreading */
// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Slider from '.';

const action = actions();

export default {
  title: 'Slider',
  component: Slider,
};

const Template = (args) => {
  return <Slider {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
