import { useSelector } from 'react-redux';

type State = any;
export const useAuthentication = () => {
  const isAuthenticated = useSelector(
    (state: State) => state.user.login.loggedIn
  );

  return isAuthenticated;
};
