import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./web/LandingPage";
import Admin from "./admin";

import Home from './web/Home';
import Article
 from "./web/Article";
export default function AppRoot() {

  return (
    <main className="flex-shrink-0">
        <Routes>
            
            <Route path="/" element={<Navigate replace to='/web/home'/>}></Route>
            <Route path='web/*' element={<LandingPage/>}/>
            <Route path="admin" element={<Admin/>}/>
        </Routes>
    </main>
  );
}
