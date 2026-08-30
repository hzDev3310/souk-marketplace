import './bootstrap';
import './i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
} from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Shared/Dashboard/Index';
// Admin pages
import AdminStores from './pages/admin/Stores/Index';
import StoreCreate from './pages/admin/Stores/Create';
import StoreEdit from './pages/admin/Stores/Edit';
import AdminClients from './pages/admin/Clients/Index';
import AdminClientOrders from './pages/admin/Clients/Orders';

// Influencers and ShippingEmployees pages removed
import AdminCategories from './pages/admin/Categories/Index';
import CategoryCreate from './pages/admin/Categories/Create';
import CategoryEdit from './pages/admin/Categories/Edit';
import Products from './pages/Shared/Products/Index';
import ProductForm from './pages/Shared/Products/Form';
import AdminOrders from './pages/Shared/Orders/AdminOrders';
import StoreOrders from './pages/Shared/Orders/StoreOrders';
import OrderDetails from './pages/Shared/Orders/Detail';
import ProductDetail from './pages/Shared/Products/Detail';
import StoreDetail from './pages/admin/Stores/Detail';

import AdminProfile from './pages/admin/Profile/Index';
import StoreProfile from './pages/store/Profile';

// Role-based route wrapper for products list
const RoleBasedProducts = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN' || user?.role === 'STORE') return <Products />;
    return <Navigate to="/dashboard" replace />;
};

// Role-based route wrapper for product detail
const RoleBasedProductDetail = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN' || user?.role === 'STORE') return <ProductDetail />;
    return <Navigate to="/dashboard" replace />;
};

// Role-based route wrapper for product create
const RoleBasedProductCreate = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN' || user?.role === 'STORE') return <ProductForm />;
    return <Navigate to="/dashboard" replace />;
};

// Role-based route wrapper for product edit
const RoleBasedProductEdit = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN' || user?.role === 'STORE') return <ProductForm />;
    return <Navigate to="/dashboard" replace />;
};

const RoleBasedOrders = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return <AdminOrders />;
    if (user?.role === 'STORE') return <StoreOrders />;
    return <Navigate to="/dashboard" replace />;
};

const RoleBasedProfile = () => {
    const { user } = useAuth();
    if (user?.role === 'ADMIN') return <AdminProfile />;
    if (user?.role === 'STORE') return <StoreProfile />;
    return <Navigate to="/dashboard" replace />;
};

/** Renders child routes under `/dashboard` without extra UI (avoids `/dashboard/*` swallowing `/dashboard/login`). */
const DashboardBranch = () => <Outlet />;

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard" element={<DashboardBranch />}>
                    {/* Admin / staff auth (React). Storefront HTML uses /login and /register (Blade). */}
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="store" element={<Navigate to="/dashboard/stores" replace />} />
                        <Route path="stores" element={<AdminStores />} />
                        <Route path="stores/create" element={<StoreCreate />} />
                        <Route path="stores/:id/edit" element={<StoreEdit />} />
                        <Route path="clients" element={<AdminClients />} />
                        <Route path="clients/:clientId/orders" element={<AdminClientOrders />} />
                       
                        {/* Influencers and Shipping Employees pages removed */}
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="categories/create" element={<CategoryCreate />} />
                        <Route path="categories/:categoryId" element={<AdminCategories />} />
                        <Route path="categories/:id/edit" element={<CategoryEdit />} />
                        <Route path="products" element={<RoleBasedProducts />} />
                        <Route path="products/:id" element={<RoleBasedProductDetail />} />
                        <Route path="products/create" element={<RoleBasedProductCreate />} />
                        <Route path="products/:id/edit" element={<RoleBasedProductEdit />} />
                        <Route path="stores/:id" element={<StoreDetail />} />
                        <Route path="orders" element={<RoleBasedOrders />} />
                        <Route path="orders/:id" element={<OrderDetails />} />
                        <Route path="analytics" element={<div className="p-6 text-link">Analytics Page (Work in Progress)</div>} />

                        <Route path="profile" element={<RoleBasedProfile />} />
                    </Route>
                </Route>

                {/* Default Route: Redirect to dashboard if logged in, or handled by Blade / login */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

const rootElement = document.getElementById('react-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <ThemeProvider>
            <NotificationProvider>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </NotificationProvider>
        </ThemeProvider>
    );
}
