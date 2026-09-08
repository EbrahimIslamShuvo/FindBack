import { useState } from "react";
import {
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiShield,
  FiMail,
  FiCheck,
} from "react-icons/fi";

const VerifyResetOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleOtpChange = (e) => {
    const value = e.target.value;

    // Only numbers
    const numericValue = value.replace(/\D/g, "");

    // Maximum 6 digits
    setOtp(numericValue.slice(0, 6));

    // Remove error while typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email information is missing. Please try again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6 digit OTP.");
      return;
    }

    navigate("/reset-password", {
      state: {
        email,
        otp,
      },
    });
  };

  return (
    <div className="max-h-[90vh] -mt-8 bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full">

          {/* Back */}
          <Link
            to="/forgot-password"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <FiArrowLeft size={17} />
            Back
          </Link>

          {/* Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">

            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiShield size={30} />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Verify OTP
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                We sent a 6-digit verification code to
              </p>

              {/* Email */}
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2">
                <FiMail
                  size={15}
                  className="text-blue-600"
                />

                <span className="max-w-[230px] truncate text-sm font-semibold text-slate-700">
                  {email || "your email"}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8"
              autoComplete="off"
            >

              <label
                htmlFor="reset-otp"
                className="mb-3 block text-center text-sm font-semibold text-slate-700"
              >
                Enter verification code
              </label>

              {/* OTP Input */}
              <input
                id="reset-otp"
                name="resetOtp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                onPaste={(e) => {
                  e.preventDefault();

                  const pastedText =
                    e.clipboardData
                      .getData("text")
                      .replace(/\D/g, "")
                      .slice(0, 6);

                  setOtp(pastedText);
                }}
                placeholder="000000"
                className="
                  block
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-5
                  text-center
                  text-3xl
                  font-bold
                  tracking-[0.45em]
                  text-slate-900
                  caret-blue-600
                  outline-none
                  transition
                  placeholder:text-slate-300
                  focus:border-blue-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-blue-100
                "
              />

              {/* OTP status */}
              <div className="mt-3 flex justify-center">
                <span
                  className={`text-xs font-medium ${
                    otp.length === 6
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  {otp.length}/6 digits
                </span>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={otp.length !== 6}
                className="
                  mt-6
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-blue-600
                  py-4
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition
                  hover:bg-blue-700
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:bg-slate-200
                  disabled:text-slate-400
                  disabled:shadow-none
                "
              >
                <FiCheck size={19} />
                Verify OTP
              </button>
            </form>

            {/* Bottom */}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              <Link
                to="/forgot-password"
                className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Send OTP Again
              </Link>
            </div>

          </div>

          {/* Security text */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Your verification code is secure and will only be used
            to reset your password.
          </p>

        </div>
      </div>
    </div>
  );
};

export default VerifyResetOtp;