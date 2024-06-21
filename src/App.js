import { Route, Routes} from "react-router-dom";
import SimpleMap from "./Map";

        


function App() {
  return (
    <div className="App">
    <Routes>
    <Route path="/map" element={<SimpleMap/>}></Route>
    </Routes>
    </div>

  );
}

export default App;
