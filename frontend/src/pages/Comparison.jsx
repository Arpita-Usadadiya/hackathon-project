import React, { useEffect, useState } from "react";

export default function Comparison({
  rfqId,
  setView,
  setSelectedRfqId,
}) {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (rfqId) {
      fetchBids();
    }
  }, [rfqId]);

  const fetchBids = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/quotations/rfq/${rfqId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load quotations");
      }

      setBids(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveQuote = async (quoteId) => {
    const confirmApproval = window.confirm(
      "Approve this quotation and generate Purchase Order?"
    );

    if (!confirmApproval) return;

    try {
      setProcessing(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/approvals/${quoteId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "approve",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(
        `Quotation Approved

PO Number: ${data.po.po_number}
Invoice: ${data.invoice.invoice_number}`
      );

      setView("documents");
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const rejectQuote = async (quoteId) => {
    try {
      setProcessing(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/approvals/${quoteId}/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action: "reject",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      fetchBids();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!rfqId) {
    return (
      <div className="card">
        <h2>No RFQ Selected</h2>
        <p>Open an RFQ first to compare quotations.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="card">Loading quotations...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const lowestPrice =
    bids.length > 0
      ? Math.min(...bids.map((b) => Number(b.total_price)))
      : 0;

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontWeight: 800 }}>
          Bid Comparison Matrix
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Compare vendor quotations side-by-side
        </p>
      </div>

      <div className="card">
        <h3>RFQ #{rfqId}</h3>

        {bids.length === 0 ? (
          <p>No quotations submitted yet.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Delivery</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bids.map((bid) => (
                <tr
                  key={bid.id}
                  style={{
                    background:
                      Number(bid.total_price) === lowestPrice
                        ? "#14532d"
                        : "transparent",
                  }}
                >
                  <td>{bid.vendor_name}</td>

                  <td>{bid.vendor_category}</td>

                  <td>
                    ₹{Number(bid.unit_price).toLocaleString()}
                  </td>

                  <td>
                    ₹{Number(bid.total_price).toLocaleString()}
                  </td>

                  <td>{bid.delivery_days} Days</td>

                  <td>{bid.vendor_rating}</td>

                  <td>{bid.status}</td>

                  <td>
                    {bid.status === "submitted" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <button
                          className="btn btn-primary"
                          disabled={processing}
                          onClick={() =>
                            approveQuote(bid.id)
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn"
                          disabled={processing}
                          onClick={() =>
                            rejectQuote(bid.id)
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {bid.status === "approved" && (
                      <span
                        style={{
                          color: "#22c55e",
                          fontWeight: 700,
                        }}
                      >
                        Approved
                      </span>
                    )}

                    {bid.status === "rejected" && (
                      <span
                        style={{
                          color: "#ef4444",
                          fontWeight: 700,
                        }}
                      >
                        Rejected
                      </span>
                    )}
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