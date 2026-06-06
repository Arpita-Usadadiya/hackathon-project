import React, { useEffect, useState } from "react";
import api from "../api";

export default function Approvals() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const res = await api.get("/approvals");
    setQuotes(res.data);
  };

  const actionQuote = async (id, action) => {
    await api.post(`/approvals/${id}/action`, {
      action,
    });

    alert(`Quotation ${action}d`);
    loadQuotes();
  };

  return (
    <div>
      <h2>Pending Approvals</h2>

      {quotes.map((q) => (
        <div className="card" key={q.id}>
          <h3>{q.vendor_name}</h3>

          <p>RFQ : {q.rfq_title}</p>
          <p>Total : ₹{q.total_price}</p>

          <button
            className="btn btn-success"
            onClick={() => actionQuote(q.id, "approve")}
          >
            Approve
          </button>

          <button
            className="btn btn-danger"
            onClick={() => actionQuote(q.id, "reject")}
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}