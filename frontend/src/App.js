import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BorisGame from "@/components/BorisGame.jsx";
import LandingPage from "@/components/LandingPage.jsx";
import RequireAuth from "@/components/RequireAuth.jsx";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/play"
            element={
              <RequireAuth>
                <BorisGame />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
