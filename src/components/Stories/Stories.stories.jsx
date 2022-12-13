// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Stories from '.';

const action = actions();

export default {
  title: 'Stories',
  component: Stories,
};

const Template = (args) => {
  return <Stories {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
