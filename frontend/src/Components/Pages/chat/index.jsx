import React, { Fragment, useEffect, useState } from "react";
import { H6, P } from "../../../AbstractElements";
import { ContactHistory } from "../../../Constant";
import { DoubleRightOutlined } from "@ant-design/icons/";
import socket from "../../Socket";
import { Col, Container, Row } from "reactstrap";
import { Button } from "antd";

const ChatPanel = () => {
  const closehistory = () => {
    document.querySelector(".history").classList.remove("show");
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const sendMessage = () => {
    if (message) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };
  useEffect(() => {
    // if (username && room) {
    //   setUsername(username);
    //   setRoom(room);
    //   joinRoom(username, room);
    // }
    socket.on("message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });
    return () => {
      socket.off("message");
    };
  }, []);
  return (
    <Fragment>
      <div id="right-history" className="history">
        <div className="modal-header p-l-20 p-r-20">
          <H6 attrH6={{ className: "modal-title w-100" }}>
            Group Chat
            <span className="pull-right">
              <a
                className="closehistory"
                href="#javaScript"
                onClick={closehistory}
              >
                <i className="icofont icofont-close"></i>
              </a>
            </span>
          </H6>
        </div>
        {/*   <div className="history-details">
          <div className="text-center">
            <i className="icofont icofont-ui-edit"></i>
            <P>{"Contact has not been modified yet."}</P>
          </div>
          <div className="media">
            <i className="icofont icofont-star me-3"></i>
            <div className="media-body mt-0">
              <H6 attrH6={{ className: "mt-0" }}>{"Contact Created"}</H6>
              <P attrPara={{ className: "mb-0" }}>
                {"Contact is created via mail"}
              </P>
              <span className="f-12">{"Sep 10, 2022 4:00"}</span>
            </div>
          </div>
        </div> */}
        {/* {!joined ? (
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button onClick={handleJoin}>Join Room</button>
          </div>
        ) : ( */}
        <div>
          <div style={{ height: "400px", overflowY: "scroll" }}>
            <br></br>
            {messages &&
              messages.map((msg, index) => (
                <div key={index} style={{ paddingLeft: "3px" }}>
                  <strong>{msg.user}</strong>: {msg.text}
                </div>
              ))}
          </div>
          <br></br>
          <Container>
            <Row>
              <Col md={9}>
                <input
                  type="text"
                  placeholder="Message"
                  className="form-control"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Col>
              <Col>
                <Button
                  onClick={() => {
                    sendMessage();
                  }}
                >
                  <DoubleRightOutlined />
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
        {/* )} */}
      </div>
    </Fragment>
  );
};

export default ChatPanel;
