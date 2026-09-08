import {StrictMode,} from "react";
import {createRoot,} from "react-dom/client";
import {createBrowserRouter,RouterProvider,} from "react-router-dom";
import "./index.css";
import Root from "./Route/Root.jsx";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import VerifySignupOtp from "./pages/auth/VerifySignupOtp.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import VerifyResetOtp from "./pages/auth/VerifyResetOtp.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import Home from "./pages/Home/Home.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import MyPost from "./pages/MyPost/MyPost.jsx";
import SavedPost from "./pages/SavedPost/SavedPost.jsx";
import UserManagement from "./pages/UserManagement/UserManagement.jsx";
import Claim from "./pages/Claim/Claim.jsx";
import MyClaim from "./pages/Claim/MyClaim.jsx";
import ClaimReques from "./pages/Claim/ClaimReques.jsx";
import Refund from "./pages/Refund/Refund.jsx";
import SinglePost from "./pages/SinglePost/SinglePost.jsx";


const router =
  createBrowserRouter([

    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "my-post",
          element: <MyPost />,
        },
        {
          path: "/claim/:postId",
          element: <Claim />,
        },
        {
          path: "/my-claims",
          element: <MyClaim />,
        },
        {
          path: "/claim-request",
          element: <ClaimReques />,
        },
        {
          path: "/saved-posts",
          element: <SavedPost />,
        },
        {
          path: "/post/:postId",
          element: <SinglePost />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "user-management",
          element: <UserManagement />,
        },
        {
          path: "refounded",
          element: <Refund />,
        },
        {
          path: "login",
          element: <Login />,
        },
        {
          path:"verify-signup-otp",
          element: <VerifySignupOtp />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "verify-reset-otp",
          element:  <VerifyResetOtp />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },

      ],
    },

  ]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);