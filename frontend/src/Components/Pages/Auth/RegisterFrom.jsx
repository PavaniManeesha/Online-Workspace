import React, { Fragment, useState } from "react";
import { Facebook, Linkedin, Twitter } from "react-feather";
import { Form, FormGroup, Input, Label, Row, Col, Button } from "reactstrap";
import { Btn, H4, P, H6, Image } from "../../../AbstractElements";
import { Link } from "react-router-dom";
import logoWhite from "../../../assets/images/logo/logo.png";
import logoDark from "../../../assets/images/logo/logo_dark.png";
import axios from "axios";
import { socket_api } from "../../../Constant";
import { toast } from "react-toastify";
toast.configure();
const RegisterFrom = ({ logoClassMain }) => {
  const [fname, setFname] = useState();
  const [lname, setLname] = useState();
  const [dob, setDob] = useState();
  const [tp, setTp] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [category, setCategory] = useState(0);
  const [togglePassword, setTogglePassword] = useState(false);
  const register = () => {
    let model = {
      fName: fname,
      lName: lname,
      dob: dob,
      tp: tp,
      email: email,
      password: password,
      category: category,
    };
    axios
      .post(socket_api + "api/user/register", model)
      .then((response) => {
        if (response.data.code == 0) {
          toast.error(response.data.msg);
        } else {
          toast.success(response.data.msg);
        }
      })
      .catch((err) => {});
  };

  return (
    <Fragment>
      <div className="login-card">
        <div>
          <div>
            <Link
              className={`logo ${logoClassMain ? logoClassMain : ""}`}
              to={process.env.PUBLIC_URL}
            >
              <Image
                attrImage={{
                  className: "img-fluid for-light",
                  src: logoWhite,
                  alt: "looginpage",
                }}
              />
              <Image
                attrImage={{
                  className: "img-fluid for-dark",
                  src: logoDark,
                  alt: "looginpage",
                }}
              />
            </Link>
          </div>
          <div className="login-main">
            <Form className="theme-form login-form">
              <H4>Create your account</H4>
              <P>Enter your personal details to create account</P>
              <FormGroup>
                <Label className="col-form-label m-0 pt-0">Your Name</Label>
                <Row className="g-2">
                  <Col xs="6">
                    <Input
                      onChange={(e) => {
                        setFname(e.target.value);
                      }}
                      className="form-control"
                      type="text"
                      required=""
                      placeholder="Fist Name"
                    />
                  </Col>
                  <Col xs="6">
                    <Input
                      onChange={(e) => {
                        setLname(e.target.value);
                      }}
                      className="form-control"
                      type="email"
                      required=""
                      placeholder="Last Name"
                    />
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup>
                <Label className="col-form-label m-0 pt-0">Email Address</Label>
                <Input
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className="form-control"
                  type="email"
                  required="true"
                  placeholder="Test@gmail.com"
                />
              </FormGroup>
              <FormGroup>
                <Label className="col-form-label m-0 pt-0">Date of Birth</Label>
                <Input
                  onChange={(e) => {
                    setDob(e.target.value);
                  }}
                  className="form-control"
                  type="date"
                  required=""
                />
              </FormGroup>
              <FormGroup>
                <Label className="col-form-label m-0 pt-0">Telephone</Label>
                <Input
                  onChange={(e) => {
                    setTp(e.target.value);
                  }}
                  className="form-control"
                  type="text"
                  required=""
                  placeholder="+9477123456"
                />
              </FormGroup>
              <FormGroup className="position-relative">
                <Label className="col-form-label m-0 pt-0">Password</Label>
                <div className="position-relative">
                  <Input
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    className="form-control"
                    type={togglePassword ? "text" : "password"}
                    name="login[password]"
                    required
                    placeholder="*********"
                  />
                  <div
                    className="show-hide"
                    onClick={() => setTogglePassword(!togglePassword)}
                  >
                    <span className={togglePassword ? "" : "show"}></span>
                  </div>
                </div>
              </FormGroup>
              <FormGroup className="m-0">
                <div className="checkbox">
                  <Input id="checkbox1" type="checkbox" />
                  <Label className="text-muted" for="checkbox1">
                    Agree with <span>Privacy Policy</span>
                  </Label>
                </div>
              </FormGroup>
              <FormGroup>
                <Button
                  color="primary"
                  className="d-block w-100 "
                  onClick={() => register()}
                >
                  Create Account
                </Button>
              </FormGroup>
              {/* <div className='login-social-title'>
                <H6 attrH6={{ className: 'text-muted or mt-4' }}>Or Sign up with</H6>
              </div>
              <div className='social my-4 '>
                <div className='btn-showcase'>
                  <a className='btn btn-light' href='https://www.linkedin.com/login' rel='noreferrer' target='_blank'>
                    <Linkedin className='txt-linkedin' /> LinkedIn
                  </a>
                  <a className='btn btn-light' href='https://twitter.com/login?lang=en' rel='noreferrer' target='_blank'>
                    <Twitter className='txt-twitter' />
                    twitter
                  </a>
                  <a className='btn btn-light' href='https://www.facebook.com/' rel='noreferrer' target='_blank'>
                    <Facebook className='txt-fb' />
                    facebook
                  </a>
                </div>
              </div> */}
              <P attrPara={{ className: "mb-0 text-start" }}>
                Already have an account?
                <Link className="ms-2" to={`${process.env.PUBLIC_URL}/login`}>
                  Sign in
                </Link>
              </P>
            </Form>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default RegisterFrom;
