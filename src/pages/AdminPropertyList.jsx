import React, { useState, useEffect } from "react";
import axios from "axios"; // ✅ use axios with VITE_API_BASE_URL
import "./AdminPropertyList.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminPropertyList() {
  // ✅ Get token from localStorage
  const token = localStorage.getItem("adminToken");

  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(res.data.data || res.data); // handle backend structure
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };
    if (token) fetchProperties();
  }, [token]);

  const deleteProperty = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting property:", err);
    }
  };

  const startEdit = (property) => {
    setEditingId(property._id);
    setForm({
      ...property,
      removedImages: [],
      newImages: [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({});
  };

  const toggleRemoveImage = (img) => {
    const removed = form.removedImages.includes(img)
      ? form.removedImages.filter((i) => i !== img)
      : [...form.removedImages, img];
    setForm({ ...form, removedImages: removed });
  };

  const saveEdit = async (id) => {
    try {
      const formData = new FormData();
      ["title", "location", "price", "category", "description"].forEach((key) =>
        formData.append(key, form[key] || "")
      );

      const existingImages = form.images.filter(
        (img) => !form.removedImages.includes(typeof img === "object" ? img.url : img)
      );
      existingImages.forEach((img) =>
        formData.append("existingImages", typeof img === "object" ? img.url : img)
      );

      form.removedImages.forEach((img) => formData.append("removedImages", img));
      if (form.newImages && form.newImages.length > 0) {
        [...form.newImages].forEach((file) => formData.append("images", file));
      }

      await axios.put(`${API_BASE_URL}/api/properties/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update locally
      setProperties((prev) =>
        prev.map((p) => (p._id === id ? { ...p, ...form } : p))
      );

      setEditingId(null);
      setForm({});
    } catch (err) {
      console.error("Error updating property:", err);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return "";
    if (typeof img === "object" && img.url) return img.url;
    if (typeof img === "string") {
      if (img.startsWith("http")) return img;
      return `/uploads/${img}`;
    }
    return "";
  };

  return (
    <div className="list-properties-fullpage">
      <h2>🏠 Properties List (Admin)</h2>

      {properties.length === 0 && <p>No properties found.</p>}

      <div className="table-container">
        {properties.map((p) => (
          <div key={p._id} className="property-card">
            {/* Images */}
            <div className="images-preview">
              {editingId === p._id ? (
                <>
                  {(form.images || []).map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={p.title}
                      className={
                        form.removedImages.includes(
                          typeof img === "object" ? img.url : img
                        )
                          ? "removed"
                          : ""
                      }
                      onClick={() =>
                        toggleRemoveImage(typeof img === "object" ? img.url : img)
                      }
                      title={
                        form.removedImages.includes(
                          typeof img === "object" ? img.url : img
                        )
                          ? "Click to restore"
                          : "Click to remove"
                      }
                    />
                  ))}
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setForm({ ...form, newImages: e.target.files })
                    }
                  />
                </>
              ) : (
                <>
                  {p.images && p.images.length > 0
                    ? p.images.map((img, idx) => (
                        <img key={idx} src={getImageUrl(img)} alt={p.title} />
                      ))
                    : <img src="/default.png" alt="Default" />}
                </>
              )}
            </div>

            {/* Property Info */}
            <div className="property-info">
              {editingId === p._id ? (
                <>
                  <input
                    type="text"
                    value={form.title || ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={form.location || ""}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Location"
                  />
                  <input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Price"
                  />
                  <select
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="house">House</option>
                    <option value="car">Car</option>
                    <option value="shop/store">Shop/Store</option>
                    <option value="store">Store</option>
                    <option value="whole/tent">Whole/Tent</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Description"
                  />
                </>
              ) : (
                <>
                  <strong>{p.title}</strong> ({p.category})<br />
                  Owner: {p.owner?.name || "N/A"} - {p.owner?.phone || "N/A"}<br />
                  Location: {p.location} | Price: ${p.price}<br />
                  <small>{p.description}</small>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="card-actions">
              {editingId === p._id ? (
                <>
                  <button onClick={() => saveEdit(p._id)}>✅ Save</button>
                  <button onClick={cancelEdit}>❌ Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(p)}>✏️ Edit</button>
                  <button onClick={() => deleteProperty(p._id)}>🗑️ Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
