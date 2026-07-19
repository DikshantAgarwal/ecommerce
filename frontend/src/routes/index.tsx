import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import ProductDetail from '../pages/ProductDetail';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderConfirmation from '../pages/OrderConfirmation';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'checkout', element: <Checkout /> },
          { path: 'orders/:id/confirmation', element: <OrderConfirmation /> },
        ],
      },
    ],
  },
]);
