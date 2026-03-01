import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import BrowsePage from './pages/BrowsePage';
import ListingDetailPage from './pages/ListingDetailPage';
import ChatPage from './pages/ChatPage';
import CreateListingPage from './pages/CreateListingPage';
import MyListingsPage from './pages/MyListingsPage';
import ProfilePage from './pages/ProfilePage';
import ChatsPage from './pages/ChatsPage';
import ProfileSetupModal from './components/ProfileSetupModal';

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <Layout>
        <Outlet />
      </Layout>
      <ProfileSetupModal />
    </ThemeProvider>
  ),
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BrowsePage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$id',
  component: ListingDetailPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$listingId',
  component: ChatPage,
});

const createListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreateListingPage,
});

const myListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-listings',
  component: MyListingsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const chatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chats',
  component: ChatsPage,
});

const routeTree = rootRoute.addChildren([
  browseRoute,
  listingDetailRoute,
  chatRoute,
  createListingRoute,
  myListingsRoute,
  profileRoute,
  chatsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
