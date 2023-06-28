import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Clientes from '../pages/Clientes/Clientes.tsx';
import ConfigurationUser from '../pages/ConfigurationUser/ConfigurationUser.tsx';
import Dashboard from '../pages/Dashboard/Dashboard.tsx';
import SignIn from '../pages/SignIn/SignIn.js';

const ApplicationRoutes = () => {
    const [signed, setSigned] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token != null) {
            setSigned(true);
        }
    }, []);

    const PrivateRoute = ({ children }) => {
        return signed ? children : <Navigate to='/' />;
    };

    const PublicRoute = ({ children }) => {
        return signed ? <Navigate to='/dashboard' /> : children;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path='/clients' element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path='/config' element={<PrivateRoute><ConfigurationUser /></PrivateRoute>} />

                {/* Public Routes === if not signed */}
                <Route path='/' element={<PublicRoute><SignIn /></PublicRoute>} />
                <Route path='*' element={<h1>ERROR 404 - PAGE NOT FOUND</h1>} />
            </Routes>
        </BrowserRouter>
    );
};

export default ApplicationRoutes;
