// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Layout from '.';

const action = actions();

export default {
  title: 'Layout',
  component: Layout,
};

const Template = (args) => {
  return (
    <Layout
      {...args}
      {...action}
    />
  );
};

export const Basic = Template.bind({});
Basic.args = {};
