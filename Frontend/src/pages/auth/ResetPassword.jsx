import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import PasswordInput
  from "../../components/auth/PasswordInput";

import {
  resetPassword,
} from "../../services/authService";


const ResetPassword = () => {

  const location =
    useLocation();

  const navigate =
    useNavigate();


  const email =
    location.state?.email ||
    "";

  const otp =
    location.state?.otp ||
    "";


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");

      setSuccess("");


      if (
        password.length < 6
      ) {

        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }


      if (
        password !==
        confirmPassword
      ) {

        setError(
          "Passwords do not match."
        );

        return;
      }


      try {

        setLoading(true);


        await resetPassword({

          email,

          otp,

          newPassword:
            password,

        });


        setSuccess(
          "Password reset successfully."
        );


        setTimeout(() => {

          navigate(
            "/login"
          );

        }, 1500);


      } catch (error) {

        setError(

          error.response
            ?.data
            ?.message ||

          "Password reset failed."

        );

      } finally {

        setLoading(false);

      }
    };


  return (

    <div className="
      flex
      min-h-screen
      items-center
      justify-center
      bg-gray-100
      px-4
    ">

      <div className="
        w-full
        max-w-md
        rounded-2xl
        bg-white
        p-8
        shadow-lg
      ">

        <div className="
          mb-8
          text-center
        ">

          <h1 className="
            text-3xl
            font-bold
          ">
            Reset Password
          </h1>


          <p className="
            mt-2
            text-gray-500
          ">
            Create your new password.
          </p>

        </div>


        {error && (

          <div className="
            mb-5
            rounded-lg
            bg-red-50
            p-3
            text-sm
            text-red-600
          ">
            {error}
          </div>

        )}


        {success && (

          <div className="
            mb-5
            rounded-lg
            bg-green-50
            p-3
            text-sm
            text-green-600
          ">
            {success}
          </div>

        )}


        <form
          onSubmit={
            handleSubmit
          }
        >

          <PasswordInput

            label="New Password"

            name="password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            placeholder="Enter new password"

          />


          <PasswordInput

            label="Confirm Password"

            name="confirmPassword"

            value={
              confirmPassword
            }

            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }

            placeholder="Confirm password"

          />


          <button

            type="submit"

            disabled={loading}

            className="
              mt-2
              w-full
              rounded-lg
              bg-blue-600
              py-3
              font-semibold
              text-white
              hover:bg-blue-700
              disabled:bg-blue-300
            "

          >

            {loading
              ? "Resetting..."
              : "Reset Password"}

          </button>

        </form>

      </div>

    </div>
  );
};


export default ResetPassword;