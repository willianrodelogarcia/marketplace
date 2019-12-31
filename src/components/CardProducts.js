import React from 'react';
import {
    Button,
    Row,
    Col,
    Card
  } from "react-bootstrap";
function CardProduct (props) {

    return(
        <Row>
        {props.data.map((data, index) => {
            return (
              <Col lg={4} md={4} sm={6} xl={3} xs={12} key={index}>
                <Card>
                  <Card.Img
                    onClick={e => props.open(data, e)}
                    className="card-img"
                    variant="top"
                    src={data.urlPhotoProduct}
                  />

                  <Card.Body>
                    <div onClick={e => props.open(data, e)}>
                      <Card.Title>{data.nameProduct}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">
                        Price:{data.price}
                      </Card.Subtitle>
                      <Card.Subtitle className="mb-2 text-muted">
                        Category:{data.category}
                      </Card.Subtitle>
                      <Card.Text></Card.Text>
                    </div>
                    <Button
                      variant="outline-dark"
                      onClick={e => props.action(data, e)}
                    >
                      <img
                        width={20}
                        height={20}
                        className="mr-3"
                        src="../img/shopping-cart.png"
                        alt="Generic placeholder"
                      />
                      Add to cart
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
          </Row>
    );

}


export default CardProduct;