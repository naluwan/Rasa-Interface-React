// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import ShowStory from '.';

const action = actions();

export default {
  title: 'ShowStory',
  component: ShowStory,
};

const Template = (args) => {
  return <ShowStory {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
