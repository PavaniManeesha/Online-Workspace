import React, { Fragment, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import Taptop from "./TapTop";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ThemeCustomize from "../Layout/ThemeCustomizer";
import Footer from "./Footer";
import CustomizerContext from "../_helper/Customizer";
import AnimationThemeContext from "../_helper/AnimationTheme";
import ConfigDB from "../Config/ThemeConfig";
import socket from "../Components/Socket";
import { socket_api } from "../Constant";
import axios from "axios";

const AppLayout = ({ children, classNames, ...rest }) => {
  const { layout } = useContext(CustomizerContext);
  const { sidebarIconType } = useContext(CustomizerContext);

  const [mousePositions, setMousePositions] = useState({});

  const layout1 = localStorage.getItem("sidebar_layout") || layout;
  const sideBarIcon =
    localStorage.getItem("sidebar_icon_type") || sidebarIconType;
  const location = useLocation();
  const { animation } = useContext(AnimationThemeContext);
  const animationTheme =
    localStorage.getItem("animation") ||
    animation ||
    ConfigDB.data.router_animation;
  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    socket.emit("down", { x, y, email: Username });
  };
  const Username = JSON.parse(localStorage.getItem("userAuth")).email;
  const [minutes, setMinutes] = useState(0);
  const [room, setRoom] = useState();
  const getRoomDetails = async () => {
    try {
      await axios
        .get(socket_api + `api/room/get/${localStorage.getItem("room")}`)
        .then((response) => {
          localStorage.setItem(
            "roomDetails",
            JSON.stringify(response.data.data)
          );
          setRoom(response.data.data);
        });
    } catch (err) {
      console.log(err);
    }
  };

  let onlineTime =
    localStorage.getItem("roomDetails") &&
    JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
      (user) => user.user === JSON.parse(localStorage.getItem("userAuth"))._id
    )[0] &&
    JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
      (user) => user.user === JSON.parse(localStorage.getItem("userAuth"))._id
    )[0].onlineTime;

  useEffect(() => {
    getRoomDetails();
    socket.on("ondown", (data) => {
      setMousePositions((prevPositions) => ({
        ...prevPositions,
        [data.email]: { x: data.x, y: data.y },
      }));
    });

    const interval = setInterval(async () => {
      setMinutes((prevSeconds) => prevSeconds + 1);
      if (minutes % 60 == 0) {
        //onlineTime = onlineTime == null ? 0 : onlineTime + 1;
        await axios
          .put(
            socket_api +
              `api/room/update-online-time/${localStorage.getItem("room")}/${
                JSON.parse(localStorage.getItem("userAuth"))._id
              }`,
            {
              onlineTime:
                Number(
                  localStorage.getItem("roomDetails")
                    ? localStorage.getItem("roomDetails") &&
                      JSON.parse(
                        localStorage.getItem("roomDetails")
                      )[0].users.filter(
                        (user) =>
                          user.user ===
                          JSON.parse(localStorage.getItem("userAuth"))._id
                      )[0] &&
                      JSON.parse(
                        localStorage.getItem("roomDetails")
                      )[0].users.filter(
                        (user) =>
                          user.user._id ===
                          JSON.parse(localStorage.getItem("userAuth"))._id
                      )[0].onlineTime == null
                      ? 1
                      : JSON.parse(
                          localStorage.getItem("roomDetails")
                        )[0].users.filter(
                          (user) =>
                            user.user._id ===
                            JSON.parse(localStorage.getItem("userAuth"))._id
                        )[0].onlineTime
                    : 0
                ) + 1,
            }
          )
          .then((response) => {
            if (response.data.code == 1) {
              getRoomDetails();
            }
          });
      }
    }, 58000);

    // Cleanup the interval when the component is unmounted or before the next effect runs
    return () => clearInterval(interval), socket.off("ondown");
  }, []);

  return (
    <Fragment>
      {/* <div
        onMouseMove={handleMouseMove}
        style={{ position: "relative", width: "100%", height: "100vh" }}
      >
        {Object.keys(mousePositions).map((email) => {
          const pos = mousePositions[email];
          return (
            <div
              key={email}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                backgroundColor: "blue",
                color: "white",
                padding: "2px 5px",
                borderRadius: "3px",
                transform: "translate(-50%, -50%)",
                zIndex: 10000,
              }}
            >
              {email}
            </div>
          );
        })} */}
      {/* <Loader /> */}
      <Taptop />
      <div
        className={`page-wrapper ${layout1}`}
        sidebar-layout={sideBarIcon}
        id="pageWrapper"
      >
        <Header />
        <div className="page-body-wrapper">
          <Sidebar />
          <div className="page-body">
            <TransitionGroup {...rest}>
              <CSSTransition
                key={location.key}
                timeout={100}
                classNames={animationTheme}
                unmountOnExit
              >
                <div>
                  <div>
                    <Outlet />
                  </div>
                </div>
              </CSSTransition>
            </TransitionGroup>
          </div>
          <Footer />
        </div>
      </div>
      <ThemeCustomize />
      <ToastContainer />
      {/* </div> */}
    </Fragment>
  );
};
export default AppLayout;
