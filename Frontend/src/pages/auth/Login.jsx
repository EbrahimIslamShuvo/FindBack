import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/ChatGPT Image Aug 14, 2026 at 02_45_30 AM.png"

import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiShield,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";

import { loginUser } from "../../services/authService";
import { saveAuthData } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(formData);

      const { accessToken, user } = response.data;

      saveAuthData(accessToken, user);

      navigate("/");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-h-[90vh] overflow-hidden bg-slate-50 -mt-11">
      {/* ==========================================
          BACKGROUND DECORATION
      ========================================== */}

      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-100 blur-3xl" />

      <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />

      {/* ==========================================
          MAIN
      ========================================== */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 lg:grid-cols-2">

          {/* ==========================================
              LEFT SIDE
          ========================================== */}

          <div className="hidden bg-blue-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              {/* LOGO */}

              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg">
                  <FiShield size={22} />
                </div>

                <span className="text-2xl font-bold">
                  FindBack
                </span>
              </Link>

              {/* CONTENT */}

              <div className="mt-24">
                <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-100">
                  Welcome to FindBack
                </p>

                <h1 className="max-w-md text-4xl font-bold leading-tight">
                  Find what you lost.
                  <br />
                  Return what you found.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
                  Connect with your community to report lost items,
                  find missing belongings, and help return them to
                  their rightful owners.
                </p>
              </div>
            </div>

            {/* BOTTOM */}

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <FiShield size={15} />
              </div>

              Secure and trusted community platform
            </div>
          </div>

          {/* ==========================================
              RIGHT SIDE - LOGIN
          ========================================== */}

          <div className="p-6 sm:p-10 lg:p-12">
            {/* MOBILE LOGO */}

            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                  <FiShield size={22} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                  FindBack
                </span>
              </Link>
            </div>

            {/* HEADER */}

            <div className="mb-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiLock size={22} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your FindBack account.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <FiAlertCircle
                  className="mt-0.5 shrink-0"
                  size={17}
                />

                <span>{error}</span>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-5"
            >
              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <FiMail
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <FiLock
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Logging in...
                  </>
                ) : (
                  <>
                    Login

                    <FiArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* DIVIDER */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                New to FindBack?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* REGISTER */}

            <Link
              to="/signup"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Create an account
            </Link>

            {/* FOOTER */}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to use FindBack responsibly
              and help return lost belongings to their owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;