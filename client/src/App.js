import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./pages/SignIn";
import StudentList from "./pages/StudentList";
import { useSelector } from "react-redux";

function App() {
  const {type} = useSelector((state) => state.auth);
  return (
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path={type == "admin" ? "/admin" : "/student"} element={<StudentList />} />
        </Routes>
      </Router>
  );
}

export default App;
