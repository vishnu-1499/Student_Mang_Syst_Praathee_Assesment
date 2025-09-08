PROJECT DESCRIPTION
    This project is a Student Management System built using Node.js, React.js, and MySQL.
    It supports full CRUD operations, image upload with Multer, search functionality, and pagination.
    There are two types of logins:
    Admin Login => Can add, update, delete student records, and upload student data via Excel.
    Teacher Login => Can view student records and download the student list as an Excel file.

Setup instructions
  Backend
    Models => indexModel.js, user.js, student.js, auditLogs.js
    Controllers => userController.js
    Router => router.js
    Config => db.js, auth.js, multer.js
    Environment => .env file containing Port, Database, and JWT key details
    Entry File => index.js (server file)
      .env
          PORT=5000
          DB_HOST=localhost
          DB_USER=root
          DB_PASSWORD=yourpassword
          DB_NAME=studentdb
          JWT_SECRET=your_jwt_secret
  Frontend
    Config => api.js (Axios setup)
    Pages => signin.js (handles both Registration and Login), studentList.js (handles CRUD, file upload, and Excel download)
    Store => store.js, auth.js (Redux setup for token handling, with token stored in localStorage)
      
Login credentials (can be hardcoded)
    During registration, the user can select a role: either Admin or Teacher.
    For testing, credentials can be hardcoded if needed.
    Admin => Full CRUD + Excel Upload
    Teacher => Read-only + Excel Download
  
List of implemented features
    Authentication
      JWT => based authentication with middleware security
      Role => based login (Admin / Teacher)
      Passwords encrypted with bcrypt
    Backend
      Node.js + Express.js server
      Sequelize ORM for MySQL database management
      Multer for profile image upload
      XLSX for Excel file uploads
      Audit Logs for tracking actions
    Frontend
      React.js with Redux for state management
      Formik + Yup for form handling & validation
      Axios for API calls (with JWT token middleware)
      ExcelJS for downloading student data in Excel format
      Pagination & search implemented in student list view
