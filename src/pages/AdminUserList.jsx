import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminUserList.css";

// ✅ Use the same env variable pattern
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminUserList = () => {
  const token = localStorage.getItem("adminToken");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Axios instance with admin token
  const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data || []);
        setError("");
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Not authorized or failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Delete failed");
    }
  };

  if (loading) return <p>⏳ Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="admin-users">
      <h2>Registered Users</h2>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="provider-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => (
              <tr key={u._id}>
                <td>{index + 1}</td>
                <td>{u.name || "—"}</td>
                <td>{u.email}</td>
                <td>{u.role || "user"}</td>
                <td>
                  {u.role === "admin" ? (
                    <span style={{ color: "gray" }}>Admin</span>
                  ) : (
                    <button onClick={() => handleDelete(u._id)}>
                      🗑 Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserList;
