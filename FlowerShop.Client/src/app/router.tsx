import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './Layout'

const CatalogPage  = lazy(() => import('@/pages/Catalog').then(m => ({ default: m.CatalogPage })))
const ProductPage  = lazy(() => import('@/pages/Product').then(m => ({ default: m.ProductPage })))
const CartPage     = lazy(() => import('@/pages/Cart').then(m => ({ default: m.CartPage })))
const CheckoutPage = lazy(() => import('@/pages/Checkout').then(m => ({ default: m.CheckoutPage })))
const AccountPage  = lazy(() => import('@/pages/Account').then(m => ({ default: m.AccountPage })))
const SearchPage   = lazy(() => import('@/pages/Search').then(m => ({ default: m.SearchPage })))
const AboutPage    = lazy(() => import('@/pages/About').then(m => ({ default: m.AboutPage })))
const PrivacyPage  = lazy(() => import('@/pages/Legal').then(m => ({ default: m.PrivacyPage })))
const TermsPage    = lazy(() => import('@/pages/Legal').then(m => ({ default: m.TermsPage })))
const CookiesPage  = lazy(() => import('@/pages/Legal').then(m => ({ default: m.CookiesPage })))
const ReturnsPage  = lazy(() => import('@/pages/Legal').then(m => ({ default: m.ReturnsPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFoundPage })))

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',                  element: <CatalogPage /> },
      { path: '/catalog',           element: <Navigate to="/" replace /> },
      { path: '/product/:slug',     element: <ProductPage /> },
      { path: '/cart',              element: <CartPage /> },
      { path: '/checkout',          element: <CheckoutPage /> },
      { path: '/account',           element: <AccountPage /> },
      { path: '/account/favorites', element: <AccountPage /> },
      { path: '/search',            element: <SearchPage /> },
      { path: '/about',             element: <AboutPage /> },
      { path: '/privacy',           element: <PrivacyPage /> },
      { path: '/terms',             element: <TermsPage /> },
      { path: '/cookies',           element: <CookiesPage /> },
      { path: '/returns',           element: <ReturnsPage /> },
      { path: '*',                  element: <NotFoundPage /> },
    ],
  },
])
