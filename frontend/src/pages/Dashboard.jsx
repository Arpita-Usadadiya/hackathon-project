import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard({
  user,
  setView,
}) {
  const [rfqs, setRfqs] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const requests = [
        api.get("/rfqs"),
        api.get("/vendors"),
        api.get("/documents/pos"),
        api.get("/documents/invoices"),
      ];

      if (
        user.role === "approver" ||
        user.role === "admin"
      ) {
        requests.push(api.get("/approvals"));
      }

      const results = await Promise.all(requests);

      setRfqs(results[0].data);
      setVendors(results[1].data);
      setPurchaseOrders(results[2].data);
      setInvoices(results[3].data);

      if (
        user.role === "approver" ||
        user.role === "admin"
      ) {
        setApprovals(results[4].data);
      }
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <>
      {/* SUMMARY CARDS */}

      <div className="dashboard-grid">
        <div className="stat-card">
          <h4>Total RFQs</h4>
          <h1>{rfqs.length}</h1>
        </div>

        <div className="stat-card">
          <h4>Registered Vendors</h4>
          <h1>{vendors.length}</h1>
        </div>

        <div className="stat-card">
          <h4>Pending Approvals</h4>
          <h1>{approvals.length}</h1>
        </div>

        <div className="stat-card">
          <h4>Purchase Orders</h4>
          <h1>{purchaseOrders.length}</h1>
        </div>

        <div className="stat-card">
          <h4>Invoices</h4>
          <h1>{invoices.length}</h1>
        </div>
      </div>

      {/* QUICK ACTIONS */}

      {(user.role === "officer" ||
        user.role === "admin") && (
        <div className="card">
          <h3>Quick Actions</h3>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "15px",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => setView("rfqs")}
            >
              Create RFQ
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setView("vendors")}
            >
              Manage Vendors
            </button>

            <button
              className="btn btn-primary"
              onClick={() => setView("documents")}
            >
              Purchase Orders
            </button>
          </div>
        </div>
      )}

      {/* RECENT RFQs */}

      <div className="card">
        <h3>Recent RFQs</h3>

        {rfqs.length === 0 ? (
          <p>No RFQs Available</p>
        ) : (
          <table
            style={{
              width: "100%",
              marginTop: "15px",
            }}
          >
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rfqs.slice(0, 5).map((rfq) => (
                <tr key={rfq.id}>
                  <td>{rfq.title}</td>
                  <td>{rfq.category}</td>
                  <td>{rfq.quantity}</td>
                  <td>{rfq.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PENDING APPROVALS */}

      {(user.role === "approver" ||
        user.role === "admin") && (
        <div className="card">
          <h3>Pending Quotations</h3>

          {approvals.length === 0 ? (
            <p>No quotations awaiting approval</p>
          ) : (
            <table
              style={{
                width: "100%",
                marginTop: "15px",
              }}
            >
              <thead>
                <tr>
                  <th>RFQ</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {approvals.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>{item.rfq_title}</td>

                    <td>{item.vendor_name}</td>

                    <td>
                      ₹
                      {Number(
                        item.total_price
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}