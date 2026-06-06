import React, { useState } from "react";
import api from "../api";

export default function Quotations({ rfq }) {
  const [unitPrice, setUnitPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");

  const submitQuote = async () => {
    try {
      await api.post("/quotations", {
        rfq_id: rfq.id,
        unit_price: unitPrice,
        delivery_days: deliveryDays,
      });

      alert("Quotation submitted");
    } catch (err) {
      alert(err.response?.data?.error);
    }
  };

  return (
    <div className="card">
      <h2>{rfq.title}</h2>

      <input
        placeholder="Unit Price"
        value={unitPrice}
        onChange={(e) => setUnitPrice(e.target.value)}
      />

      <input
        placeholder="Delivery Days"
        value={deliveryDays}
        onChange={(e) => setDeliveryDays(e.target.value)}
      />

      <button onClick={submitQuote}>
        Submit Quote
      </button>
    </div>
  );
}