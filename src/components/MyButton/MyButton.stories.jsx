// import * as React from 'react';
import MyButton from '.';

export default {
  title: 'MyButton',
  component: MyButton,
  argTypes: {
    onClick: { action: 'button clicked' },
    rounded: {
      control: 'boolean',
    },
    color: {
      control: 'color',
    },
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'radio' },
    },
  },
};

const Template = ({ ...args }) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MyButton {...args}>Test Button</MyButton>;
};

export const Basic = Template.bind({});
export const Rounded = Template.bind({});

Rounded.args = {
  rounded: true,
  color: 'red',
};
