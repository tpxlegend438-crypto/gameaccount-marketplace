import { useInternetIdentity } from './useInternetIdentity';

export const ADMIN_PRINCIPAL = 'rokdy-ukica-uacon-xqpk6-46vhi-5fxyu-xqozt-pz437-gqggt-qctjn-lqe';

export function useIsAdmin() {
  const { identity, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toText() ?? '';
  const isAdmin = isAuthenticated && principalStr === ADMIN_PRINCIPAL;

  return {
    isAdmin,
    isLoading: isInitializing,
    isFetched: !isInitializing,
  };
}
