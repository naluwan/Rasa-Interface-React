import type { State } from 'components/types';
import useStoryStore from '../../store/useStoryStore';

const Authenticate = (props) => {
  const { children } = props;
  const user = useStoryStore((state: State) => state.user);

  if (!user) {
    return null;
  }

  let child = children;
  if (typeof children === 'function') {
    child = children(user);
  }
  return child;
};

export default Authenticate;
