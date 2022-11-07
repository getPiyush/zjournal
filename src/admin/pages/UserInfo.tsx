import { applicationProperties } from "../../ApplicationConstants";
import { useState } from "react";
import { PageTitle } from "../components/PageTitle";

export default function UserInfo() {
  window.document.title = `Admin Login - ${applicationProperties.title}`;
  const [value, setValue] = useState({
    useridOld: "",
    userid: "",
    passwordOld: "",
    password: "",
    passwordConfirm: "",
  });

  const userIdUpdated = (event: React.ChangeEvent<HTMLInputElement>) => {
    const userId = event.target.value;
    setValue({ ...value, userid: userId, password: value.password });
  };

  const passwordpdated = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;
    setValue({ ...value, userid: value.userid, password: password });
  };

  const changePassword = () => {};
  return (
    <div className="admin-profile container">
      <div className="row">
        <div className="col">
          <PageTitle
            title={`Change Profile for ${applicationProperties.title} - Admin`}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <div className="mb-3">
            <h5>Login Info</h5>
          </div>
          <div className="mb-3">
            <label htmlFor="userIdOld" className="form-label">
              Old User Id
            </label>
            <input
              type="texts"
              className="form-control"
              id="userId"
              placeholder=""
              onChange={userIdUpdated}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="userIdNew" className="form-label">
              New User Id
            </label>
            <input
              type="texts"
              className="form-control"
              id="userIdNew"
              placeholder=""
              onChange={userIdUpdated}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInputOld" className="form-label">
              Old Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInputOld"
              placeholder=""
              onChange={passwordpdated}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInputNew" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInputNew"
              placeholder=""
              onChange={passwordpdated}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInputNewConfirm" className="form-label">
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInputNewConfirm"
              placeholder=""
              onChange={passwordpdated}
            />
          </div>
          <div className="mb-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={changePassword}
            >
              Change Password
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <h5>User Info</h5>
          </div>
        </div>
      </div>
    </div>
  );
}
