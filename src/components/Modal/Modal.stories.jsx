// import * as React from 'react';
import { actions } from '@storybook/addon-actions';

import Modal from '.';

const action = actions();

export default {
  title: 'Modal',
  component: Modal,
};

const Template = (args) => {
  return <Modal {...args} {...action} />;
};

export const Basic = Template.bind({});
Basic.args = {};
