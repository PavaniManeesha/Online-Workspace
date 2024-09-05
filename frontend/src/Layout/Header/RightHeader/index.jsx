import React, { Fragment, useState } from "react";

import Language from "./Language";
import Searchbar from "./Searchbar";
import Notificationbar from "./Notificationbar";
import MoonLight from "./MoonLight";
import CartHeader from "./CartHeader";
import BookmarkHeader from "./BookmarkHeader";
import UserHeader from "./UserHeader";
import { UL } from "../../../AbstractElements";
import { Col } from "reactstrap";
import ChatPanel from "../../../Components/Pages/chat";
import JitsiMeetingComponent from "../../../Components/Pages/Meet";

const RightHeader = () => {
  const openChat = () => {
    document.querySelector(".history").classList.add("show");
  };
  const [meetingStarted, setMeetingStarted] = useState(false);
  const startMeeting = () => {
    setMeetingStarted(true);
  };
  return (
    <Fragment>
      <JitsiMeetingComponent
        meetingStarted={meetingStarted}
        setMeetingStarted={setMeetingStarted}
      />
      <Col
        xxl="7"
        xl="6"
        md="7"
        className="nav-right pull-right right-header col-8 p-0 ms-auto"
      >
        <ChatPanel />
        {/* <Col md="8"> */}
        <UL attrUL={{ className: "simple-list nav-menus flex-row" }}>
          {/* <Language />*/}
          <Searchbar onclick={openChat} />
          {/* <BookmarkHeader /> */}
          <MoonLight onclick={openChat} />
          <CartHeader onclick={startMeeting} />
          {/* <Notificationbar /> */}
          <UserHeader />
        </UL>
        {/* </Col> */}
      </Col>
    </Fragment>
  );
};

export default RightHeader;
