import { Route, Routes} from "react-router-dom";
import Login from "./Login";
import Courierdata from "./Courierdata";
import Map from "./Map";
import { ToastContainer } from "react-toastify";



function App() {
  return (
    <div className="App">
    <ToastContainer></ToastContainer>
    <Routes>
    <Route path="/login" element={<Login/>}></Route>
    <Route path="/courierdata" element={<Courierdata/>}></Route>
    <Route path="/assignjob" element={<ParticularJob/>}></Route>
    <Route path="/map" element={<Map/>}></Route>
    </Routes>  
    </div>

  );
}

export default App;
