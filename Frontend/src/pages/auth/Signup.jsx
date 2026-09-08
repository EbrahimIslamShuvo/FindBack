import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiUser,
  FiMail,
  FiPhone,
  FiHash,
  FiLock,
  FiCamera,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import AuthInput
  from "../../components/auth/AuthInput";

import PasswordInput
  from "../../components/auth/PasswordInput";

import {
  registerUser,
} from "../../services/authService";


const Signup = () => {

  const navigate =
    useNavigate();


  const [
    formData,
    setFormData,
  ] = useState({

    name: "",

    email: "",

    password: "",

    phone: "",

    institutionId: "",

  });


  const [
    picture,
    setPicture,
  ] = useState(null);


  const [
    preview,
    setPreview,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;


      setFormData(
        previous => ({

          ...previous,

          [name]:
            value,

        })
      );
    };


  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange =
    (e) => {

      const file =
        e.target.files?.[0];


      if (!file) {
        return;
      }


      const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp",

      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        setError(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        );

        return;
      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        setError(
          "Image size must be less than 5MB."
        );

        return;
      }


      setError("");

      setPicture(file);

      setPreview(
        URL.createObjectURL(
          file
        )
      );
    };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      setError("");


      try {

        setLoading(true);


        const data =
          new FormData();


        data.append(
          "name",
          formData.name
        );


        data.append(
          "email",
          formData.email
        );


        data.append(
          "password",
          formData.password
        );


        data.append(
          "phone",
          formData.phone
        );


        data.append(
          "institutionId",
          formData.institutionId
        );


        if (picture) {

          data.append(
            "picture",
            picture
          );

        }


        await registerUser(
          data
        );


        navigate(
          "/verify-signup-otp",
          {
            state: {
              email:
                formData.email,
            },
          }
        );


      } catch (error) {

        console.error(
          "REGISTRATION ERROR:",
          error
        );


        setError(

          error.response
            ?.data
            ?.message ||

          error.message ||

          "Registration failed."

        );

      } finally {

        setLoading(false);

      }
    };


  return (

    <div className="
      min-h-screen
      bg-slate-50
      px-4
      py-8
      sm:py-12
    ">

      <div className="
        mx-auto
        w-full
        max-w-5xl
      ">

        <div className="
          overflow-hidden
          rounded-3xl
          border
          border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(15,23,42,0.08)]
        ">

          <div className="
            grid
            lg:grid-cols-[0.85fr_1.15fr]
          ">

            {/* =================================
                LEFT SIDE
            ================================= */}

            <div className="
              hidden
              bg-blue-600
              p-10
              text-white
              lg:flex
              lg:flex-col
              lg:justify-between
            ">

              <div>

                <div className="
                  mb-12
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-blue-600
                  ">

                    <FiCheckCircle
                      size={24}
                    />

                  </div>


                  <div>

                    <h2 className="
                      text-xl
                      font-bold
                    ">
                      FindBack
                    </h2>


                    <p className="
                      text-xs
                      text-blue-100
                    ">
                      Lost & Found Platform
                    </p>

                  </div>

                </div>


                <h1 className="
                  max-w-sm
                  text-4xl
                  font-bold
                  leading-tight
                ">

                  Find what matters.

                  <br />

                  Return what belongs.

                </h1>


                <p className="
                  mt-5
                  max-w-sm
                  text-sm
                  leading-6
                  text-blue-100
                ">

                  Create your FindBack account and
                  become part of a community that helps
                  reconnect people with their lost belongings.

                </p>

              </div>


              <div className="
                space-y-4
              ">

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/15
                  ">

                    <FiCheckCircle />

                  </div>


                  <span className="text-sm">
                    Secure account verification
                  </span>

                </div>


                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/15
                  ">

                    <FiCheckCircle />

                  </div>


                  <span className="text-sm">
                    Easy lost item reporting
                  </span>

                </div>


                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-white/15
                  ">

                    <FiCheckCircle />

                  </div>


                  <span className="text-sm">
                    Connect with your community
                  </span>

                </div>

              </div>

            </div>


            {/* =================================
                RIGHT SIDE
            ================================= */}

            <div className="
              p-6
              sm:p-10
            ">

              <div className="
                mb-8
              ">

                <p className="
                  mb-2
                  text-sm
                  font-semibold
                  text-blue-600
                ">
                  GET STARTED
                </p>


                <h1 className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-900
                ">
                  Create your account
                </h1>


                <p className="
                  mt-2
                  text-sm
                  text-slate-500
                ">
                  Fill in your information to join FindBack.
                </p>

              </div>


              {/* ERROR */}

              {error && (

                <div className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                ">

                  <FiAlertCircle
                    className="
                      mt-0.5
                      shrink-0
                    "
                    size={18}
                  />


                  <span>
                    {error}
                  </span>

                </div>

              )}


              {/* =================================
                  FORM
              ================================= */}

              <form
                onSubmit={
                  handleSubmit
                }

                autoComplete="off"

                className="
                  space-y-5
                "
              >

                {/* NAME + EMAIL */}

                <div className="
                  grid
                  gap-5
                  sm:grid-cols-2
                ">

                  <div>

                    <div className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      <FiUser
                        className="text-blue-600"
                      />

                      Full Name

                    </div>


                    <AuthInput

                      label=""

                      name="name"

                      value={
                        formData.name
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Your full name"

                      autoComplete="off"

                    />

                  </div>


                  <div>

                    <div className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      <FiMail
                        className="text-blue-600"
                      />

                      Email

                    </div>


                    <AuthInput

                      label=""

                      type="email"

                      name="email"

                      value={
                        formData.email
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="you@example.com"

                      autoComplete="off"

                    />

                  </div>

                </div>


                {/* PHONE + INSTITUTION */}

                <div className="
                  grid
                  gap-5
                  sm:grid-cols-2
                ">

                  <div>

                    <div className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      <FiPhone
                        className="text-blue-600"
                      />

                      Phone Number

                    </div>


                    <AuthInput

                      label=""

                      type="tel"

                      name="phone"

                      value={
                        formData.phone
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="01XXXXXXXXX"

                      autoComplete="off"

                    />

                  </div>


                  <div>

                    <div className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-slate-700
                    ">

                      <FiHash
                        className="text-blue-600"
                      />

                      Institution ID

                    </div>


                    <AuthInput

                      label=""

                      name="institutionId"

                      value={
                        formData.institutionId
                      }

                      onChange={
                        handleChange
                      }

                      placeholder="Enter your ID"

                      autoComplete="off"

                    />

                  </div>

                </div>


                {/* PASSWORD */}

                <div>

                  <div className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-slate-700
                  ">

                    <FiLock
                      className="text-blue-600"
                    />

                    Password

                  </div>


                  <PasswordInput

                    label=""

                    name="password"

                    value={
                      formData.password
                    }

                    onChange={
                      handleChange
                    }

                    placeholder="Create a strong password"

                    autoComplete="new-password"

                  />

                </div>


                {/* PROFILE IMAGE */}

                <div>

                  <label className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-sm
                    font-medium
                    text-slate-700
                  ">

                    <FiCamera
                      className="text-blue-600"
                    />

                    Profile Picture

                  </label>


                  <div className="
                    flex
                    items-center
                    gap-4
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    p-4
                  ">

                    <div className="
                      flex
                      h-16
                      w-16
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      bg-blue-100
                      text-blue-600
                    ">

                      {preview ? (

                        <img
                          src={preview}
                          alt="Preview"
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                      ) : (

                        <FiUser
                          size={25}
                        />

                      )}

                    </div>


                    <div className="
                      min-w-0
                      flex-1
                    ">

                      <label className="
                        inline-flex
                        cursor-pointer
                        items-center
                        rounded-lg
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-semibold
                        text-slate-700
                        shadow-sm
                        ring-1
                        ring-slate-200
                        transition
                        hover:bg-slate-50
                      ">

                        Choose Photo


                        <input

                          type="file"

                          accept="
                            image/png,
                            image/jpeg,
                            image/jpg,
                            image/webp
                          "

                          onChange={
                            handleImageChange
                          }

                          autoComplete="off"

                          className="hidden"

                        />

                      </label>


                      <p className="
                        mt-1
                        text-xs
                        text-slate-400
                      ">
                        JPG, PNG or WEBP · Max 5MB
                      </p>

                    </div>

                  </div>

                </div>


                {/* SUBMIT */}

                <button

                  type="submit"

                  disabled={loading}

                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    py-3.5
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    duration-200
                    hover:bg-blue-700
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading
                    ? "Creating Account..."
                    : "Create Account"}


                  {!loading && (

                    <FiArrowRight
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                      size={19}
                    />

                  )}

                </button>

              </form>


              {/* LOGIN */}

              <div className="
                mt-7
                border-t
                border-slate-100
                pt-6
                text-center
              ">

                <p className="
                  text-sm
                  text-slate-500
                ">

                  Already have an account?

                  {" "}

                  <Link

                    to="/login"

                    className="
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    "
                  >
                    Login
                  </Link>

                </p>

              </div>

            </div>

          </div>

        </div>


        <p className="
          mt-5
          text-center
          text-xs
          text-slate-400
        ">
          By creating an account, you agree to use
          FindBack responsibly.
        </p>

      </div>

    </div>
  );
};


export default Signup;