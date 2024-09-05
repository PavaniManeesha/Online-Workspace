import axios from "axios";
import {
  socket_api,
  TodayProgressMessage,
  TodayProgressTitle,
} from "../../../../Constant";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { H5 } from "../../../../AbstractElements";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
const Dashboard = () => {
  const [room, setRoom] = useState("");
  const [totalActive, setTotalActive] = useState(0);
  const [totalContribution, setTotalContribution] = useState(0);
  // const workspaceName = JSON.parse(localStorage.getItem("roomDetails"))[0]
  //   .roomName;

  const getRoomDetails = async () => {
    try {
      axios
        .get(socket_api + `api/room/get/${localStorage.getItem("room")}`)
        .then((response) => {
          let online = 0;
          let count = 0;
          console.log(response.data.data);
          response.data.data &&
            response.data.data[0].users &&
            response.data.data[0].users.map((item) => {
              console.log(item);
              online = online + item.onlineTime;
              count = count + item.blockCount;
            });
          console.log(online, count);
          setTotalActive(online);
          setTotalContribution(count);
          setRoom(response.data.data);
        });
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getRoomDetails();
  }, []);
  return (
    <div>
      <br></br>

      <Row>
        {room &&
          room[0].users.map((item) => {
            return (
              <Col>
                <Card>
                  <CardHeader>
                    <H5>
                      {"Workspace Progress  (" +
                        JSON.parse(localStorage.getItem("roomDetails"))[0]
                          .roomName +
                        ")"}
                    </H5>
                    <span>{`${item.user.fName} ${item.user.lName}`}</span>
                  </CardHeader>
                  <br></br>
                  <CardBody>
                    <div>
                      <Row>
                        <Col md={6}>
                          <div style={{ fontWeight: "bolder" }}>
                            Online Contribution
                          </div>
                          <br></br>
                          <div
                          //   style={{ height: "50%", width: "50%" }}
                          >
                            <CircularProgressbar
                              value={
                                totalActive == 0
                                  ? 0
                                  : Number(
                                      (item.onlineTime / totalActive) * 100
                                    ).toFixed(2)
                              }
                              text={
                                totalActive == 0
                                  ? "0%"
                                  : `${Number(
                                      (item.onlineTime / totalActive) * 100
                                    ).toFixed(2)} %`
                              }
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div style={{ fontWeight: "bolder" }}>
                            Working Contribution
                          </div>
                          <br></br>
                          <div>
                            <CircularProgressbar
                              styles={buildStyles({
                                textColor: "#CF09ED",
                                pathColor: "#CF09ED",
                              })}
                              value={
                                totalContribution == 0
                                  ? 0
                                  : Number(
                                      (item.blockCount / totalContribution) *
                                        100
                                    ).toFixed(2)
                              }
                              text={
                                totalContribution == 0
                                  ? "0%"
                                  : `${Number(
                                      (item.blockCount / totalContribution) *
                                        100
                                    ).toFixed(2)} %`
                              }
                            />
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
      </Row>
    </div>
  );
};
export default Dashboard;
