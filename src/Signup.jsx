import React from 'react'
import { useState } from "react"
import "./Signup.css";
import { useNavigate } from 'react-router-dom'
const Signup = () => {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate();
  async function handleSignup(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
  setError("Password must be at least 6 characters long");
  return;
}
    const response = await fetch("https://reqlab-backend.onrender.com/api/signup", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        name: name,
        password: password
      }),
      credentials: "include",
      headers: {
        "Content-type": "application/json"
      },

    })
    if (response.status === 200) {
      navigate("/login")
    }
    else {
setError("Signup failed. This email may already be registered.");    }

  }
  return (
    <div className="signup-page">
      <div className="signup-box">
        <h1 className="welcome-text">Welcome to ReqLab</h1>
        <h2>Create your account</h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Sign up</button>
        </form>

        {error && <p className="signup-error">{error}</p>}

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup