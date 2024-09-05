import React, { Fragment, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Breadcrumbs, P } from "../../../AbstractElements";
import { SampleCard } from "../../../Constant";
import NotePad from "../notepad";
import WhiteBoard from "../whiteboard";
const Sample = () => {
  let notepadMatrix = [];
  let imageMatrix = [];

  const [ui, setUi] = useState([]);
  // let ui = [];

  const onc = (v) => {
    //console.log(v);
    let x = ui;
    if (v == 1) {
      const newItem = <NotePad />;
      setUi([...ui, newItem]);
    } else if (v == 2) {
      const newItem = <WhiteBoard />;
      setUi([...ui, newItem]);
    } else if (v == 3) {
    }

    // console.log(ui);
  };
  return (
    <Fragment>
      <Breadcrumbs mainTitle="Sample Page" parent="Pages" title="Sample Page" />
      <button
        className="btn btn-primary"
        onClick={() => {
          onc(1);
        }}
      >
        notebook
      </button>
      <button
        className="btn btn-primary"
        onClick={() => {
          onc(2);
        }}
      >
        draw
      </button>
      <button
        className="btn btn-primary"
        onClick={() => {
          onc(2);
        }}
      >
        draw
      </button>

      <Container fluid={true}>
        <Row>
          <Col sm="12">
            <Card>
              <CardBody>
                {ui &&
                  ui.map((e) => {
                    return <div> {e}</div>;
                  })}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Sample;
