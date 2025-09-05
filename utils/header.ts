import {LeftPanelRoutes} from '@kaksha/routes/auth/type';

const getHeaderTitle = (route: keyof LeftPanelRoutes): string => {
  switch (route) {
    case 'dashboard':
      return `kaksha.`;
    default:
      return `kaksha.`;
  }
};

export {getHeaderTitle};
