// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import SliderControl from '.';

const action = actions();

export default {
  title: 'SliderControl',
  component: SliderControl,
};

const Template = (args) => {
  return <SliderControl {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
