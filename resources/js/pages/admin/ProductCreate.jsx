import React from 'react';
import ProductForm from '@/components/shared/ProductForm';
import { useAuth } from '@/context/AuthContext';

const ProductCreate = () => {
    const { user } = useAuth();
    const role = String(user?.role || '').toLowerCase() === 'store' ? 'store' : 'admin';
    return <ProductForm mode="create" role={role} />;
};

export default ProductCreate;
