
import './App.css';
import {Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Settings from './components/core/Dashboard/Settings';
// import Catalog from './pages/Catalog';
import Contact from "./pages/Contact";
import MyProfile from "./components/core/Dashboard/MyProfile";
import PrivateRoute from "./components/core/Auth/PrivateRoute";


function App(){
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
    <Navbar/>

      <Routes>
        <Route path="/" element ={<Home/>}/>
        <Route path='/about' element={<About />} />
        {/* <Route path='catalog/:catalogName' element={<Catalog/>} /> */}
      <Route path="/contact" element={<Contact />} />
      {/* <Route path='courses/:courseId' element={<CourseDetails />} /> */}
    

      <Route
        path="signup"
        element={
          <OpenRoute>
            <Signup />
          </OpenRoute>
        }
      />

<Route
        path="login"
        element={
          <OpenRoute>
            <Login />
          </OpenRoute>
        }
      />

<Route
        path="forgot-password"
        element={
          <OpenRoute>
            <ForgotPassword />
          </OpenRoute>
        }
      />  


<Route
        path="update-password/:id"
        element={
          <OpenRoute>
            <UpdatePassword />
          </OpenRoute>
        }
      /> 

       <Route
        path="verify-email"
        element={
          <OpenRoute>
            <VerifyEmail />
          </OpenRoute>
        }
      /> 
      <Route
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
             <Route path="dashboard/my-profile" element={<MyProfile />} />
        <Route path="dashboard/Settings" element={<Settings />} /> 


        </Route>
       

        </Routes>

    </div>
  );
}
  


export default App
