import {
  AppstoreOutlined,
  EditOutlined,
  FileOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { Button, Col, Modal, Row } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import JitsiMeetingComponent from "../Meet";
import SvgIcon from "../../Common/Component/SvgIcon";
import socket from "../../Socket";
import { useWebSocket, WebSocketProvider } from "../../Socket/WebSocketContext";
import { socket_api } from "../../../Constant";
import axios from "axios";
import { Card, CardBody, CardHeader } from "reactstrap";

//UI Component for add new blocks
const BlockEditor = ({
  setBlocks,
  blocks,
  container,
  handleAddBlock,
  blockType,
  setBlockType,
  content,
  setContent,
  base64Image,
  setBase64Image,
  imageName,
  setImageName,
  handleImageUpload,
  base64PDF,
  setBase64PDF,
}) => {
  const styles = {
    uploadContainer: {
      border: "2px solid black",
      width: "400px",
      height: "150px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      position: "relative",
    },
    fileInput: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      cursor: "pointer",
    },
    text: {
      zIndex: 1,
    },
  };

  return (
    <div className="block-editor">
      {blockType === "notepad" ? (
        <div>
          <Row>
            <Col md={23}></Col>
            <Col md={1}>
              <Button onClick={() => handleAddBlock()}>Add</Button>
            </Col>
          </Row>
          <br></br>
          <textarea
            style={{
              width: "100%",
              height: "100px",
              borderColor: "white",
              border: "none",
              outline: "none",
              fontSize: "25px",
              //fontFamily: `${selectedFont}`,
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note here..."
          />
        </div>
      ) : blockType === "pdf" ? (
        <div>
          <Row>
            <Col md={23}></Col>
            <Col md={1}>
              <Button onClick={() => handleAddBlock()}>Add</Button>
            </Col>
          </Row>
          <br></br>
          <input type="file" accept="pdf/*" onChange={handleImageUpload} />
          {base64PDF && (
            <div>
              <iframe
                src={base64PDF}
                title="PDF Document"
                width="100%"
                height="600px"
                style={{ border: "1px solid #ccc" }}
              ></iframe>
            </div>
          )}
        </div>
      ) : blockType === "image" ? (
        <div>
          <Row>
            <Col md={23}></Col>
            <Col md={1}>
              <Button onClick={() => handleAddBlock()}>Add</Button>
            </Col>
          </Row>
          <br></br>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {base64Image && (
            <div>
              <img
                src={base64Image}
                alt={imageName}
                style={{ maxWidth: "300px", marginTop: "10px" }}
              />
            </div>
          )}
        </div>
      ) : (
        ""
      )}
      {/* <button onClick={() => handleAddBlock()}>Add Block</button> */}
    </div>
  );
};

//Display Block Component
const BlockDisplay = ({ blocks, handleDeleteBlock }) => {
  return (
    <div className="block-display">
      {blocks &&
        blocks.map((block) => (
          <div key={block.id} className="block">
            {block.type === "notepad" ? (
              <div>
                <Card>
                  <CardHeader style={{ paddingBottom: -10 }}>
                    <Row>
                      <Col md={23} style={{ fontWeight: "bolder" }}>
                        Added By :{block.username}
                      </Col>
                      {block.user ===
                      JSON.parse(localStorage.getItem("userAuth"))._id ? (
                        <Col md={1}>
                          <Button
                            onClick={() => {
                              handleDeleteBlock(block.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <div className="notepad">{block.content}</div>
                  </CardBody>
                </Card>
              </div>
            ) : block.type === "image" ? (
              <div>
                <Card>
                  <CardHeader style={{ paddingBottom: -10 }}>
                    <Row>
                      <Col md={23} style={{ fontWeight: "bolder" }}>
                        Added By :{block.username}
                      </Col>
                      {block.user ===
                      JSON.parse(localStorage.getItem("userAuth"))._id ? (
                        <Col md={1}>
                          <Button
                            onClick={() => {
                              handleDeleteBlock(block.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={block.content}
                        alt="user uploaded"
                        width={"60%"}
                        height={"60%"}
                      />
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : block.type === "pdf" ? (
              <div>
                <Card>
                  <CardHeader style={{ paddingBottom: -10 }}>
                    <Row>
                      <Col md={23} style={{ fontWeight: "bolder" }}>
                        Added By :{block.username}
                      </Col>
                      {block.user ===
                      JSON.parse(localStorage.getItem("userAuth"))._id ? (
                        <Col md={1}>
                          <Button
                            onClick={() => {
                              handleDeleteBlock(block.id);
                            }}
                          >
                            Delete
                          </Button>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <iframe
                      src={block.content}
                      title="PDF Document"
                      width="100%"
                      height="600px"
                      style={{ border: "1px solid #ccc" }}
                    ></iframe>
                  </CardBody>
                </Card>
              </div>
            ) : (
              ""
            )}
          </div>
        ))}
    </div>
  );
};
//Main Component Workspace
const Workspace = ({ blocks, setBlocks }) => {
  const [modal, setModal] = useState(false);
  const [components, setComponents] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const [base64Image, setBase64Image] = useState("");
  const [imageName, setImageName] = useState("");
  const [blockType, setBlockType] = useState("notepad");
  const [content, setContent] = useState("");
  const [base64PDF, setBase64PDF] = useState("");

  const getRoomDetails = async () => {
    try {
      await axios
        .get(socket_api + `api/room/get/${localStorage.getItem("room")}`)
        .then((response) => {
          localStorage.setItem(
            "roomDetails",
            JSON.stringify(response.data.data)
          );
        });
    } catch (err) {
      console.log(err);
    }
  };
  // console.log(  JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
  //   (user) =>
  //     user.user._id === JSON.parse(localStorage.getItem("userAuth"))._id
  // )[0].blockCount);
  // let blockCount =
  //   localStorage.getItem("roomDetails") &&
  //   JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
  //     (user) => user.user === JSON.parse(localStorage.getItem("userAuth"))._id
  //   )[0] &&
  //   JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
  //     (user) =>
  //       user.user._id === JSON.parse(localStorage.getItem("userAuth"))._id
  //   )[0].blockCount;
  // let blockCount =
  //   localStorage.getItem("roomDetails") &&
  //   JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
  //     (user) =>
  //       user.user._id === JSON.parse(localStorage.getItem("userAuth"))._id
  //   )[0].blockCount;
  const updateBlockCount = () => {
    console.log(
      "aaa",
      JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
        (user) =>
          user.user._id === JSON.parse(localStorage.getItem("userAuth"))._id
      )[0]
    );
    axios
      .put(
        socket_api +
          `api/room/update-block-count/${localStorage.getItem("room")}/${
            JSON.parse(localStorage.getItem("userAuth"))._id
          }`,
        {
          blockCount:
            Number(
              localStorage.getItem("roomDetails") &&
                JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
                  (user) =>
                    user.user ===
                    JSON.parse(localStorage.getItem("userAuth"))._id
                )[0] &&
                JSON.parse(localStorage.getItem("roomDetails"))[0].users.filter(
                  (user) =>
                    user.user._id ===
                    JSON.parse(localStorage.getItem("userAuth"))._id
                )[0].blockCount == null
                ? 1
                : JSON.parse(
                    localStorage.getItem("roomDetails")
                  )[0].users.filter(
                    (user) =>
                      user.user._id ===
                      JSON.parse(localStorage.getItem("userAuth"))._id
                  )[0].blockCount
            ) + 1,
        }
      )
      .then((response) => {
        getRoomDetails();
      });
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageName(file.name);
      const reader = new FileReader();

      reader.onloadend = () => {
        setBase64Image(reader.result);
        setBase64PDF(reader.result);
        setContent(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };
  let container = [];
  const handleDeleteBlock = (blockId) => {
    setBlocks((prevBlocks) => {
      const updatedBlocks = prevBlocks.filter((block) => block.id !== blockId);
      socket.emit("block", updatedBlocks); // Emit the updated blocks after deletion
      return updatedBlocks;
    });
  };
  const handleAddBlock = () => {
    const newBlock = {
      user: JSON.parse(localStorage.getItem("userAuth"))._id,
      username:
        JSON.parse(localStorage.getItem("userAuth")).fName +
        " " +
        JSON.parse(localStorage.getItem("userAuth")).lName,
      id: uuidv4(),
      type: blockType,
      content,
    };
    // container.push(newBlock);
    // console.log("container", container);
    setBlocks((prevContainer) => {
      const updatedContainer = [...prevContainer, newBlock];
      // setBlocks(updatedContainer); // Update blocks with the same array
      socket.emit("block", updatedContainer); // Emit the updated container
      return updatedContainer;
    });
    //console.log("container", container);
    // setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    //setBlocks(container);

    setContent("");

    // socket.emit("block", blocks);
    updateBlockCount();
  };

  // Establish WebSocket connection and handle incoming messages
  useEffect(() => {
    getRoomDetails();

    //socket.on("block", blocks);
  });

  // Function to add a new component block
  const addComponent = (type) => {
    const newComponent = {
      id: Date.now(),
      type,
      content: "",
      editable: true,
    };

    // Update local state and send new component to WebSocket server
    setComponents((prev) => [...prev, newComponent]);
    setSelectedOption(null);
    socket.send(JSON.stringify(newComponent));
  };

  // Function to save the component and lock editing
  const saveComponent = (id, content) => {
    const updatedComponent = {
      id,
      content,
      editable: false,
    };

    // Update local state and send updated component to WebSocket server
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, content, editable: false } : comp
      )
    );
    socket.send(JSON.stringify(updatedComponent));
  };

  const selectItem = (item) => {
    setBlockType(item);
    setModal(false);
  };
  return (
    <Fragment>
      <br></br>
      <br></br>
      <Button type="primary" onClick={() => setModal(true)}>
        Select Block Type
      </Button>
      <br></br>
      <Modal
        title="Options"
        centered
        open={modal}
        onOk={() => setModal(false)}
        onCancel={() => setModal(false)}
      >
        <Row
          style={{
            padding: "10px",
            border: "1px solid black",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
          onClick={() => {
            selectItem("notepad");
          }}
        >
          <Col span={4}>
            <FileOutlined style={{ fontSize: "24px" }} />
          </Col>
          <Col span={20}>
            <div>Notepad</div>
          </Col>
        </Row>

        <Row
          style={{
            padding: "10px",
            border: "1px solid black",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
          onClick={() => {
            selectItem("image");
          }}
        >
          <Col span={4}>
            <PictureOutlined style={{ fontSize: "24px" }} />
          </Col>
          <Col span={20}>
            <div>Image</div>
          </Col>
        </Row>

        <Row
          style={{
            padding: "10px",
            border: "1px solid black",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
          onClick={() => {
            selectItem("whiteboard");
          }}
        >
          <Col span={4}>
            <EditOutlined style={{ fontSize: "24px" }} />
          </Col>
          <Col span={20}>
            <div>Whiteboard</div>
          </Col>
        </Row>

        <Row
          style={{
            padding: "10px",
            border: "1px solid black",
            borderRadius: "5px",
          }}
          onClick={() => {
            selectItem("pdf");
          }}
        >
          <Col span={4}>
            <AppstoreOutlined style={{ fontSize: "24px" }} />
          </Col>
          <Col span={20}>
            <div>PDF</div>
          </Col>
        </Row>
      </Modal>

      {selectedOption && (
        <div className="modal">
          <p>Selecting: {selectedOption}</p>
          <button onClick={() => addComponent(selectedOption)}>Confirm</button>
        </div>
      )}
      <br></br>
      <BlockEditor
        setBlocks={setBlocks}
        blocks={blocks}
        container={container}
        handleAddBlock={handleAddBlock}
        blockType={blockType}
        setBlockType={setBlockType}
        content={content}
        setContent={setContent}
        base64Image={base64Image}
        setBase64Image={setBase64Image}
        handleImageUpload={handleImageUpload}
        imageName={imageName}
        setImageName={setImageName}
        base64PDF={base64PDF}
        setBase64PDF={setBase64PDF}
      />
      <br></br>
      <BlockDisplay blocks={blocks} handleDeleteBlock={handleDeleteBlock} />
    </Fragment>
  );
};

export default Workspace;
