import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import { Api } from "../config/Api";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/Auth";

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(/[A-Z]/, "Must include at least one uppercase letter")
      .matches(/[a-z]/, "Must include at least one lowercase letter")
      .matches(/[0-9]/, "Must include at least one number")
      .matches(/[^A-Za-z0-9]/, "Must include at least one special character")
      .required("Password is required"),
    confirmPassword: !isLogin
      ? Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Confirm Password is required")
      : null,
    role: !isLogin ? Yup.string().required("Select the Role") : null,
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: ""
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isLogin) {
          const res = await Api({
            method: "POST",
            url: "/login",
            data: {
              email: values.email,
              password: values.password,
            },
          });
          
          if (res.status == true) {
            dispatch(setAuth({token: res.token, type: res.type}));
            toast(res.message);
            {
              res.type == "admin" ? navigate("/admin") : navigate("/student");
            }
          } else {
            toast(res.message);
          }
        } else {
          const res = await Api({method: "POST", url: "/register", data: {
            email: values.email,
            password: values.password,
            role: values.role
          }});

            toast(res.message);
            if (res.status) setIsLogin(true);
        }
      } catch (err) {
        console.error(err);
        toast("Something went wrong.");
      }
    },
  });

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <ToastContainer />
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold">{isLogin ? "Login" : "Register"}</h2>
        </div>

        <form onSubmit={formik.handleSubmit}>
          <div className="form-group mb-3">
            <label>Email address</label>
            <input
              name="email"
              type="email"
              className={`form-control ${
                formik.touched.email && formik.errors.email ? "is-invalid" : ""
              }`}
              placeholder="example@gmail.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>

          <div className="form-group mb-3">
            <label>Password</label>
            <input
              name="password"
              type="password"
              className={`form-control ${
                formik.touched.password && formik.errors.password
                  ? "is-invalid"
                  : ""
              }`}
              placeholder="••••••••"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          {!isLogin && (
            <>
              <div className="form-group mb-3">
                <label>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className={`form-control ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="••••••••"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {formik.errors.confirmPassword}
                    </div>
                  )}
              </div>

              <div className="form-group mb-3">
                <label>Role</label>
                <select
                  name="role"
                  className={`form-control ${
                    formik.touched.role && formik.errors.role
                      ? "is-invalid"
                      : ""
                  }`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.role}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                </select>
                {formik.touched.role && formik.errors.role && (
                  <div className="invalid-feedback">{formik.errors.role}</div>
                )}
              </div>
            </>
          )}

          <div className="d-grid">
            <button
              className={`btn ${isLogin ? "btn-success" : "btn-primary"}`}
              type="submit"
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </div>
        </form>

        <p className="text-center mt-3 mb-0 small">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button className="btn btn-link btn-sm p-0" onClick={toggleForm}>
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button className="btn btn-link btn-sm p-0" onClick={toggleForm}>
                Login here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default SignIn;
