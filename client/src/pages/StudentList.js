import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { Api } from "../config/Api";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function StudentList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { type } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add-User");
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleOpen = (title) => {
    setModalTitle(title);
    setShowModal(true);
  };

  const getStudentData = async (page = 1, limit = 10) => {
    try {
      const resp = await Api({
        method: "GET",
        url: `/get-studentData?page=${page}&limit=${limit}&search=${search}`,
      });

      if (resp.status) {
        setStudentList(resp.student);
        setTotalRecords(resp.totalRecords);
        setCurrentPage(resp.currentPage);
      } else {
        setStudentList([]);
        setTotalRecords(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStudentData(currentPage, rowsPerPage);
  }, [search, currentPage, rowsPerPage]);

  const columns = [
    {
      name: "Si.No",
      selector: (row, index) => index + 1,
      width: "100px",
      center: true,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "180px",
    },
    {
      name: "Class Name",
      selector: (row) => row.class,
      sortable: true,
      width: "180px",
    },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
      width: "180px",
    },
    {
      name: "Profile Image",
      cell: (row) => (
        <img
          src={`http://localhost:5000/${row.image}`}
          alt="profile"
          width={70}
          height={70}
          style={{ borderRadius: "40%" }}
        />
      ),
      sortable: false,
      width: "180px",
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-outline-warning btn-sm me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleDelete(row)}
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "200px",
      center: true,
    },
  ];

  const handleEdit = async (data) => {
    setSelectedStudent(data);
    setModalTitle("Update-Student");
    setShowModal(true);
  };

  const handleDelete = async (data) => {
    try {
      const resp = await Api({
        method: "POST",
        url: `/delete-studentData/${data.studentId}`,
      });
      if (resp.status) {
        toast.success(resp.message);
        getStudentData();
      } else {
        toast.warn(resp.message);
      }
    } catch (error) {
      toast("Internal Error");
    }
  };

  const uploadExcel = async (e) => {
    try {
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const resp = await Api({
        method: "POST",
        url: "/upload-studentData",
        data: formData,
        header: "image",
      });
      if (resp.status == true) {
        toast.success(resp.message);
        setShowModal(false);
        getStudentData();
      } else {
        toast.warn(resp.message);
      }
    } catch (error) {
      toast("Internal Error");
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      class: "",
      gender: "",
      image: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Enter the Student Name.."),
      class: Yup.string().required("Enter the Student Class Name.."),
      gender: Yup.string().required("Select the Gender."),
      image: Yup.string().required("Image is Required.."),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("class", values.class);
        formData.append("gender", values.gender);
        formData.append("image", values.image);

        const url = selectedStudent
          ? `/update-studentData/${selectedStudent.studentId}`
          : "/create-studentData";

        const resp = await Api({
          method: "POST",
          url: url,
          data: formData,
          header: "image",
        });

        if (resp.status == true) {
          toast.success(resp.message);
          setShowModal(false);
          getStudentData();
        } else {
          toast.warn(resp.message);
        }
      } catch (error) {
        toast("Internal Error");
      }
    },
  });

  useEffect(() => {
    if (selectedStudent) {
      formik.setValues({
        name: selectedStudent.name || "",
        class: selectedStudent.class || "",
        gender: selectedStudent.gender || "",
        image: selectedStudent.image || null,
      });
    }
  }, [selectedStudent]);

  const handleClose = () => {
    setSelectedStudent(null);
    setShowModal(false);
    formik.resetForm();
  };

  const downloadExcel = async () => {
    if (!studentList.length) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Students");

    sheet.columns = [
      { header: "Si.No", key: "index", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Class Name", key: "class", width: 15 },
      { header: "Gender", key: "gender", width: 10 },
      { header: "Profile Image", key: "image", width: 20 },
    ];

    const rowHeight = 80;
    const columnWidthToPixels = (width) => width * 7;
    const rowHeightToPixels = (height) => height * 1.33;

    for (let i = 0; i < studentList.length; i++) {
      const student = studentList[i];

      const row = sheet.addRow({
        index: i + 1,
        name: student.name,
        class: student.class,
        gender: student.gender,
        image: "",
      });

      row.height = rowHeight;

      if (student.image) {
        const imageUrl = `http://localhost:5000/${student.image}`;
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();

        const ext = student.image.split(".").pop().toLowerCase();

        const imageId = workbook.addImage({
          buffer,
          extension: ext === "png" ? "png" : "jpeg",
        });

        const cellWidth = columnWidthToPixels(sheet.getColumn(5).width);
        const cellHeight = rowHeightToPixels(rowHeight);

        sheet.addImage(imageId, {
          tl: { col: 4, row: i + 1 },
          ext: {
            width: cellWidth,
            height: cellHeight,
          },
          editAs: "oneCell",
        });
      }
    }

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), "StudentList.xlsx");
  };

  return (
    <div className="container my-5">
      <ToastContainer />
      <div className="card shadow-lg">
        <div
          className="card-header text-white d-flex justify-content-between align-items-center flex-wrap gap-2"
          style={{ backgroundColor: "mediumseagreen" }}
        >
          <h5 className="mb-0">Student List</h5>
          <div className="d-flex gap-2 align-items-center">
            {type === "admin" && (
              <>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => handleOpen("Add-Student")}
                >
                  Add User
                </button>

                <label className="btn btn-light btn-sm mb-0">
                  Upload Excel
                  <input
                    type="file"
                    name="excel"
                    accept=".xlsx, .xls"
                    hidden
                    onChange={uploadExcel}
                  />
                </label>
              </>
            )}

            <button className="btn btn-light btn-sm" onClick={downloadExcel}>
              Download Excel
            </button>

            <button
              className="btn btn-light btn-sm"
              onClick={() => {
                localStorage.clear();
                navigate("/");
              }}
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="card-body">
          <input
            type="text"
            className="form-control mb-3 w-100"
            placeholder="Search by Student Name or ClassName"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="row justify-content-center">
            <div className="col-lg-10">
              <DataTable
                columns={columns}
                data={studentList}
                highlightOnHover
                dense
                pagination
                paginationServer
                paginationTotalRows={totalRecords}
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={[5, 10, 15]}
                onChangePage={(page) => setCurrentPage(page)}
                onChangeRowsPerPage={(newPerPage, page) => {
                  setRowsPerPage(newPerPage);
                  setCurrentPage(page);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {type == "admin" && showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div
                className="modal-header"
                style={{ backgroundColor: "#e8f5e9" }}
              >
                <h5 className="modal-title">{modalTitle}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleClose}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={formik.handleSubmit}>
                  {/* Student Name */}
                  <div className="mb-3">
                    <label className="form-label">Student Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`form-control ${
                        formik.touched.name && formik.errors.name
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Student name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="invalid-feedback">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>

                  {/* ClassName */}
                  <div className="mb-3">
                    <label className="form-label">Student ClassName</label>
                    <input
                      type="text"
                      name="class"
                      id="class"
                      className={`form-control ${
                        formik.touched.class && formik.errors.class
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter Student ClassName"
                      value={formik.values.class}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.class && formik.errors.class && (
                      <div className="invalid-feedback">
                        {formik.errors.class}
                      </div>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className={`form-control ${
                        formik.touched.gender && formik.errors.gender
                          ? "is-invalid"
                          : ""
                      }`}
                      value={formik.values.gender}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    {formik.touched.gender && formik.errors.gender && (
                      <div className="invalid-feedback">
                        {formik.errors.gender}
                      </div>
                    )}
                  </div>

                  {/* Profile Image */}
                  <div className="mb-3">
                    <label className="form-label">Profile Image</label>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className={`form-control ${
                        formik.touched.image && formik.errors.image
                          ? "is-invalid"
                          : ""
                      }`}
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        if (file) {
                          formik.setFieldValue("image", file);
                        }
                      }}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.image && formik.errors.image && (
                      <div className="invalid-feedback">
                        {formik.errors.image}
                      </div>
                    )}

                    {formik.values.image && (
                      <div className="mt-2">
                        <img
                          src={
                            typeof formik.values.image === "string"
                              ? `http://localhost:5000/${formik.values.image}`
                              : URL.createObjectURL(formik.values.image)
                          }
                          alt="preview"
                          width={100}
                          height={100}
                          style={{ borderRadius: "10%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => formik.setFieldValue("image", null)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn btn-success">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentList;
