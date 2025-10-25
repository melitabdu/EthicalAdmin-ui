import React, { useState, useEffect } from "react";
import api from "../api"; // ✅ Correct centralized Axios instance
import { useAdminAuth } from "../context/adminAuthContext";

const AdminUnavailableDates = () => {
  const { token } = useAdminAuth();

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [dates, setDates] = useState([]);
  const [newDate, setNewDate] = useState("");
  const [error, setError] = useState("");

  // Axios headers with token
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch providers list
  useEffect(() => {
    if (!token) return;
    api
      .get("/admin/providers", { headers })
      .then((res) => {
        setProviders(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching providers:", err);
        setError("Failed to load providers");
      });
  }, [token]);

  // Fetch unavailable dates for selected provider
  useEffect(() => {
    if (!selectedProvider) return;
    api
      .get(`/unavailable-dates/${selectedProvider}`, { headers })
      .then((res) => {
        setDates(res.data);
        setError("");
      })
      .catch((err) => {
        console.error("Error fetching unavailable dates:", err);
        setError("Failed to load unavailable dates");
      });
  }, [selectedProvider, token]);

  // Add unavailable date
  const addDate = () => {
    if (!newDate || !selectedProvider) return;
    api
      .post(
        "/unavailable-dates",
        { providerId: selectedProvider, date: newDate },
        { headers }
      )
      .then((res) => {
        setDates([...dates, res.data]);
        setNewDate("");
        setError("");
      })
      .catch((err) => {
        console.error("Error adding unavailable date:", err);
        setError("Could not add date");
      });
  };

  // Remove unavailable date
  const removeDate = (id) => {
    api
      .delete(`/unavailable-dates/${id}`, { headers })
      .then(() => {
        setDates(dates.filter((d) => d._id !== id));
        setError("");
      })
      .catch((err) => {
        console.error("Error deleting unavailable date:", err);
        setError("Could not remove date");
      });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Manage Provider Unavailable Dates
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>
      )}

      {/* Provider Selector */}
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      >
        <option value="">Select a Provider</option>
        {providers.map((provider) => (
          <option key={provider._id} value={provider._id}>
            {provider.name}
          </option>
        ))}
      </select>

      {selectedProvider && (
        <>
          {/* Add Date */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="border p-2 rounded flex-1"
            />
            <button
              onClick={addDate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          {/* List Dates */}
          <ul className="border rounded p-4 bg-gray-50">
            {dates.length === 0 ? (
              <li className="text-gray-500 italic">No unavailable dates set</li>
            ) : (
              dates.map((d) => (
                <li
                  key={d._id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{new Date(d.date).toLocaleDateString()}</span>
                  <button
                    onClick={() => removeDate(d._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default AdminUnavailableDates;
