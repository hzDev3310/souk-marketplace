import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProductForm from '@/components/shared/ProductForm';

const StoreProductCreate = () => {
    const { user } = useAuth();
    return <ProductForm mode="create" role="store" />;
};

export default StoreProductCreate;
