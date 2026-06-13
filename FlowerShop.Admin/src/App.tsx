import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { Layout } from '@/components/Layout'
import { Login }    from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Products }  from '@/pages/Products'
import { ProductForm } from '@/pages/ProductForm'
import { Orders }    from '@/pages/Orders'
import { OrderDetail } from '@/pages/OrderDetail'
import { Promos }    from '@/pages/Promos'
import { UsersPage } from '@/pages/Users'
import { AddonsPage } from '@/pages/Addons'
import { BannersPage } from '@/pages/Banners'
import { ReviewsPage } from '@/pages/Reviews'
import { DeliveryPage } from '@/pages/Delivery'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user)
  if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="promos" element={<Promos />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="addons" element={<AddonsPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
