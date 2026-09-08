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

import {
  verifySignupOtp,
} from "../../services/authService";

const VerifySignupOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // OTP CHANGE
  // ========================================

  const handleOtpChange = (e) => {
    const value = e.target.value;

    const numericValue = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(numericValue);

    if (error) {
      setError("");
    }
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Email information is missing. Please try again."
      );
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the complete 6 digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      await verifySignupOtp({
        email,
        otp,
      });

      setSuccess(
        "Email verified successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error(
        "SIGNUP OTP ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
        "OTP verification failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">

      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">

        <div className="w-full">

          {/* ================================= */}
          {/* BACK */}
          {/* ================================= */}

          <Link
            to="/signup"
            className="
              mb-3
              inline-flex
              items-center
              gap-2
              text-sm
              font-medium
              text-slate-500
              transition
              hover:text-blue-600
            "
          >
            <FiArrowLeft size={17} />

            Back to Signup
          </Link>


          {/* ================================= */}
          {/* CARD */}
          {/* ================================= */}

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-7
              shadow-xl
              shadow-slate-200/60
              sm:p-9
            "
          >

            {/* ================================= */}
            {/* ICON */}
            {/* ================================= */}

            <div className="mb-6 flex justify-center">

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-50
                  text-blue-600
                "
              >
                <FiShield size={30} />
              </div>

            </div>


            {/* ================================= */}
            {/* HEADING */}
            {/* ================================= */}

            <div className="text-center">

              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                "
              >
                Verify Your Email
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                We sent a 6-digit verification
                code to your email address.
              </p>


              {/* EMAIL */}

              <div
                className="
                  mt-3
                  inline-flex
                  max-w-full
                  items-center
                  gap-2
                  rounded-full
                  bg-slate-50
                  px-4
                  py-2
                "
              >

                <FiMail
                  size={15}
                  className="shrink-0 text-blue-600"
                />

                <span
                  className="
                    max-w-[230px]
                    truncate
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  {email || "your email"}
                </span>

              </div>

            </div>


            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {error && (

              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-center
                  text-sm
                  font-medium
                  text-red-600
                "
              >
                {error}
              </div>

            )}


            {/* ================================= */}
            {/* SUCCESS */}
            {/* ================================= */}

            {success && (

              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-green-200
                  bg-green-50
                  px-4
                  py-3
                  text-center
                  text-sm
                  font-medium
                  text-green-600
                "
              >
                {success}
              </div>

            )}


            {/* ================================= */}
            {/* FORM */}
            {/* ================================= */}

            <form
              onSubmit={handleSubmit}
              className="mt-8"
              autoComplete="off"
            >

              <label
                htmlFor="signup-otp"
                className="
                  mb-3
                  block
                  text-center
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Enter verification code
              </label>


              {/* ================================= */}
              {/* OTP INPUT */}
              {/* ================================= */}

              <input
                id="signup-otp"
                name="signupVerificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
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
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
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


              {/* ================================= */}
              {/* OTP STATUS */}
              {/* ================================= */}

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


              {/* ================================= */}
              {/* VERIFY BUTTON */}
              {/* ================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6
                }
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

                {loading
                  ? "Verifying..."
                  : "Verify Email"}

              </button>

            </form>


            {/* ================================= */}
            {/* BOTTOM */}
            {/* ================================= */}

            <div
              className="
                mt-7
                border-t
                border-slate-100
                pt-6
                text-center
              "
            >

              <p className="text-sm text-slate-500">
                Didn't receive the code?
              </p>

              <Link
                to="/signup"
                className="
                  mt-2
                  inline-block
                  text-sm
                  font-semibold
                  text-blue-600
                  transition
                  hover:text-blue-700
                "
              >
                Back to Signup
              </Link>

            </div>

          </div>


          {/* ================================= */}
          {/* SECURITY TEXT */}
          {/* ================================= */}

          <p
            className="
              mt-6
              text-center
              text-xs
              leading-5
              text-slate-400
            "
          >
            Your verification code is secure and
            will only be used to verify your email.
          </p>

        </div>

      </div>

    </div>
  );
};

export default VerifySignupOtp;