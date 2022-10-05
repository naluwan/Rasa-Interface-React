// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import BotStep from '.';

const action = actions();

export default {
  title: 'BotStep',
  component: BotStep,
};

const Template = (args) => {
  return <BotStep {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
