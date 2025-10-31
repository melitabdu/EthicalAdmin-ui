import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProvider.css"; // ✅ reuse your css

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ local replacement for the missing useAdminAuth
function useAdminAuth() {
  return {
    token: localStorage.getItem("adminToken"),
  };
}

const categories = [
  { id: "house", name: "House Rental/Sell", icon: "🏠" },
  { id: "car", name: "Car Rental/Sell", icon: "🚗" },
  { id: "shop", name: "Shop Rental/Sell", icon: "🏬" },
  { id: "store", name: "Store Rental/Sell", icon: "📦" },
  { id: "tent", name: "Whole/Tent Rental", icon: "⛺" },
  { id: "other", name: "Other Rental/Sell", icon: "➕" },
];

export default function AddProperty() {
  const { token } = useAdminAuth();
  const [owners, setOwners] = useState([]);
  const [newOwner, setNewOwner] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    category: "",
    owner: "",
    ownerName: "",
    ownerPhone: "",
    ownerPassword: "",
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [message, setMessage] = useState("");

  // ✅ Fetch owners
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/owners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwners(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching owners:", err);
        setOwners([]);
      }
    };
    if (token) fetchOwners();
  }, [token]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) return setMessage("❌ Please select a category");
    if (!newOwner && !form.owner)
      return setMessage("❌ Select existing owner or add new");

    const data = new FormData();
    data.append("title", form.title);
    data.append("location", form.location);
    data.append("price", form.price);
    data.append("description", form.description);
    data.append("category", form.category);

    if (newOwner) {
      data.append("ownerName", form.ownerName);
      data.append("ownerPhone", form.ownerPhone);
      data.append("ownerPassword", form.ownerPassword);
    } else {
      data.append("owner", form.owner);
    }

    images.forEach((img) => data.append("images", img));

    try {
      const res = await axios.post(`${API_BASE_URL}/api/properties`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(`✅ Property "${res.data.property.title}" added successfully`);

      // Reset form
      setForm({
        title: "",
        location: "",
        price: "",
        description: "",
        category: "",
        owner: "",
        ownerName: "",
        ownerPhone: "",
        ownerPassword: "",
      });
      setImages([]);
      setPreviews([]);
    } catch (err) {
      console.error(err);
      setMessage(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="add-provider-container">
      <h2>Add Property</h2>
      {message && <p className="form-message">{message}</p>}
      <form
        onSubmit={handleSubmit}
        className="add-provider-form"
        autoComplete="off"
      >
        <label>Title:</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label>Location:</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
          min="0"
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label>Category:</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={newOwner}
            onChange={() => setNewOwner(!newOwner)}
          />
          Add New Owner
        </label>

        {newOwner ? (
          <>
            <input
              name="ownerName"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={handleChange}
              required
            />
            <input
              name="ownerPhone"
              placeholder="Owner Phone"
              value={form.ownerPhone}
              onChange={handleChange}
              required
            />
            <input
              name="ownerPassword"
              type="password"
              placeholder="Owner Password"
              value={form.ownerPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </>
        ) : (
          <select
            name="owner"
            value={form.owner}
            onChange={handleChange}
            required
          >
            <option value="">Select Existing Owner</option>
            {owners.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name} - {o.phone}
              </option>
            ))}
          </select>
        )}

        <label>Images:</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImagesChange}
        />
        {previews.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="preview"
            style={{ width: 60, marginRight: 5, marginTop: 10 }}
          />
        ))}

        <button type="submit">Add Property</button>
      </form>
    </div>
  );
}
