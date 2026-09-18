import { useState } from "react";
import TestPanel from "./TestPanel";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function RequestBar() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState({});
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [body, setBody] = useState("");
  const [authType, setAuthType] = useState("none");
  const [token, setToken] = useState("");
  const [apiKeyName, setApiKeyName] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    fetch("https://reqlab-backend.onrender.com/api/history", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => setHistory(data));
  }, []);
  const navigate = useNavigate();
 


  const handleSend = async () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }
    try {
      setError("");
      console.log("SEND BUTTON CLICKED");
      const newHeaders = {};

      if (headerKey && headerValue) {
        newHeaders[headerKey] = headerValue;
      }
      if (authType === "bearer" && token) {
        newHeaders["Authorization"] = `Bearer ${token}`;

      }
      if (authType === "apikey" && apiKeyName && apiKeyValue) {
        newHeaders[apiKeyName] = apiKeyValue;
      }
      if (authType === "basic" && username && password) {
        const credentials = btoa(`${username}:${password}`);
        newHeaders["Authorization"] = `Basic ${credentials}`;
      }
      console.log("HEADERS BEING SENT:", newHeaders);
      const response = await fetch("https://reqlab-backend.onrender.com/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          method: method,
          url: url,
          headers: newHeaders,
          body: body
        })
      });

      const data = await response.json();

      const newEntry = {
        method,
        url,
        status: data.status
      };

      setHistory([newEntry, ...history]);
      setResponseData(data);
      console.log("FETCH STATUS:", response.status);
      console.log("RESPONSE DATA:", data);
      setResponseData(data);
      console.log("STATE DATA:", data);
      console.log(data);

    } catch (err) {
      console.log("REQUEST ERROR:", err);
      setError("Something went wrong while sending the request.");
    }
  };

  const clearHistory = async () => {
    await fetch("https://reqlab-backend.onrender.com/api/history", {
      method: "DELETE",
      credentials: "include"
    });

    setHistory([]);
  };
  return (

    <div className="request-bar">
      <div className="dashboard-header">
        <div className="welcome-text">

          <h2>Let's get started!</h2>
        </div>

      </div>
      <div className="request-row">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)} >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>

        <input
          type="text"
          placeholder="Enter request URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>
      <div className="request-options">

        <button
          className={activeSection === "auth" ? "active" : ""}
          onClick={() =>
            setActiveSection(activeSection === "auth" ? "" : "auth")
          }
        >
          Auth
        </button>

        <button
          className={activeSection === "headers" ? "active" : ""}
          onClick={() =>
            setActiveSection(activeSection === "headers" ? "" : "headers")
          }
        >
          Headers
        </button>

        <button
          className={activeSection === "body" ? "active" : ""}
          onClick={() =>
            setActiveSection(activeSection === "body" ? "" : "body")
          }
        >          Body
        </button>

      </div>

      {activeSection === "auth" && (
        <div className="option-content">
          <select
            value={authType}
            onChange={(e) => setAuthType(e.target.value)}
          >
            <option value="none">No Authentication</option>
            <option value="bearer">Bearer Token</option>
            <option value="apikey">API Key</option>
            <option value="basic">Basic Auth</option>
          </select>

          {authType === "bearer" && (
            <input
              type="text"
              placeholder="Enter Bearer Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          )}
          {authType === "apikey" && (
            <div>
              <input
                type="text"
                placeholder="API Key name"
                value={apiKeyName}
                onChange={(e) => setApiKeyName(e.target.value)}
              />

              <input
                type="text"
                placeholder="API Key value"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
              />
            </div>
          )}
          {authType === "basic" && (
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

        </div>
      )}
      {activeSection === "headers" && (
        <div className="option-content">
          <input
            type="text"
            placeholder="Header name"
            value={headerKey}
            onChange={(e) => setHeaderKey(e.target.value)}
          />

          <input
            type="text"
            placeholder="Header value"
            value={headerValue}
            onChange={(e) => setHeaderValue(e.target.value)}
          />
        </div>
      )}
      {activeSection === "body" && (
        <div className="option-content">
          <textarea
            placeholder="Enter request body as JSON"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows="8"
            cols="50"
          />
        </div>
      )}
      {error && (
        <p>{error}</p>
      )}
      {responseData && (
        <div className="response-panel" >
          <h3>Response</h3>
          <p>Status: {responseData.status}</p>
          {responseData.error && (
            <p>
              Error: {
                responseData.status === 401
                  ? "Unauthorized"
                  : responseData.status === 403
                    ? "Forbidden"
                    : responseData.status === 404
                      ? "Not Found"
                      : responseData.status >= 500
                        ? "Server Error"
                        : responseData.message
              }
            </p>
          )}

          {responseData.data && (
            <pre>
              {JSON.stringify(responseData.data, null, 2)}
            </pre>
          )}
        </div>
      )
      }
      <button
      className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Hide History" : "Request History"}
      </button>

      {showHistory && (
        <div className="history-panel">
         <h3>Request History</h3>

{history.length === 0 ? (
  <p>No request history available.</p>
) : (
  <div className="history-list">
    {history.map((item) => (
      <div key={item.id} className="history-item">
        <span className="history-method">
          <strong>{item.method}</strong>
        </span>

        <p>{item.url}</p>

        <span className="history-status">{item.status}</span>
      </div>
    ))}

    <button className="clear-history-btn" onClick={clearHistory}>
      Clear History
    </button>
  </div>
)}
        </div>
      )}
      <TestPanel responseData={responseData} url={url} method={method} />

    </div>
  );
}

export default RequestBar