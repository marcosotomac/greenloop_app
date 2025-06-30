import "./index.css";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

import ProtectedRoutes from "./utils/ProtectedRoutes.tsx";
import AuthPage from "./pages/Auth-Page.tsx";
import GreenLoopAIPage from "./pages/greenloopAIPage.tsx";
import CreatePostPage from "./pages/CreatePostPage.tsx";
import CreateCommunityPage from "./pages/CreateCommunityPage.tsx";
import { useToken } from "./contexts/TokenContext.tsx";

import Layout from "@/components/layout.tsx";
import HomePage from "@/pages/home.tsx";
import ComunidadPage from "@/pages/comunidad.tsx";
import PublicacionesPage from "@/pages/publicaciones.tsx";
import MensajesPage from "@/pages/mensajes.tsx";
import IntercambiosPage from "@/pages/intercambios.tsx";
import GruposPage from "@/pages/grupos.tsx";
import ProductosPage from "@/pages/productos.tsx";
import ProductDetailPage from "@/pages/ProductDetailPage.tsx";
import WishlistPage from "@/pages/wishlist.tsx";
import DonacionesPage from "@/pages/donaciones.tsx";
import NotificacionesPage from "@/pages/notificaciones-fixed.tsx";
import ChatPage from "@/pages/ChatPage.tsx";
import ProfilePage from "@/pages/profilePage.tsx";
import MyProfile from "@/pages/MyProfile.tsx";
//importation de prueba
import { getUserProfileById } from "@/api/api.tsx";
import CreateProductPage from "@/pages/CreateProductPage.tsx";

function App() {
  const { token } = useToken();

  useEffect(() => {
    console.log(getUserProfileById({ userId: 1 }));
  }, []);

  return (
    <Routes>
      <Route
        element={token ? <Navigate replace to="/" /> : <AuthPage />}
        path="/register"
      />
      <Route element={<ProtectedRoutes />}>
        <Route
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route element={<HomePage />} path="/" />
          <Route element={<PublicacionesPage />} path="/publicaciones" />
          <Route element={<ComunidadPage />} path="/comunidad" />
          <Route element={<ChatPage />} path="/chat/*" />
          <Route element={<NotificacionesPage />} path="/notificaciones" />
          <Route element={<DonacionesPage />} path="/donaciones" />
          <Route element={<WishlistPage />} path="/wishlist" />
          <Route element={<ProductosPage />} path="/productos" />
          <Route element={<ProductDetailPage />} path="/product/:id" />
          <Route element={<GreenLoopAIPage />} path="/greenloop-ai" />
          <Route element={<GruposPage />} path="/grupos" />
          <Route element={<IntercambiosPage />} path="/intercambios" />
          <Route element={<MensajesPage />} path="/mensajes" />
          <Route element={<ProfilePage />} path="/profile/:id" />
          <Route element={<MyProfile />} path="/my-profile" />
          <Route element={<CreateProductPage />} path="/create-product" />
          <Route element={<CreatePostPage />} path="/create-post" />
          <Route element={<CreateCommunityPage />} path="/create-community" />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
