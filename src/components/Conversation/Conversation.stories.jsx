// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Conversation from '.';

const action = actions();

export default {
  title: 'Conversation',
  component: Conversation,
};

const Template = (args) => {
  return <Conversation {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
