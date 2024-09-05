import { Button, Form, Input, Select } from "antd";
import { TeamOutlined } from "@ant-design/icons";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CardBody,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Col,
  Row,
} from "reactstrap";
import { generateRandomString, socket_api } from "../../../../Constant";
import socket from "../../../Socket";
import axios from "axios";
import { Breadcrumbs, Btn, H3, LI, UL } from "../../../../AbstractElements";
import moment from "moment";
import swal from "sweetalert2";
toast.configure();
const Home = () => {
  const [modal, setModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [roomID, setRoomID] = useState();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);
  const [myRooms, setMyRooms] = useState([]);
  const [mousePositions, setMousePositions] = useState({});
  const [form] = Form.useForm();
  const [formSettings] = Form.useForm();
  const socketRef = useRef(null);
  const userID = JSON.parse(localStorage.getItem("userAuth"))._id;
  const Username = JSON.parse(localStorage.getItem("userAuth")).email;

  const createWorkspace = async () => {
    try {
      const values = await form.validateFields();
      let model = {
        roomName: values.roomName,
        roomID: values.roomID,
        createdUser: userID,
        roomPassword: values.password,
        users: [],
      };
      await axios
        .post(socket_api + "api/room/create", model)
        .then((response) => {
          if (response.data.code == 1) {
            toast.success("Successfully created workspace group");
          } else {
            toast.success("Error while creating.Please try again.");
          }
          setModal(false);
          getAllWorkspaces();
        });
    } catch (err) {
      toast.success("Error while creating.Please try again.");
      console.error(err);
      setModal(false);
    }
  };
  // const getRoomDetails = async (room) => {
  //   try {
  //     axios.get(socket_api + `api/room/get/${room}`).then((response) => {
  //       let online = 0;
  //       let count = 0;
  //       console.log(response.data.data);
  //       response.data.data &&
  //         response.data.data[0].users &&
  //         response.data.data[0].users.map((item) => {
  //           console.log(item);
  //           online = online + item.onlineTime;
  //           count = count + item.blockCount;
  //         });
  //       console.log(online, count);
  //       setTotalActive(online);
  //       setTotalContribution(count);
  //       setRoom(response.data.data);
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const [allUsers, setAllUsers] = useState([]);
  //get all users for add into group
  const getallUsers = async () => {
    await axios.get(socket_api + "api/user/", {}).then((response) => {
      if (response.data.code === 1) {
        const data = response.data.data.map((item) => {
          return {
            label: item.fName + " " + item.lName,
            value: item._id,
          };
        });
        setAllUsers(data);
      }
    });
  };
  //update group users function
  const updateGroupUsers = async () => {
    try {
      const formData = await formSettings.validateFields();
      console.log(formData);
      axios
        .put(
          socket_api + "api/room/update-users/" + currentUpdateRoom,
          formData
        )
        .then((response) => {
          if (response.data.code == 1) {
            toast.success("Successfully updated group members");
          } else {
            toast.error("Error while updating group members");
          }
        });
    } catch (err) {
      toast.error("Error while updating group members");
    }
  };
  //delete room function
  const deleteRoom = async (roomID) => {
    //setLoading(true);
    try {
      // Send DELETE request to delete the room by roomID
      await axios
        .delete(`${socket_api}api/room/delete/${roomID}`)
        .then((response) => {
          console.log(response);
          if (response.data.code === 1) {
            toast.success("Room successfully deleted!");
            // Refresh rooms after successful deletion
            getAllWorkspaces();
          } else {
            toast.warn("Failed to delete the room.");
          }
          setSettingsModal(false);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error occurred while deleting the room.");
          setSettingsModal(false);
        });
    } catch (err) {
      console.log(err);
      toast.error("Unexpected error occurred.");
    }
  };

  const getAllWorkspaces = async () => {
    let model = { userID: userID };
    await axios
      .post(socket_api + "api/room/search", model)
      .then((response) => {
        if (response.data.code === 1) {
          setMyRooms(response.data.data);
        }
      })
      .catch((error) => console.error(error));
  };

  const joinRoom = (roomID) => {
    if (Username && roomID) {
      swal
        .fire({
          title: "Are you sure?",
          text: "You will  be joined to selected group !",
          type: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, join !",
          cancelButtonText: "No, keep it",
        })
        .then(
          async function async() {
            socket.emit("joinRoom", { username: Username, room: roomID });
            setJoined(true);
            localStorage.setItem("room", roomID);
            socketRef.current = socket;
            await axios
              .get(socket_api + "api/room/get/" + roomID)
              .then((response) => {
                localStorage.setItem(
                  "roomDetails",
                  JSON.stringify(response.data.data)
                );
              });
            //getRoomDetails(roomID);
          },
          function (dismiss) {
            // dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            if (dismiss === "cancel") {
            }
          }
        );
    }
  };

  const sendMessage = () => {
    if (message) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  const toggle = () => {
    setModal(!modal);
    const room = generateRandomString(12);
    setRoomID(room);
    form.setFieldValue("roomID", room);
  };

  const handleMouseMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    socket.emit("down", { x, y, email: Username });
  };
  const [formUsers] = Form.useForm();
  const [currentUpdateRoom, setCurrentUpdateRoom] = useState("");

  const deleteRoomCallBack = () => {
    console.log(currentUpdateRoom);
    deleteRoom(currentUpdateRoom);
  };
  useEffect(() => {
    socket.on("ondown", (data) => {
      setMousePositions((prevPositions) => ({
        ...prevPositions,
        [data.email]: { x: data.x, y: data.y },
      }));
    });

    return () => {
      socket.off("ondown");
    };
  }, []);

  const toggleSettings = (roomID) => {
    formSettings.setFieldValue("users", "");
    setCurrentUpdateRoom(roomID);
    if (!settingsModal) {
      console.log(myRooms);
      const filteredUsers = myRooms.filter((item) => item.roomID === roomID)[0]
        .users;

      console.log(
        filteredUsers.map((user) => {
          return user.user._id;
        })
      );
      formSettings.setFieldValue(
        "users",
        filteredUsers &&
          filteredUsers.map((user) => {
            return user.user._id;
          })
      );
    }
    setSettingsModal(!settingsModal);
  };
  useEffect(() => {
    getAllWorkspaces();
    getallUsers();
  }, []);
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Home" title="Home" />
      <div
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
        })}

        <Row className="mt-3 mb-3">
          <Col>
            <Button onClick={toggle}>Create Workspace</Button>
          </Col>
        </Row>
        <Modal isOpen={modal} toggle={toggle} backdrop="static">
          <ModalHeader>Create Workspace</ModalHeader>
          <ModalBody>
            <Form form={form}>
              <Row>
                <Col md={11}>
                  <FormGroup>
                    <Label>Workspace ID</Label>
                    <Form.Item name={"roomID"}>
                      <Input disabled type="text" maxLength={20} />
                    </Form.Item>
                  </FormGroup>
                </Col>
                <Col md={11}>
                  <FormGroup>
                    <Label>Nick Name</Label>
                    <Form.Item name={"roomName"}>
                      <Input type="text" maxLength={20} />
                    </Form.Item>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={11}>
                  <FormGroup>
                    <Label>Password</Label>
                    <Form.Item name={"password"}>
                      <Input type="password" />
                    </Form.Item>
                  </FormGroup>
                </Col>
                <Col md={11}>
                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <Form.Item name={"cPassword"}>
                      <Input type="password" />
                    </Form.Item>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={createWorkspace} type="primary" color="primary">
              Create
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={modal} toggle={toggle}>
          <ModalHeader>Create Workspace</ModalHeader>
          <ModalBody>
            <Form form={form}>
              <Row>
                <Col md={11}>
                  <FormGroup>
                    <Label>Workspace ID</Label>
                    <Form.Item name={"roomID"}>
                      <Input disabled type="text" maxLength={20} />
                    </Form.Item>
                  </FormGroup>
                </Col>
                <Col md={11}>
                  <FormGroup>
                    <Label>Nick Name</Label>
                    <Form.Item name={"roomName"}>
                      <Input type="text" maxLength={20} />
                    </Form.Item>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={11}>
                  <FormGroup>
                    <Label>Password</Label>
                    <Form.Item name={"password"}>
                      <Input type="password" />
                    </Form.Item>
                  </FormGroup>
                </Col>
                <Col md={11}>
                  <FormGroup>
                    <Label>Confirm Password</Label>
                    <Form.Item name={"cPassword"}>
                      <Input type="password" />
                    </Form.Item>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={createWorkspace} type="primary" color="primary">
              Create
            </Button>
          </ModalFooter>
        </Modal>
        <Modal isOpen={settingsModal} toggle={toggleSettings} backdrop="static">
          <ModalHeader toggle={toggleSettings}>Update Members</ModalHeader>
          <ModalBody>
            <Form form={formSettings}>
              <Row>
                <Col md={11}>
                  <FormGroup>
                    <Label>Users</Label>
                    <Form.Item name={"users"}>
                      <Select
                        mode="multiple"
                        allowClear
                        style={{
                          width: "100%",
                        }}
                        placeholder="Please select"
                        // defaultValue={['a10', 'c12']}
                        onChange={handleChange}
                        options={allUsers}
                      />
                    </Form.Item>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button
              type="primary"
              color="primary"
              onClick={() => {
                updateGroupUsers();
              }}
            >
              Update Members
            </Button>
            <Button
              type="primary"
              color="primary"
              onClick={() => deleteRoomCallBack()}
            >
              Delete Room
            </Button>
          </ModalFooter>
        </Modal>
        <CardBody>
          <Row className="pricing-block">
            {myRooms &&
              myRooms.map((item) => (
                <Col lg="3" md="6" key={item.roomID}>
                  <div className="pricingtable">
                    {item.createdUser._id ===
                    JSON.parse(localStorage.getItem("userAuth"))._id ? (
                      <Row>
                        <Col md={8}></Col>
                        <Col md={3}>
                          <Button
                            title="settings"
                            onClick={() => {
                              toggleSettings(item.roomID);
                            }}
                          >
                            <TeamOutlined />
                          </Button>
                        </Col>
                      </Row>
                    ) : (
                      ""
                    )}

                    <div className="pricingtable-header">
                      <H3 attrH3={{ className: "title" }}>{item.roomName}</H3>
                    </div>
                    <div className="price-value">
                      {/* <span className="currency">$</span>
                    <span className="amount">10</span>
                    <span className="duration">/mo</span> */}
                    </div>
                    <UL attrUL={{ className: " flex-row" }}>
                      <LI attrLI={{ className: "border-0" }}>
                        {"Workspace ID :" + item.roomID}
                      </LI>
                      {/* <LI attrLI={{ className: "border-0" }}>
                      {"50 Email Accounts"}
                    </LI>
                    <LI attrLI={{ className: "border-0" }}>{"Maintenance"}</LI> */}
                      <LI attrLI={{ className: "border-0" }}>
                        {"Created Date : " +
                          moment(item.CreatedOn).format("YYYY-MMM")}
                      </LI>
                    </UL>
                    <div className="pricingtable-signup">
                      <Btn
                        attrBtn={{
                          color: "primary",
                          size: "lg",
                          onClick: () => joinRoom(item.roomID),
                        }}
                      >
                        Join
                      </Btn>
                    </div>
                  </div>
                </Col>
              ))}
          </Row>
        </CardBody>
      </div>
    </Fragment>
  );
};

export default Home;
