import React from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '@/components/shared/ProductForm';
import { useAuth } from '@/context/AuthContext';

const ProductEdit = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const role = String(user?.role || '').toLowerCase() === 'store' ? 'store' : 'admin';
    return <ProductForm mode="edit" productId={id} role={role} />;
};

export default ProductEdit;
