import { Navigate } from 'react-router-dom';

/**
 * /my-bookings redireciona para /lz_user/dashboard (mesma página de reservas).
 */
export default function MyBookings() {
  return <Navigate to="/lz_user/dashboard" replace />;
}



