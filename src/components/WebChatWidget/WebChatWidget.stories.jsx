// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import WebChatWidget from '.';

const action = actions();

export default {
  title: 'WebChatWidget',
  component: WebChatWidget,
};

const Template = (args) => {
  return <WebChatWidget {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
