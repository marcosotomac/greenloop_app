import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getUserProfileById } from "../api/api";

import { UserProfileResponse } from "@/types/interfaces";

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const userData = await getUserProfileById({ userId: parseInt(id, 10) });

        setProfile(userData);
      } catch (err) {
        if (err instanceof Error && err.message.includes("404")) {
          setError("Usuario no encontrado");
        } else {
          setError(
            err instanceof Error ? err.message : "Error al cargar el perfil",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading)
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          <p className="mt-3 text-gray-500">Cargando perfil...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="h-full bg-gray-50">
      <div className="h-full flex flex-col">
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 px-6 py-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center space-x-4">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-2 border-white/30 shadow-lg">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-green-100 text-sm mt-1">{profile.email}</p>
              <p className="text-green-100 text-sm mt-1">
                Miembro desde {new Date(profile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-200 hover:shadow-md">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile.points}
            </div>
            <div className="text-gray-600 text-sm font-medium">Puntos</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-200 hover:shadow-md">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile.level}
            </div>
            <div className="text-gray-600 text-sm font-medium">Nivel</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-200 hover:shadow-md">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile.itemsDonated}
            </div>
            <div className="text-gray-600 text-sm font-medium">Donaciones</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-200 hover:shadow-md">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {profile.itemsExchanged}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              Intercambios
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Información Personal
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                      <path
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium text-gray-900">
                      {profile.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rol</p>
                    <p className="font-medium text-gray-900">{profile.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Productos</p>
                    <p className="font-medium text-gray-900">
                      {profile.totalProductsCount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total de Posts</p>
                    <p className="font-medium text-gray-900">
                      {profile.totalPostsCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communities and Wish Lists Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Communities */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  Comunidades
                </h2>
                {profile.communities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {profile.communities.map((community) => (
                      <div
                        key={community.id}
                        className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-200 p-2 rounded-lg">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                          <h3 className="font-medium text-lg text-green-800">
                            {community.name}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      No pertenece a ninguna comunidad
                    </p>
                  </div>
                )}
              </div>

              {/* Wish Lists */}
              <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  Listas de Deseos
                </h2>
                {profile.wishLists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {profile.wishLists.map((wishList, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="bg-green-200 p-2 rounded-lg">
                            <svg
                              className="w-5 h-5 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                          <h3 className="font-medium text-lg text-green-800">
                            {wishList.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 ml-11">
                          {wishList.productCount} productos
                        </p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full ml-11 ${
                            wishList.isPublic
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {wishList.isPublic ? "Pública" : "Privada"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      No hay listas de deseos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
