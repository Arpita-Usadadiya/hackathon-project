import React, { useEffect, useState } from "react";
import api from "../api";

export default function Documents() {
  const [pos, setPos] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [poRes, invoiceRes] = await Promise.all([
        api.get("/documents/pos"),
        api.get("/documents/invoices"),
      ]);

      setPos(poRes.data);
      setInvoices(invoiceRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const markPaid = async (invoiceId) => {
    try {
      await api.post(`/documents/invoices/${invoiceId}/pay`);

      alert("Invoice marked as paid");
      loadData();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to update invoice"
      );
    }
  };

  const emailInvoice = async (invoiceId) => {
    try {
      const res = await api.post(
        `/documents/invoices/${invoiceId}/email`
      );

      alert(res.data.message);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Failed to email invoice"
      );
    }
  };

  if (loading) {
    return (
      <div className="card">
        Loading documents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* PURCHASE ORDERS */}

      <div className="card">
        <h2>Purchase Orders</h2>

        {pos.length === 0 ? (
          <p>No Purchase Orders Found</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>PDF</th>
              </tr>
            </thead>

            <tbody>
              {pos.map((po) => (
                <tr key={po.id}>
                  <td>{po.po_number}</td>

                  <td>
                    ₹
                    {Number(
                      po.grand_total
                    ).toLocaleString()}
                  </td>

                  <td>{po.status}</td>

                  <td>
                    {new Date(
                      po.created_at
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/pdf/po/${po.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* INVOICES */}

      <div className="card">
        <h2>Invoices</h2>

        {invoices.length === 0 ? (
          <p>No Invoices Found</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_number}</td>

                  <td>
                    ₹
                    {Number(
                      invoice.grand_total
                    ).toLocaleString()}
                  </td>

                  <td>{invoice.status}</td>

                  <td>
                    {new Date(
                      invoice.due_date
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/api/pdf/invoice/${invoice.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </td>

                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      {(user?.role === "admin" ||
                        user?.role === "officer" ||
                        user?.role === "approver") &&
                        invoice.status !==
                          "paid" && (
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              markPaid(invoice.id)
                            }
                          >
                            Mark Paid
                          </button>
                        )}

                      <button
                        className="btn"
                        onClick={() =>
                          emailInvoice(invoice.id)
                        }
                      >
                        Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}