import React, { useEffect, useState } from "react";
import api from "../api";

export default function Rfqs({ user }) {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    deadline: "",
    vendorIds: [],
  });

  useEffect(() => {
    loadRfqs();
    loadVendors();
  }, []);

  const loadRfqs = async () => {
    try {
      const res = await api.get("/rfqs");
      setRfqs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVendors = async () => {
    try {
      const res = await api.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createRfq = async () => {
    try {
      await api.post("/rfqs", {
        ...form,
        quantity: Number(form.quantity),
        status: "published",
      });

      alert("RFQ Created Successfully");

      setForm({
        title: "",
        description: "",
        category: "",
        quantity: "",
        deadline: "",
        vendorIds: [],
      });

      setShowForm(false);

      loadRfqs();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create RFQ");
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2>RFQs</h2>

        {user.role === "officer" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "Create RFQ"}
          </button>
        )}
      </div>

      {showForm && (
        <div
          style={{
            border: "1px solid #444",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3>Create RFQ</h3>

          <input
            className="form-control"
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <br />

          <textarea
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <br />

          <input
            className="form-control"
            placeholder="Category"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          />

          <br />

          <input
            type="number"
            className="form-control"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <br />

          <input
            type="date"
            className="form-control"
            value={form.deadline}
            onChange={(e) =>
              setForm({ ...form, deadline: e.target.value })
            }
          />

          <br />

          <label>Select Vendors</label>

          <select
            multiple
            className="form-control"
            onChange={(e) => {
              const ids = Array.from(
                e.target.selectedOptions,
                (option) => Number(option.value)
              );

              setForm({
                ...form,
                vendorIds: ids,
              });
            }}
          >
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>

          <br />

          <button
            className="btn btn-success"
            onClick={createRfq}
          >
            Save RFQ
          </button>
        </div>
      )}

      <table className="custom-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Deadline</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {rfqs.map((rfq) => (
            <tr key={rfq.id}>
              <td>{rfq.title}</td>
              <td>{rfq.category}</td>
              <td>{rfq.quantity}</td>
              <td>{rfq.deadline?.split("T")[0]}</td>
              <td>{rfq.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}