import { useState } from "react";
import socket from "../../Socket";

const NotePad = ({ inx, setInx }) => {
  //const [inx, setInx] = useState("");

  const updateText = (text) => {
    console.log(text);
    setInx(text);
    socket.emit("text", text);
  };

  const fontFamilies = [
    { font: "Algerian" },
    { font: "Arial" },
    { font: "Calibri" },
    { font: "Cambria" },
  ];
  const [selectedFont, setSelectedFont] = useState("Arial");
  return (
    <div className="container">
      <br></br>
      <div className="row">
        <div className="col-md-6">
          <div className="row">
            <div className="col-md-2">
              <label style={{ fontSize: "15px" }} className="mt-2">
                Font
              </label>
            </div>
            <div className="col-md-10">
              <select
                className="form-control"
                onChange={(e) => {
                  setSelectedFont(e.target.value);
                }}
              >
                {fontFamilies.map((item) => {
                  return (
                    <option
                      value={item.font}
                      style={{ fontFamily: `${item.font}` }}
                    >
                      {item.font}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>
      <textarea
        style={{
          width: "100%",
          height: "1000px",
          borderColor: "white",
          border: "none",
          outline: "none",
          fontSize: "25px",
          fontFamily: `${selectedFont}`,
        }}
        type="text"
        id="inx"
        value={inx}
        onChange={(e) => {
          updateText(e.target.value);
        }}
      ></textarea>
    </div>
  );
};
export default NotePad;
