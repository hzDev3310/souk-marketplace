import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProductForm from '@/components/shared/ProductForm';

const StoreProductEdit = () => {
    const { user } = useAuth();
    return <ProductForm mode="edit" role="store" />;
};

export default StoreProductEdit;
