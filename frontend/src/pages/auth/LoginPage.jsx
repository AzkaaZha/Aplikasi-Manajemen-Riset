import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../../api/authApi";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import Input from "../../components/common/Input";
import ErrorState from "../../components/common/ErrorState";
import Swal from "sweetalert2";

function Login() {
  const navigate = useNavigate();
  const { loginContext } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors(prev => ({
      ...prev,
      [name]: "",
      general: ""
    }));

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });
    setIsLoading(true);

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("access_token", result.access_token);
      const user = await getMe();
      loginContext(user, result.access_token);

      
      Swal.fire({
        icon: "success",
        title: "Selamat Datang Kembali",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      }).then(() => {
        if (user.role_id === ROLES.ADMIN) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      });

    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Login gagal. Silakan periksa kredensial Anda.";

      const msgLower = typeof message === 'string' ? message.toLowerCase() : "";

      
      if (msgLower.includes("email") && msgLower.includes("password")) {
        
        setErrors(prev => ({ ...prev, general: message }));
      } else if (msgLower.includes("email") || msgLower.includes("user")) {
        setErrors(prev => ({ ...prev, email: message }));
      } else if (msgLower.includes("password")) {
        setErrors(prev => ({ ...prev, password: message }));
      } else {
        setErrors(prev => ({ ...prev, general: message }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {}
        <div className="login-header">
          <div className="logo-circle mx-auto mb-3">NF</div>
          <h4 className="fw-bold mb-1">SIMR STT NF</h4>
          <p className="text-muted small">Masuk untuk mengelola sistem manajemen riset</p>
        </div>

        {}
        <div className="login-body">
          {}
          <ErrorState message={errors.general} />

          <form onSubmit={handleLogin}>
            <Input
              label="Alamat Email"
              type="email"
              name="email"
              placeholder="nama@contoh.com"
              value={form.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <Input
              label="Kata Sandi"
              type="password"
              name="password"
              placeholder="Masukkan kata sandi Anda"
              value={form.password}
              onChange={handleChange}
              required
              error={errors.password}
            />


            <button
              className="btn btn-success w-100 py-2 fw-bold mt-3"
              disabled={isLoading}
            >
              Masuk
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Login;
