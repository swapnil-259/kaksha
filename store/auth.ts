import {SessionValue, UserI} from '@kaksha/types/user';
import {proxy} from 'valtio';

interface AuthStoreI {
  authenticated: boolean;
  userData: UserI | null;
  cookie: string | null;
  session: {
    current_session: number;
    session: SessionValue[];
  } | null;
  modules: string[];
}

const authStore = proxy<AuthStoreI>({
  authenticated: false,
  userData: null,
  cookie: null,
  session: null,
  modules: [],
});

const login = (
  userData: UserI,
  cookie: string,
  session: NonNullable<AuthStoreI['session']>,
  modules: string[],
) => {
  authStore.authenticated = true;
  authStore.userData = userData;
  authStore.cookie = cookie;
  authStore.session = session;
  authStore.modules = modules;
};

const setSession = (session: number) => {
  if (authStore.session) authStore.session.current_session = session;
};

const logout = () => {
  authStore.authenticated = false;
  authStore.userData = null;
  authStore.cookie = null;
  authStore.session = null;
  authStore.modules = [];
};

export {authStore, login, logout, setSession};
export type {UserI};
