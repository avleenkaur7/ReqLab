import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
   

  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
     if (!email || !password) {
  setError("Please enter your email and password");
  return;
}
    const response = await fetch("https://reqlab-backend.onrender.com/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      }),
      

    });

    const data = await response.json();
     if (response.status === 200) {
  const data = await response.json();
  localStorage.setItem("token", data.token);
  navigate("/app");
}
     else{
      setError("Incorrect password , try again")
     }
    console.log(data);
    console.log(response.status);
  };
  
  return (
  <div className="login-page">
    <div className="login-box">
  <h1 className="welcome-text">Welcome</h1>
  <h2>Login to ReqLab</h2>

  <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {error && <p className="login-error">{error}</p>}
      <p className="signup-link">
  Don't have an account?{" "}
  <span onClick={() => navigate("/signup")}>
    Sign up
  </span>
</p>
    </div>
    
  </div>
);
}

export default Login;