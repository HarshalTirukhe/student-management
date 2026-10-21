import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Layout() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <Link to="/students">Student Management</Link>{" "}
        <span>
          {user?.name} ({user?.role})
        </span>{" "}
        <button onClick={logout}>Log out</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;