import { memo } from 'react';

import store from '../../store';

const Authenticate = (props) => {
  const { children } = props;
  const user = store((state) => state.user);

  if (!user) {
    return null;
  }

  let child = children;
  if (typeof children === 'function') {
    child = children(user);
  }
  return child;
};

export default memo(Authenticate);
