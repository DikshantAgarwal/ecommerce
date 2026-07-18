import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ProductDetail from '../pages/ProductDetail';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Protected routes go here (e.g., cart, checkout, orders)
        ],
      },
    ],
  },
]);
