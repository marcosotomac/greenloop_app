import { Outlet, Navigate } from "react-router-dom";

import { useToken } from "../contexts/TokenContext";

const ProtectedRoutes = () => {
  const { token } = useToken();

  return token ? <Outlet /> : <Navigate replace to="/register" />;
};

export default ProtectedRoutes;
