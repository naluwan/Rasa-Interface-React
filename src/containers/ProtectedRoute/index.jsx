/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable max-len */
import { RouteProps, Navigate } from 'react-router-dom';
import shallow from 'zustand/shallow';
import useStore from '../../store';

type ProtectedRouteProps = RouteProps & {};
const ProtectedRoute = (props: ProtectedRouteProps) => {
  const { children } = props;

  const { user, isAppInitializedComplete } = useStore((state) => {
    return {
      user: state.user,
      isAppInitializedComplete: state.isAppInitializedComplete,
    };
  }, shallow);

  if (!isAppInitializedComplete) {
    return <div className="my-spinner">Loading</div>;
  }
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect_url=${encodeURIComponent(
          window.location.pathname,
        )}`}
      />
    );
  }
  return children;
};

export default ProtectedRoute;
