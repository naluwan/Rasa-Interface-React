// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import MoreAction from '.';

const action = actions();

export default {
  title: 'MoreAction',
  component: MoreAction,
};

const Template = (args) => {
  return <MoreAction {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
