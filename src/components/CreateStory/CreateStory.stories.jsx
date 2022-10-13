// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import CreateStory from '.';

const action = actions();

export default {
  title: 'CreateStory',
  component: CreateStory,
};

const Template = (args) => {
  return <CreateStory {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
