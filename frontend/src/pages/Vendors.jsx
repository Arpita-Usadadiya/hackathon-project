import React, { useEffect, useState } from "react";
import api from "../api";

export default function Vendors({ user }) {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    gstin: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await api.get("/vendors");
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createVendor = async (e) => {
    e.preventDefault();

    try {
      await api.post("/vendors", form);

      alert("Vendor Added");

      setForm({
        name: "",
        category: "",
        gstin: "",
        contact_name: "",
        email: "",
        phone: "",
        address: "",
      });

      loadVendors();
    } catch (err) {
      alert(
        err?.response?.data?.error ||
          "Failed to create vendor"
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/vendors/${id}/status`, {
        status,
      });

      loadVendors();
    } catch (err) {
      alert(
        err?.response?.data?.error ||
          "Failed to update vendor"
      );
    }
  };

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="card">
        <h2>Vendor Directory</h2>

        <input
          type="text"
          placeholder="Search Vendor..."
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <br />

        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>GSTIN</th>
              <th>Contact</th>
              <th>Status</th>

              {user?.role === "admin" && (
                <th>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredVendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>

                <td>{v.category}</td>

                <td>{v.gstin}</td>

                <td>{v.contact_name}</td>

                <td>{v.status}</td>

                {user?.role === "admin" && (
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        updateStatus(v.id, "active")
                      }
                    >
                      Activate
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        updateStatus(v.id, "suspended")
                      }
                    >
                      Suspend
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(user?.role === "officer" ||
        user?.role === "admin") && (
        <div className="card">
          <h2>Add Vendor</h2>

          <form onSubmit={createVendor}>
            <input
              className="form-control"
              placeholder="Vendor Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              className="form-control"
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value,
                })
              }
              required
            />

            <input
              className="form-control"
              placeholder="GSTIN"
              value={form.gstin}
              onChange={(e) =>
                setForm({
                  ...form,
                  gstin: e.target.value,
                })
              }
              required
            />

            <input
              className="form-control"
              placeholder="Contact Person"
              value={form.contact_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  contact_name: e.target.value,
                })
              }
              required
            />

            <input
              className="form-control"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              className="form-control"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
              required
            />

            <textarea
              className="form-control"
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({
                  ...form,
                  address: e.target.value,
                })
              }
            />

            <br />

            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Vendor
            </button>
          </form>
        </div>
      )}
    </>
  );
}