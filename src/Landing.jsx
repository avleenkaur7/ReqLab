import { useNavigate } from "react-router-dom";
import "./Landing.css";
import logo from "./assets/Logo.png";
function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      <nav className="landing-navbar">
        <div className="landing-logo">
          <img src={logo} alt="ReqLab logo" />
          <span>ReqLab</span>
        </div>

        <div className="landing-nav-buttons">
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="signup-btn"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>


      <main className="landing-main">

        <section className="hero-section">
          <div className="hero-content">

            <h1>
              Test APIs.
              <br />
              Build with confidence.
            </h1>

            <p>
              ReqLab is a full-stack API testing platform that lets you
              create, send, and inspect HTTP requests from one place.
            </p>

            <button
              className="get-started-btn"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>

          </div>
        </section>


        <section className="about-section">

          <h2>What is ReqLab?</h2>

          <p>
            ReqLab provides a simple workspace for building and testing
            API requests. Create requests, send them to your APIs,
            inspect responses, and keep track of your testing history.
          </p>

        </section>


        <section className="features-section">

          <h2>Everything you need to test APIs</h2>

          <div className="features-grid">

            <div className="feature-card">
              <h3>Request Builder</h3>
              <p>
                Build GET, POST, PUT and DELETE requests with headers,
                parameters and request bodies.
              </p>
            </div>

            <div className="feature-card">
              <h3>Response Inspection</h3>
              <p>
                Send requests and inspect status codes and response data
                in one place.
              </p>
            </div>

            <div className="feature-card">
              <h3>Request History</h3>
              <p>
                Keep track of previously executed requests for easier
                testing and debugging.
              </p>
            </div>

            <div className="feature-card">
              <h3>Saved Tests</h3>
              <p>
                Save API tests and manage them from your ReqLab workspace.
              </p>
            </div>

          </div>

        </section>


        <section className="cta-section">

          <h2>Ready to test your APIs?</h2>

          <p>
            Create your ReqLab account and start testing.
          </p>

          <button
            className="cta-btn"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>

        </section>

      </main>


     <footer className="landing-footer">
  <p>Built by Avleen Kaur © 2026 ReqLab</p>
</footer>

    </div>
  );
}

export default Landing;