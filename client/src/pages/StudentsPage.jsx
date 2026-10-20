import { useAuth } from "../context/useAuth";

function StudentsPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Students</h1>
      <p>
        Logged in as {user?.name} ({user?.role})
      </p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default StudentsPage;