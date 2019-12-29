import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Navbar,
  Nav,
  Form,
  FormControl,
  Row,
  Col,
  Card,
  Badge,
  Image,
  Modal,
  Spinner,
  Alert,
  ProgressBar,
  Carousel
} from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

function App() {
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/willdev/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "nllrspdu";

  const [data, setData] = useState({
    products: []
  });

  const [shoppingcart, setShoppingCart] = useState({
    shoppingcarts: [],
    count: 0
  });

  const [textImage, setNameImage] = useState({
    name: "Select Image",
    file: [],
    progress: 0
  });

  const [form, setForm] = useState({
    nameProduct: "",
    price: "",
    description: "",
    category: ""
  });

  const [filter, setFilter] = useState({
    filter: "All Products",
    count: 0
  });

  const [alert, setAlert] = useState({
    show: false,
    status: "",
    message: ""
  });

  const [show, setShow] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const handleClose = () => {
    setShow(false);
    setForm({
      nameProduct: "",
      price: "",
      description: "",
      category: ""
    });
  };
  const handleShow = () => setShow(true);
  const handleCartClose = () => {
    setShowCart(false);
    setAlert({
      show: false,
      status: "",
      message: ""
    });
  };

  const [save, setSave] = useState({
    products: []
  });

  const [sum, setSum] = useState({
    sum: 0,
    count: 0
  });

  const handleCartShow = () => {
    setShowCart(true);
    var sum = 0;
    var count = 0;
    var data = JSON.parse(localStorage.getItem("test"));
    console.log(data);
    if (data !== null) {
      data.map((data, index) => {
        sum += data.price;
        count = index + 1;
      });

      console.log(JSON.parse(localStorage.getItem("test")));
      //console.log(JSON.stringify(data))

      setSum({
        sum: sum,
        count: count
      });

      setShoppingCart({
        shoppingcarts: JSON.parse(localStorage.getItem("test"))
      });
    }
  };

  function countCart() {
    var data = JSON.parse(localStorage.getItem("test"));
    var sum = 0;
    var count = 0;
    if (data !== null) {
      data.map((data, index) => {
        sum += data.price;
        count = index + 1;
      });

      setSum({
        sum: sum,
        count: count
      });
    }
  }

  function addCart(data, e) {
    let products = [];
    console.log(data);
    if (localStorage.getItem("test")) {
      products = JSON.parse(localStorage.getItem("test"));
    }

    products.push({
      id: data._id,
      urlPhotoProduct: data.urlPhotoProduct,
      nameProduct: data.nameProduct,
      price: data.price,
      description: data.description,
      category: data.category
    });

    console.log("productos", products);

    localStorage.setItem("test", JSON.stringify(products));
    countCart();
  }

  const getValueForm = e => {
    const name = e.target.name;
    const value = e.target.value;

    console.log(name, value);

    setForm({
      ...form,
      [name]: value
    });
  };

  function changeFile(e) {
    e.preventDefault();

    setNameImage({
      name: e.target.files[0].name,
      file: e.target.files[0],
      progress: 0
    });
  }

  async function selectCategory(e) {
    e.preventDefault();
    let filter = e.target.value;
    if (filter !== "0") {
      try {
        const result = await axios.get(
          `https://marketplace-api.herokuapp.com/api/filter/${filter}`
        );

        setData({
          products: result.data.products
        });

        console.log(result);
        countProduct(result, filter);
      } catch (err) {
        console.log(err);
      }
    } else {
      getProducts();
    }
  }

  const getProductsSearch = async e => {
    if (e.target.value === "") {
      getProducts();
    } else {
      try {
        const result = await axios.get(
          `https://marketplace-api.herokuapp.com/api/search/${e.target.value}`
        );

        setData({
          products: result.data.products
        });

        console.log(result);
        countProduct(result, "All Products");
      } catch (err) {
        //alert("Error en la api");
        console.log(err);
      }
    }
  };

  const getProducts = async () => {
    var data = JSON.parse(localStorage.getItem("test"));
    var sum = 0;
    if (data !== null) {
      var count = 0;
      data.map((data, index) => {
        sum += data.price;
        count = index + 1;
      });

      console.log(JSON.parse(localStorage.getItem("test")));
      //console.log(JSON.stringify(data))

      setSum({
        sum: sum,
        count: count
      });
    }

    try {
      const result = await axios.get(
        "https://marketplace-api.herokuapp.com/api/products"
      );

      setData({
        products: result.data.products
      });

      console.log(result);
      countProduct(result, "All Products");
    } catch (err) {
      //alert("Error en la api");
      console.log(err);
    }
  };

  async function saveProduct(e) {
    e.preventDefault();
    const file = textImage.file;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const result = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress(e) {
          console.log(Math.round((e.loaded * 100) / e.total));
          const progress = (e.loaded * 100) / e.total;
          setNameImage({
            name: textImage.name,
            progress
          });
          if (progress === 100) {
            setNameImage({ name: "Select Image", file: [], progress: 0 });
          }
        }
      });

      console.log(result);
      const dataJson = {
        urlPhotoProduct: result.data.url,
        nameProduct: form.nameProduct,
        price: form.price,
        description: form.description,
        category: form.category
      };
      const saveMongo = await axios.post(
        "https://marketplace-api.herokuapp.com/api/products",
        dataJson,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      console.log(saveMongo);

      setAlert({
        show: true,
        status: saveMongo.data.status,
        message: saveMongo.data.message
      });
      setForm({
        nameProduct: "",
        price: "",
        category: "",
        description: ""
      });
      getProducts();
    } catch (err) {
      console.log(err);
    }
  }

  const countProduct = (r, category) => {
    console.log("Index", "test");
    console.log("Products", r.data.products);

    console.log(filter.filter);

    if (r.data.products.length > 0) {
      r.data.products.map((data, index) => {
        setFilter({
          count: index + 1,
          filter: category
        });
        console.log("Index", filter.count);
      });
    } else {
      setFilter({
        count: 0,
        filter: "All Products"
      });
    }
  };

  function removeProduct(productId) {
    // Your logic for your app.
    // strore products in local storage
    let storageProducts = JSON.parse(localStorage.getItem("test"));
    let products = storageProducts.filter(product => product.id !== productId);
    console.log(products);
    localStorage.setItem("test", JSON.stringify(products));
    countCart();
    setShowCart(false);
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div>
      <Navbar bg="light" variant="light">
        <Navbar.Brand className="logo-nav">
          <img
            alt=""
            src="../img/store.png"
            width="50"
            height="50"
            className="d-inline-block align-top"
          />{" "}
          <h3>MarketPlace</h3>
        </Navbar.Brand>
        <Nav className="mr-auto"></Nav>
        <Form inline>
          <FormControl
            type="text"
            placeholder="Search"
            className="mr-sm-2"
            onChange={getProductsSearch}
          />
          <Button variant="light" onClick={handleCartShow}>
            <img
              width={20}
              height={20}
              className="mr-3"
              src="../img/shopping-cart.png"
              alt="Generic placeholder"
            />
            <Badge variant="danger">{sum.count}</Badge>
            <span className="sr-only">unread messages</span>
          </Button>
        </Form>
      </Navbar>

      {/*<Image
        width={100 + "%"}
        height={50+'%'}
        src="https://c4.wallpaperflare.com/wallpaper/255/407/688/pokemon-pokemon-ruby-and-sapphire-wallpaper-preview.jpg"
        fluid
      />*/}
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://http2.mlstatic.com/optimize/o:f_webp/resources/deals/exhibitors_resources/mco-home-desktop-slider-picture-41391824-9603-440e-a18e-65b3cceabb4c.jpg"
            alt="First slide"
          />
          <Carousel.Caption>
            
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://merchant.razer.com/v3/wp-content/uploads/2015/03/manage-marketplace-banner.jpg"
            alt="Third slide"
          />

          <Carousel.Caption>
            
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://www.indusnet.co.in/images/mo_developmentTabBanner.png"
            alt="Third slide"
          />

          <Carousel.Caption>
            
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      <div className="select-content ">
        <div className="select-content-text">
          {/*<h2>{filter.filter}</h2>
          <p>({filter.count} Products)</p>*/}
        </div>
        <div className="input-group mb-3 col-sm-3">
          <select
            className="custom-select"
            id="inputGroupSelect01"
            onChange={selectCategory}
          >
            <option value="0">Choose...</option>
            <option value="Technology">Technology</option>
            <option value="homeappliances">home appliances</option>
            <option value="home">Home</option>
            <option value="Clothing">Clothing</option>
            <option value="HealthBeauty">Health Beauty</option>
            <option value="Beauty">Beauty</option>
            <option value="ToyStore">Toy Store</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>

      <div className="content">
        <Row>
          {data.products.map((data, index) => {
            return (
              <Col lg={4} md={4} sm={6} xl={3} xs={12} key={index}>
                <Card>
                  <Card.Img
                    className="card-img"
                    variant="top"
                    src={data.urlPhotoProduct}
                  />
                  <Card.Body>
                    <Card.Title>{data.nameProduct}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      Price:{data.price}
                    </Card.Subtitle>
                    <Card.Subtitle className="mb-2 text-muted">
                      Category:{data.category}
                    </Card.Subtitle>
                    <Card.Text></Card.Text>
                    <Button
                      variant="outline-dark"
                      onClick={e => addCart(data, e)}
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
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Registro Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={e => saveProduct(e)}>
            {/*  */}
            <div className="form-row">
              <div className="col-md-12 mb-3">
                <div className="input-group mb-3">
                  <div className="custom-file">
                    <input
                      type="file"
                      className="custom-file-input"
                      id="imgFile"
                      onChange={changeFile}
                      aria-describedby="imgFile"
                    />

                    <label className="custom-file-label" htmlFor="imgFile">
                      {textImage.name}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <ProgressBar now="60" label="60" />
            <div className="form-row">
              <div className="col-md-4 mb-3">
                <label htmlFor="nameProduct">Name Product</label>
                <input
                  type="text"
                  className="form-control"
                  id="nameProduct"
                  name="nameProduct"
                  value={form.nameProduct}
                  onChange={getValueForm}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="price">Price</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={form.price}
                  onChange={getValueForm}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="category">Category</label>
                <select
                  className="custom-select"
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={getValueForm}
                  required
                >
                  <option value="0">Choose...</option>
                  <option value="Technology">Technology</option>
                  <option value="homeappliances">home appliances</option>
                  <option value="home">Home</option>
                  <option value="Clothing">Clothing</option>
                  <option value="HealthBeauty">Health Beauty</option>
                  <option value="Beauty">Beauty</option>
                  <option value="ToyStore">Toy Store</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="form-group col-md-12 mb-12">
                <label htmlFor="description">Description</label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={getValueForm}
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>

            <button className="btn btn-primary">Save</button>

            {alert.status === "OK" ? (
              <Alert show={alert.show} variant="success">
                {alert.message}
              </Alert>
            ) : (
              <Alert show={alert.show} variant="danger">
                {alert.message}
              </Alert>
            )}
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={showCart} onHide={handleCartClose}>
        <Modal.Header closeButton>
          <Modal.Title>Shopping Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {shoppingcart.shoppingcarts.map((data, index) => {
              //sumProducts(data.price);
              return (
                <div key={index}>
                  <div className="shopping-cart">
                    <div className="shopping-cart-image">
                      <img src={data.urlPhotoProduct} />
                    </div>
                    <div className="shopping-cart-info">
                      <div className="shopping-cart-content">
                        <div className="shopping-cart-body">
                          <h3>{data.nameProduct}</h3>
                          <p className="subtitle-cart">{data.category}</p>
                          <p>{data.description}</p>
                        </div>
                        <div className="shopping-cart-price">
                          <p>${data.price}</p>
                        </div>
                        <div className="shopping-cart-buttons">
                          <Button
                            variant="outline-danger"
                            onClick={e => removeProduct(data.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <p>Total: $ {sum.sum}</p>
        </Modal.Footer>
      </Modal>

      <div className="xyz">
        <button
          onClick={handleShow}
          type="button"
          className="btn btn-dark btn-circle btn-xl"
        >
          <i className="material-icons">add</i>
        </button>
      </div>
    </div>
  );
}

export default App;
