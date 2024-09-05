import { Button, Col, Row } from "antd";
import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs/bundled/rough.esm.js";
import socket from "../../Socket";

const generator = rough.generator();

const WhiteBoard = ({ elements, setElements }) => {
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);
  const [points, setPoints] = useState([]); // For pencil tool
  const [polygonPoints, setPolygonPoints] = useState([]); // For polygon tool
  const [undoStack, setUndoStack] = useState([]);

  useEffect(() => {
    // Socket setup (if needed)
    // Cleanup function to disconnect socket on unmount
  }, []);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const roughCanvas = rough.canvas(canvas);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (elements && elements.length > 0) {
      elements.forEach(({ roughElement }) => {
        roughCanvas.draw(roughElement);
      });
    }
  }, [elements]);

  const createElement = (id, x1, y1, x2, y2, elementType, points = []) => {
    let roughElement;
    switch (elementType) {
      case "line":
        roughElement = generator.line(x1, y1, x2, y2);
        break;
      case "rect":
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
        break;
      case "circle":
        roughElement = generator.circle(x1, y1, Math.abs(x2 - x1));
        break;
      case "triangle":
        roughElement = generator.polygon([
          [x1, y2],
          [(x1 + x2) / 2, y1],
          [x2, y2],
        ]);
        break;
      case "ellipse":
        roughElement = generator.ellipse(
          x1,
          y1,
          Math.abs(x2 - x1),
          Math.abs(y2 - y1)
        );
        break;
      case "polygon":
        roughElement = generator.polygon(points);
        break;
      case "pencil":
        roughElement = generator.linearPath(points);
        break;
      default:
        break;
    }
    return { id, elementType, x1, y1, x2, y2, roughElement, points };
  };

  const distance = (a, b) =>
    Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

  const getElementAtPosition = (x, y) => {
    return elements.find((element) => {
      const { elementType, x1, y1, x2, y2 } = element;
      if (elementType === "rect") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      } else {
        const a = { x: x1, y: y1 };
        const b = { x: x2, y: y2 };
        const c = { x, y };
        const offset = distance(a, b) - (distance(a, c) + distance(b, c));
        return Math.abs(offset) < 1;
      }
    });
  };

  const getCanvasCoordinates = (event) => {
    const canvas = document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getCanvasCoordinates(e);
    if (tool === "selection") {
      const element = getElementAtPosition(x, y);
      if (element) {
        const offsetX = x - element.x1;
        const offsetY = y - element.y1;
        setSelectedElement({ ...element, offsetX, offsetY });
        setAction("moving");
      }
    } else if (tool === "pencil") {
      setAction("drawing");
      setPoints([{ x, y }]);
      const id = elements.length;
      const element = createElement(id, x, y, x, y, tool, [{ x, y }]);
      setElements((prevState) => [...prevState, element]);
    } else if (tool === "polygon") {
      setPolygonPoints([...polygonPoints, [x, y]]);
    } else if (tool === "eraser") {
      setAction("erasing");
    } else {
      const id = elements.length;
      const element = createElement(id, x, y, x, y, tool);
      setElements((prevState) => [...prevState, element]);
      setAction("drawing");
    }
  };

  const updateElement = (id, x1, y1, x2, y2, tool, points = []) => {
    const updatedElement = createElement(id, x1, y1, x2, y2, tool, points);
    const elementsCopy = [...elements];
    elementsCopy[id] = updatedElement;
    setElements(elementsCopy);
    socket.emit("elements", elementsCopy);
  };

  const handleMouseMove = (e) => {
    const { x, y } = getCanvasCoordinates(e);

    if (tool === "selection") {
      e.target.style.cursor = getElementAtPosition(x, y, elements)
        ? "move"
        : "default";
    }

    if (action === "drawing") {
      if (tool === "pencil") {
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);
        const index = elements.length - 1;
        updateElement(index, 0, 0, 0, 0, tool, newPoints);
      } else {
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        updateElement(index, x1, y1, x, y, tool);
      }
    } else if (action === "moving") {
      const { id, x1, x2, y1, y2, elementType, offsetX, offsetY } =
        selectedElement;
      const width = x2 - x1;
      const height = y2 - y1;
      const newX = x - offsetX;
      const newY = y - offsetY;
      updateElement(id, newX, newY, newX + width, newY + height, elementType);
    } else if (action === "erasing") {
      const radius = 10; // Eraser radius
      const newElements = elements.filter((element) => {
        const { x1, y1, x2, y2 } = element;
        const isWithinRadius = (x, y, x1, y1, x2, y2) => {
          // Simple bounding box check
          return (
            x >= Math.min(x1, x2) - radius &&
            x <= Math.max(x1, x2) + radius &&
            y >= Math.min(y1, y2) - radius &&
            y <= Math.max(y1, y2) + radius
          );
        };
        return !isWithinRadius(x, y, x1, y1, x2, y2);
      });
      setElements(newElements);
      socket.emit("elements", newElements);
    }
  };

  const handleMouseUp = () => {
    if (tool === "polygon") {
      if (polygonPoints.length > 2) {
        const id = elements.length;
        const element = createElement(id, 0, 0, 0, 0, "polygon", polygonPoints);
        setElements((prevState) => [...prevState, element]);
        setPolygonPoints([]); // Reset the points after drawing
      }
    }
    setAction("none");
    setSelectedElement(null);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previousElements = undoStack.pop();
    setElements(previousElements);
    socket.emit("elements", previousElements);
  };

  const pushUndoStack = (elements) => {
    setUndoStack((prevStack) => [...prevStack, [...elements]]);
  };

  useEffect(() => {
    // Push current elements to undo stack whenever elements change
    pushUndoStack(elements);
  }, [elements]);

  return (
    <div className="container">
      <Row>
        <Col md={24}>
          <Row>
            <Col>
              <Button
                name="tool"
                id="selection"
                className="mt-1"
                onClick={() => setTool("selection")}
              >
                Drag N Drop
              </Button>
            </Col>
            <Col>
              <Button
                name="tool"
                id="rect"
                className="mt-1"
                onClick={() => setTool("rect")}
              >
                Rectangle
              </Button>
            </Col>
            <Col>
              <Button
                id="line"
                name="tool"
                className="mt-1"
                onClick={() => setTool("line")}
              >
                Line
              </Button>
            </Col>
            <Col>
              <Button
                id="circle"
                name="tool"
                className="mt-1"
                onClick={() => setTool("circle")}
              >
                Circle
              </Button>
            </Col>
            <Col>
              <Button
                id="triangle"
                name="tool"
                className="mt-1"
                onClick={() => setTool("triangle")}
              >
                Triangle
              </Button>
            </Col>
            <Col>
              <Button
                id="ellipse"
                name="tool"
                className="mt-1"
                onClick={() => setTool("ellipse")}
              >
                Ellipse
              </Button>
            </Col>
            <Col>
              <Button
                id="pencil"
                name="tool"
                className="mt-1"
                onClick={() => setTool("pencil")}
              >
                Pencil
              </Button>
            </Col>
            <Col>
              <Button
                id="polygon"
                name="tool"
                className="mt-1"
                onClick={() => setTool("polygon")}
              >
                Polygon
              </Button>
            </Col>
            <Col>
              <Button
                id="eraser"
                name="tool"
                className="mt-1"
                onClick={() => setTool("eraser")}
              >
                Eraser
              </Button>
            </Col>
            {/* <Col>
              <Button id="undo" name="tool" className="mt-1" onClick={undo}>
                Undo
              </Button>
            </Col> */}
          </Row>
        </Col>
      </Row>
      <canvas
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
    </div>
  );
};

export default WhiteBoard;
