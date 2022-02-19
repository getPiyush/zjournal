import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <React.Fragment>
      <div className="container">
        <h1 className="mt-5">Highlighted Topic Header</h1>
        <p className="lead">
          When you eat carbohydrates (foods with starch or sugar: click here for
          a tutorial about carbohydrates) your digestive system will convert
          what you’ve eaten into
          <img
            className="img-fluid"
            alt="Responsive image"
            src="https://learn-biology.com/wp-content/uploads/2018/12/04_1920px-Insulin_glucose_metabolism_w-numbers-and-labels-1024x572.png"
          />
          Genetic regulatory networks are dynamic systems which describe the
          interactions among gene products (mRNAs and proteins)
          <br />
          <Link to="/article">...</Link>
        </p>
      </div>
      <div className="container">
        <p>
          <h4>Delayed Genetic Regulatory Networks</h4>
          Recently nonlinear differential equations have been proposed to model
          genetic regulatory networks. Based on this model, stability of genetic
          regulatory networks has been intensively studied, which is believed
          useful in designing and controlling genetic regulatory networks
          <br /> <Link to="/article">...</Link>
        </p>
        <p>
          <h4>Delayed Genetic Regulatory Networks</h4>
          Recently nonlinear differential equations have been proposed to model
          genetic regulatory networks. Based on this model, stability of genetic
          regulatory networks has been intensively studied, which is believed
          useful in designing and controlling genetic regulatory networks
          <br /> <Link to="/article">...</Link>
        </p>
      </div>

      <div className="container">
        <div className="row">
          <div className="p-3 col  m-1 border">
            <h5>Delayed Genetic Regulatory Networks</h5>
            Recently nonlinear differential equations have been proposed to
            model genetic regulatory networks. Based on this model, stability of
            genetic regulatory networks has been intensively studied, which is
            believed useful in designing and controlling genetic regulatory
            networks
            <br />
            <Link to="/article">...</Link>
          </div>
          <div className="p-3 col  m-1 border">
            <h4>Delayed Genetic Regulatory Networks</h4>
            Recently nonlinear differential equations have been proposed to
            model genetic regulatory networks. Based on this model, stability of
            genetic regulatory networks has been intensively studied, which is
            believed useful in designing and controlling genetic regulatory
            networks
            <br />
            <Link to="/article">...</Link>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
