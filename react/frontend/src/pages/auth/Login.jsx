import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../../services/authService";
import { saveToken } from "../../utils/token";
import { ROLES } from "../../constants/roles";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      saveToken(result.access_token);

      const user = await getMe();
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role_id === ROLES.ADMIN) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Login gagal. Periksa email dan password.";

      alert(message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="login-card">
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="logo-circle mx-auto mb-2">NF</div>
            <h5>SIMR STT NF</h5>
            <small>Sign in to manage research system</small>
          </div>

          <form onSubmit={handleLogin}>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control mb-3"
              placeholder="Enter your email"
              onChange={handleChange}
              required
            />

            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control mb-3"
              placeholder="Enter your password"
              onChange={handleChange}
              required
            />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>

              <small style={{ cursor: "pointer", color: "#063161" }}>
                Forgot password?
              </small>
            </div>

            <button className="btn btn-success w-100">
              Sign In
            </button>
          </form>
        </div>

        <div className="text-center py-3 border-top">
          <small className="text-muted">
            Need access? Contact your system administrator
          </small>
        </div>
      </div>
    </div>
  );
}

export default Login;