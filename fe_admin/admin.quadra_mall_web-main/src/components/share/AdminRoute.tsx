import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

const AdminRoute: React.FC = () => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const hasAdminRole = user?.roles.some((role) => role.name === 'ROLE_ADMIN');
    console.log('AdminRoute - isAuthenticated:', isAuthenticated, 'hasAdminRole:', hasAdminRole); // Debug
    return isAuthenticated && hasAdminRole ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;