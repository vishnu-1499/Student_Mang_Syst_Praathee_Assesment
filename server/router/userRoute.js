const express = require("express");
const userController = require("../controller/userController");
const { verifyToken, adminOnly } = require("../config/auth");
const upload = require("../config/multer");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

router.post("/create-studentData", verifyToken, adminOnly, upload.single("image") ,userController.createStudentData);
router.post("/update-studentData/:studentId", verifyToken, adminOnly, upload.single("image") ,userController.updateStudentData);
router.post("/delete-studentData/:studentId", verifyToken, adminOnly ,userController.deleteStudentData);
router.get("/get-studentData", verifyToken, userController.getStudentData)

router.post("/upload-studentData", verifyToken, adminOnly, upload.single("file") ,userController.uploadExcelFile);

module.exports = router;