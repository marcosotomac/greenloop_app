import { useToken } from "@/contexts/TokenContext.tsx";

function Profile() {
  const { removeToken } = useToken();

  const handleLogout = () => {
    removeToken(); // Redirect to the registration page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <p className="text-lg">This is the profile page.</p>
      <button
        className="bg-primary text-white px-4 py-2 rounded-md mt-4"
        style={{ cursor: "pointer" }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
