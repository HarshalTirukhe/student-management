import { useEffect, useState } from "react";
import { apiRequest } from "./lib/api";

function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    apiRequest("/health")
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("cannot reach the server"));
  }, []);

  return (
    <div>
      <h1>Student Management System</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;