const bcrypt = require("bcrypt");
const { User, Student, AuditLog } = require("../model/indexModel");
const { where, Op } = require("sequelize");
const { signedToken } = require("../config/auth");
const XLSX = require("xlsx");
const path = require("path");

class Users {
  register = async (req, res) => {
    const data = req.body;
    try {
      const existingUser = await User.findOne({
        where: { email: data.email },
      });
      if (existingUser)
        return res.send({ status: false, message: "Email Aldready Exists.." });

      const encPass = await bcrypt.hash(data.password, 10);
      await User.create({ ...data, password: encPass })
        .then((resp) =>
          res.send({ status: true, message: "Registration Successfull", resp })
        )
        .catch((error) =>
          res.send({ status: false, message: "Registration Failed", error })
        );
    } catch (error) {
      console.log("error----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  login = async (req, res) => {
    const { email, password } = req.body;
    try {
      const users = await User.findOne({ where: { email } });
      const decPass = await bcrypt.compare(password, users.password);

      if (!decPass)
        return res.send({ status: false, message: "Invalid Password..." });

      await signedToken({ email: users.email, role: users.role })
        .then((resp) =>
          res.send({
            status: true,
            message: "Login Successfull",
            type: users.role,
            token: resp,
          })
        )
        .catch((error) =>
          res.send({ status: false, message: "Login Failed", error })
        );
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  createStudentData = async (req, res) => {
    const userId = res.locals.user;
    const data = req.body;
    const file = req.file.path;
    try {
      if (!userId)
        return res.send({ status: false, message: "Invalid Credentials..." });

      const newStudent = await Student.create({ ...data, image: file });

      const studentLogs = await AuditLog.create({
        studentId: newStudent.studentId,
        action: "create",
        dataChanges: { newData: newStudent },
      });
      return res.send({
        status: true,
        message: "New Student Data Added..",
        student: newStudent,
        logs: studentLogs,
      });
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  updateStudentData = async (req, res) => {
    const userId = res.locals.user;
    const { studentId } = req.params;
    const data = req.body;
    const file = req.file.path;
    try {
      if (!userId)
        return res.send({ status: false, message: "Invalid Credentials..." });
      const prevStudent = await Student.findOne({ where: { studentId } });
      if (!prevStudent)
        return res.send({
          status: false,
          message: "Student Data not found...",
        });
      const oldData = prevStudent.toJSON();
      const updatePayload = { ...data };
      if (file) {
        updatePayload.image = file;
      }

      const editStudent = await prevStudent.update(updatePayload);
      const studentLogs = await AuditLog.create({
        studentId,
        action: "update",
        dataChanges: { before: oldData, after: editStudent },
      });

      return res.send({
        status: true,
        message: "Student Data Updated",
        student: editStudent,
        logs: studentLogs,
      });
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  deleteStudentData = async (req, res) => {
    const userId = res.locals.user;
    const { studentId } = req.params;
    try {
      if (!userId)
        return res.send({ status: false, message: "Invalid Credentials..." });
      const prevStudent = await Student.findOne({ where: { studentId } });
      if (!prevStudent)
        return res.send({
          status: false,
          message: "Student Data not found...",
        });
      const oldData = prevStudent.toJSON();

      await prevStudent.destroy();

      const studentLogs = await AuditLog.create({
        studentId,
        action: "delete",
        dataChanges: { deleted: oldData },
      });

      return res.json({
        status: true,
        message: "Student Deleted Successfully",
        auditLogs: studentLogs,
      });
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  getStudentData = async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      let searchItem = {};
      if (search) {
        searchItem = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { class: { [Op.like]: `%${search}%` } },
          ],
        };
      }

      const { count, rows } = await Student.findAndCountAll({
        where: searchItem,
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "Desc"]],
      });

      res.send({
        status: true,
        message: "Student Data...",
        totalRecords: count,
        currentPage: parseInt(page),
        totalPage: Math.ceil(count / limit),
        student: rows,
      });
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };

  uploadExcelFile = async (req, res) => {
    const userId = res.locals.user;
    const file = req.file?.path;
    try {
      if (!userId) {
        return res.send({ status: false, message: "Invalid Credentials..." });
      }

      if (!file) {
        return res.send({ status: false, message: "No file uploaded" });
      }

      const book = XLSX.readFile(file);

      let sheet = book.SheetNames.find((s) => {
        const data = XLSX.utils.sheet_to_json(book.Sheets[s], { header: 1 });
        return data.length > 1;
      });

      if (!sheet) {
        return res.send({
          status: false,
          message: "No data found in Excel file",
        });
      }

      const excelData = XLSX.utils.sheet_to_json(book.Sheets[sheet], {
        defval: "",
      });

      console.log("Parsed Excel Data:", excelData);

      let imported = [];
      let skipped = [];

      const normalizeRow = (row) => {
        return {
          name: row["name"] || row["Name"] || row["NAME"] || "",
          className:
            row["className"] ||
            row["ClassName"] ||
            row["Class"] ||
            row["CLASS"] ||
            "",
          gender: row["gender"] || row["Gender"] || row["GENDER"] || "",
          image: row["image"] || row["Image"] || row["IMAGE"] || "",
        };
      };

      for (const row of excelData) {
        try {
          const { name, className, gender, image } = normalizeRow(row);

          if (!name || !className || !gender) {
            skipped.push({ row, message: "Missing required fields" });
            continue;
          }

          const exists = await Student.findOne({ where: { name } });
          if (exists) {
            skipped.push({ row, reason: "Duplicate Name" });
            continue;
          }

          const imagePath = image ? `uploads/${image}` : null;

          console.log("Creating Student:", {
            name,
            class: className,
            gender,
            image: imagePath,
          });

          const newStudent = await Student.create({
            name,
            class: className,
            gender,
            image: imagePath,
          });

          await AuditLog.create({
            studentId: newStudent.studentId,
            action: "create",
            dataChanges: { newData: newStudent },
          });

          imported.push(newStudent);
        } catch (err) {
          skipped.push({
            row,
            message: "Unexpected error",
            error: err.message,
          });
        }
      }

      return res.send({
        status: true,
        message: "Excel import completed",
        data: {
          totalRows: excelData.length,
          importedCount: imported.length,
          skippedCount: skipped.length,
        },
        imported,
        skipped,
      });
    } catch (error) {
      console.log("error-----", error);
      res.send({ status: false, message: "Internal Error", error });
    }
  };
}

module.exports = new Users();
