// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import CreateNewStory from '.';

const action = actions();

export default {
  title: 'CreateNewStory',
  component: CreateNewStory,
};

const Template = (args) => {
  return <CreateNewStory {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
