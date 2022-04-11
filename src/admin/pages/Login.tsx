import { applicationProperties } from "../../ApplicationConstants";
import { useState } from "react";
import { PageTitle } from "../components/PageTitle";

type LoginProps = {
  onLogin: (userDetailsIn: {userid:string,password:string}) => void;

};

export default function Login({onLogin}:LoginProps) {
  window.document.title = `Admin Login - ${applicationProperties.title}`;
  const [value, setValue] = useState({userid:"",password:""});

  const userIdUpdated = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userId = event.target.value;
    setValue({userid:userId,password:value.password});
  };

  const passwordpdated = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    setValue({userid:value.userid,password:password});
  };

  const login =() =>{
    onLogin(value)
  }
  return (
    <div className="admin-login container">
        <PageTitle title={`Login to ${applicationProperties.title} - Admin`} />
      <div className="row">
        <div className="col">
          <div className="mb-3">
            <label htmlFor="nameInput" className="form-label">
             User Id
            </label>
            <input
              type="texts"
              className="form-control"
              id="nameInput"
              placeholder=""
              onChange={userIdUpdated}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="emailInput" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              placeholder=""
              onChange={passwordpdated}

            />
          </div>
          <div className="mb-3">
            <button type="button" className="btn btn-primary" onClick={login}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
