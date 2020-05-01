import React from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router';
import { useAuthentication } from '../../hooks/authentication';

interface AuthenticatedRouteProps extends RouteProps {
  redirectTo?: string;
}

const AuthenticatedRoute: React.FC<AuthenticatedRouteProps> = ({
  component,
  redirectTo = '/login',
  ...rest
}) => {
  const isAuthenticated = useAuthentication();
  const currentLocation = useLocation();
  let RenderComponent = component;

  if (!isAuthenticated && redirectTo !== currentLocation.pathname) {
    RenderComponent = () => <Redirect to={redirectTo} />;
  }
  return <Route {...rest} component={RenderComponent} />;
};

export default AuthenticatedRoute;
