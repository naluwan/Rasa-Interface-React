// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Entities from '.';

const action = actions();

export default {
  title: 'Entities',
  component: Entities,
};

const Template = (args) => {
  return <Entities {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
