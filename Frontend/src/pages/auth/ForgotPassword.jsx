import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FiMail,
  FiArrowRight,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

import { forgotPassword } from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({
        email: trimmedEmail,
      });

      navigate("/verify-reset-otp", {
        state: {
          email: trimmedEmail,
        },
      });
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-h-[90vh] -mt-12 overflow-hidden bg-slate-50">
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
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500">
                  <FiMail size={25} />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-100">
                  Account Recovery
                </p>

                <h1 className="max-w-md text-4xl font-bold leading-tight">
                  Get back into your account.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
                  Enter the email address connected to your
                  FindBack account. We'll send you a secure OTP
                  to reset your password.
                </p>
              </div>
            </div>

            {/* SECURITY */}

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                <FiCheckCircle size={15} />
              </div>

              Secure password recovery
            </div>
          </div>

          {/* ==========================================
              RIGHT SIDE
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
                <FiMail size={22} />
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Forgot your password?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No worries. Enter your email and we'll send you
                an OTP to reset your password.
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter your email"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  We'll send a verification code to this email.
                </p>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP

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
                Remember your password?
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* BACK TO LOGIN */}

            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Back to Login
            </Link>

            {/* FOOTER */}

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Your account security matters to us. Never share
              your OTP or password with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;