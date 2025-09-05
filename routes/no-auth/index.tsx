import {RootStack} from '@kaksha/navigator';
import Login from '@kaksha/screens/no-auth/Login';
import Welcome from '@kaksha/screens/no-auth/Welcome';

const renderNoAuthRoutes = () => {
  return (
    <>
      <RootStack.Screen name="welcome" component={Welcome} />
      <RootStack.Screen name="login" component={Login} />
    </>
  );
};

export default renderNoAuthRoutes;
