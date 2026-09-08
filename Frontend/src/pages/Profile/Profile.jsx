import {
  useEffect,
  useState,
} from "react";

import axios from "axios";
import { MdVerifiedUser } from "react-icons/md";
import { FaLock } from "react-icons/fa6";


const API_URL =
  "http://localhost:3000/api/users";

const SERVER_URL =
  "http://localhost:3000";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      institutionId: "",
      password: "",
    });

  const [picture, setPicture] =
    useState(null);

  // ========================================
  // TOKEN
  // ========================================

  const token =
    localStorage.getItem(
      "findback_token"
    );

  // ========================================
  // LOAD PROFILE
  // ========================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const response =
        await axios.get(
          `${API_URL}/profile/me`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const profile =
        response.data.data;

      setUser(profile);

      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        institutionId:
          profile.institutionId || "",
        password: "",
      });
    } catch (error) {
      console.error(
        "PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    loadProfile();
  }, []);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ========================================
  // IMAGE CHANGE
  // ========================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setPicture(file);
    }
  };

  // ========================================
  // OPEN MODAL
  // ========================================

  const openUpdateModal = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      institutionId:
        user?.institutionId || "",
      password: "",
    });

    setPicture(null);

    setShowModal(true);
  };

  // ========================================
  // UPDATE PROFILE
  // ========================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.password) {
      alert(
        "Please enter your current password"
      );
      return;
    }

    try {
      setUpdating(true);

      const data =
        new FormData();

      data.append(
        "name",
        formData.name
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "institutionId",
        formData.institutionId
      );

      data.append(
        "password",
        formData.password
      );

      if (picture) {
        data.append(
          "picture",
          picture
        );
      }

      const response =
        await axios.patch(
          `${API_URL}/profile/me`,
          data,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const updatedUser =
        response.data.data;

      setUser(updatedUser);

      // ====================================
      // UPDATE LOCAL STORAGE
      // ====================================

      const oldUser =
        localStorage.getItem(
          "findback_user"
        );

      if (oldUser) {
        const parsedUser =
          JSON.parse(oldUser);

        const newUser = {
          ...parsedUser,
          ...updatedUser,
        };

        localStorage.setItem(
          "findback_user",
          JSON.stringify(newUser)
        );
      }

      setFormData({
        name:
          updatedUser.name || "",
        phone:
          updatedUser.phone || "",
        institutionId:
          updatedUser.institutionId ||
          "",
        password: "",
      });

      setPicture(null);

      setShowModal(false);

      alert(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ========================================
  // IMAGE URL
  // ========================================

  const getImageUrl = () => {
    if (!user?.picture) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "User"
      )}&background=2563eb&color=fff&size=256`;
    }

    if (
      user.picture.startsWith("http")
    ) {
      return user.picture;
    }

    return `${SERVER_URL}${user.picture}`;
  };

  // ========================================
  // STATUS COLOR
  // ========================================

  const getStatusStyle = () => {
    switch (user?.accountStatus) {
      case "ACTIVE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "BLOCKED":
        return "bg-red-50 text-red-700 border-red-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

          <p className="text-sm font-medium text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            !
          </div>

          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Profile Error
          </h2>

          <p className="text-sm text-red-500">
            {error}
          </p>

          <button
            onClick={loadProfile}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE
  // ========================================

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 md:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-blue-600">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information
            and account details.
          </p>
        </div>

        {/* =====================================
            PROFILE HERO
        ===================================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

          {/* COVER */}

          <div className="relative h-34 bg-blue-600 md:h-34">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]"></div>

            <div className="absolute bottom-4 right-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
              FindBack Account
            </div>

          </div>

          {/* PROFILE HEADER */}

          <div className="px-5 pb-6 md:px-8">

            <div className="-mt-16 flex flex-col gap-5 md:-mt-20 md:flex-row md:items-end md:justify-between">

              {/* IMAGE + NAME */}

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">

                <div className="relative mt-5">

                  <img
                    src={getImageUrl()}
                    alt={user?.name}
                    className="h-32 w-32 rounded-full border-4 border-white bg-gray-100 object-cover shadow-lg md:h-36 md:w-36"
                  />

                  {/* ONLINE DOT */}

                  {user?.accountStatus ===
                    "ACTIVE" && (
                    <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white bg-emerald-500"></span>
                  )}

                </div>

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.name}
                    </h2>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {user?.userType}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {user?.email}
                  </p>

                </div>

              </div>

              {/* UPDATE BUTTON */}

              <button
                onClick={openUpdateModal}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <span className="text-base">
                  ✎
                </span>

                Edit Profile
              </button>

            </div>

          </div>

          {/* =====================================
              INFORMATION
          ===================================== */}

          <div className="border-t border-gray-100 px-5 py-7 md:px-8">

            <div className="mb-6">

              <h3 className="text-lg font-bold text-gray-900">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Your basic account information.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-2">

              {/* NAME */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Full Name
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.name || "N/A"}
                </p>

              </div>

              {/* EMAIL */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email Address
                </p>

                <p className="break-all font-semibold text-gray-800">
                  {user?.email || "N/A"}
                </p>

              </div>

              {/* PHONE */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Phone Number
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.phone || "N/A"}
                </p>

              </div>

              {/* INSTITUTION */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Institution ID
                </p>

                <p className="font-semibold text-gray-800">
                  {user?.institutionId ||
                    "N/A"}
                </p>

              </div>

              {/* ACCOUNT STATUS */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Account Status
                </p>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle()}`}
                >
                  {user?.accountStatus ||
                    "UNKNOWN"}
                </span>

              </div>

              {/* EMAIL VERIFIED */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Email Verification
                </p>

                <div className="flex items-center gap-2">

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xl ${
                      user?.isEmailVerified
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {user?.isEmailVerified
                      ? <MdVerifiedUser />
                      : <MdVerifiedUser />}
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {user?.isEmailVerified
                      ? "Verified"
                      : "Not Verified"}
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          UPDATE MODAL
      ========================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Edit Profile
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Update your account information
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xl text-gray-500 transition hover:bg-gray-200 hover:text-gray-800"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleUpdate}
              className="space-y-5 p-6"
            >

              {/* PROFILE IMAGE */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">

                <p className="mb-4 text-sm font-semibold text-gray-800">
                  Profile Picture
                </p>

                <div className="flex items-center gap-4">

                  <img
                    src={
                      picture
                        ? URL.createObjectURL(
                            picture
                          )
                        : getImageUrl()
                    }
                    alt="Preview"
                    className="h-20 w-20 rounded-full border-4 border-white object-cover shadow"
                  />

                  <div>

                    <label className="inline-flex cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                      Choose Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={
                          handleImageChange
                        }
                        className="hidden"
                      />
                    </label>

                    <p className="mt-2 text-xs text-gray-400">
                      JPG, PNG or WEBP • Max 5MB
                    </p>

                  </div>

                </div>

              </div>

              {/* NAME */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* INSTITUTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Institution ID
                </label>

                <input
                  type="text"
                  name="institutionId"
                  value={
                    formData.institutionId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />

              </div>

              {/* PASSWORD */}

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

                <div className="mb-3 flex items-start gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm text-amber-700">
                    <FaLock />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-amber-900">
                      Password Verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Enter your current password
                      to confirm these changes.
                    </p>

                  </div>

                </div>

                <input
                  type="password"
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter current password"
                  required
                  className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Profile;