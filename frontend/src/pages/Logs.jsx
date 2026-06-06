import React, { useEffect, useState } from "react";
import api from "../api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get("/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Activity Logs</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Activity Logs</h2>

      {logs.length === 0 ? (
        <p>No logs found</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: "12px",
                border: "1px solid #333",
                borderRadius: "8px",
                background: "#111827",
              }}
            >
              <div>
                <strong>{log.action}</strong>
              </div>

              <div>
                User: {log.user_name}
              </div>

              <div>
                Role: {log.user_role}
              </div>

              <div>
                {log.details}
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}