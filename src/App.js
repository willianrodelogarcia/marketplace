import React, { useState, useEffect } from "react";
//We import the axios library to make requests to our api
import axios from "axios";
//We import the react-boostrap library for the design
import {
  Button,
  Navbar,
  Nav,
  Form,
  FormControl,
  Badge,
  Modal,
  Alert,
  ProgressBar,
  Carousel
} from "react-bootstrap";
//react-boostrap styles
import "bootstrap/dist/css/bootstrap.min.css";

import CardProduct from "./components/CardProducts";

import "./App.css";

function App() {
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/willdev/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "nllrspdu";

  //we define the state to save the products that come from the api
  const [data, setData] = useState({
    products: []
  });
  //the state with which the products are stored in the cart is defined
  const [shoppingcart, setShoppingCart] = useState({
    shoppingcarts: [],
    count: 0
  });

  //the state where the name, file and image progress is saved is defined
  const [textImage, setNameImage] = useState({
    name: "Select Image",
    file: [],
    progress: 0
  });
  //the state where we have the name of the product, price, description and category is defined
  const [form, setForm] = useState({
    nameProduct: "",
    price: "",
    description: "",
    category: ""
  });
  //the state where we have the quantity of products is defined
  const [filter, setFilter] = useState({
    filter: "All Products",
    count: 0
  });

  //status to show an alert when saving a product
  const [alert, setAlert] = useState({
    show: false,
    status: "",
    message: ""
  });

  //status to show product details
  const [detail, setDetail] = useState({
    _id: "",
    urlPhotoProduct: "",
    nameProduct: "",
    price: "",
    description: "",
    category: ""
  });
  //state to control the action of a modal to open and close it
  const [show, setShow] = useState(false);
  //state to control the action of a modal to open and close it
  const [showCart, setShowCart] = useState(false);
  //state to control the action of a modal to open and close it
  const [showDetailProduct, setshowDetailProduct] = useState(false);

  //status to save the sum of the products in the cart
  const [sum, setSum] = useState({
    sum: 0,
    count: 0
  });

  const [showBanner, setShowBanner] = useState(true);

  //function to close modal and clean form data
  const handleClose = () => {
    setShow(false);
    //clean the form
    setForm({
      nameProduct: "",
      price: "",
      description: "",
      category: ""
    });
    //close the alert
    setAlert({
      show: false,
      status: "",
      message: ""
    });
  };
  //close modal
  const handleShow = () => setShow(true);
  //close cart modal
  const handleCartClose = () => {
    setShowCart(false);
    setAlert({
      show: false,
      status: "",
      message: ""
    });
  };

  //function to show modal with product detail
  const openDetail = (data, e) => {
    e.preventDefault();
    setshowDetailProduct(true);

    setDetail({
      _id: data._id,
      urlPhotoProduct: data.urlPhotoProduct,
      nameProduct: data.nameProduct,
      price: data.price,
      description: data.description,
      category: data.category
    });
  };

  //function to close modal with product detail
  const handleDetailProductClose = () => {
    setshowDetailProduct(false);
  };

  //function to show cart modal
  const handleCartShow = () => {
    setShowCart(true);
    var sum = 0;
    var count = 0;
    //product data is obtained from storage
    var data = JSON.parse(localStorage.getItem("product"));

    if (data !== null) {
      data.map((data, index) => {
        sum += data.price;
        count = index + 1;
      });

      //the status of the sum and quantity of products is saved
      setSum({
        sum: sum,
        count: count
      });
      //the status of the products is saved in the shopping cart in the localStorage
      setShoppingCart({
        shoppingcarts: JSON.parse(localStorage.getItem("product"))
      });
    }
  };

  //function to count the amount of products in the cart
  function countCart() {
    var data = JSON.parse(localStorage.getItem("product"));
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

  //function to add the products to the cart
  function addCart(data, e) {
    let products = [];
    //console.log(data);

    //we validate that there are products in the localStorage
    if (localStorage.getItem("product")) {
      //Products are saved
      products = JSON.parse(localStorage.getItem("product"));
    }
    //a new product is added to the localStorage
    products.push({
      id: data._id,
      urlPhotoProduct: data.urlPhotoProduct,
      nameProduct: data.nameProduct,
      price: data.price,
      description: data.description,
      category: data.category
    });

    //console.log("productos", products);

    //it is saved in localStorage
    localStorage.setItem("product", JSON.stringify(products));
    countCart();
  }

  //function to get the form data
  const getValueForm = e => {
    const name = e.target.name;
    const value = e.target.value;

    //console.log(name, value);

    setForm({
      ...form,
      [name]: value
    });
  };

  //function to get image data
  function changeFile(e) {
    e.preventDefault();

    setNameImage({
      name: e.target.files[0].name,
      file: e.target.files[0],
      progress: 0
    });
  }

  //function to filter by category
  async function selectCategory(e) {
    e.preventDefault();
    //we get the value of the product category
    let filter = e.target.value;
    if (filter !== "0") {
      try {
        //We made a GET request to obtain the products by category
        const result = await axios.get(
          `https://marketplace-api.herokuapp.com/api/filter/${filter}`
        );

        setData({
          products: result.data.products
        });

        countProduct(result, filter);
      } catch (err) {
        console.log(err);
      }
    } else {
      getProducts();
    }
  }

  //function to search for a product by name
  const getProductsSearch = async e => {
    if (e.target.value === "") {
      //we get the products
      getProducts();
      setShowBanner(true);
    } else {
      try {
        //We make a GET request to obtain the products
        const result = await axios.get(
          `https://marketplace-api.herokuapp.com/api/search/${e.target.value}`
        );
        //we change the state of the product
        setData({
          products: result.data.products
        });
        setShowBanner(false);
        countProduct(result, "All Products");
      } catch (err) {
        console.log(err);
      }
    }
  };

  //function to obtain product data
  const getProducts = async () => {
    //we get the data stored in the localStorage
    var data = JSON.parse(localStorage.getItem("product"));
    var sum = 0;
    if (data !== null) {
      var count = 0;
      data.map((data, index) => {
        sum += data.price;
        count = index + 1;
      });
      //We change the state with the sum and quantity of products
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

      countProduct(result, "All Products");
    } catch (err) {
      console.log(err);
    }
  };

  //function to save the products in the database
  async function saveProduct(e) {
    e.preventDefault();
    //we get the image data
    const file = textImage.file;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      //we made a POST request to cloudinary to save the image
      const result = await axios.post(CLOUDINARY_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress(e) {
          //we calculate the image loading progress
          const progress = (e.loaded * 100) / e.total;
          //we save the state and progress of the image
          setNameImage({
            name: textImage.name,
            progress
          });
          if (progress === 100) {
            //we reset the values
            setNameImage({ name: "Select Image", file: [], progress: 0 });
          }
        }
      });

      //we create the json object with the product data to save it in the database
      const dataJson = {
        urlPhotoProduct: result.data.url,
        nameProduct: form.nameProduct,
        price: form.price,
        description: form.description,
        category: form.category
      };
      //We carry out the POST request to send the product data
      const saveMongo = await axios.post(
        "https://marketplace-api.herokuapp.com/api/products",
        dataJson,
        {
          headers: {
            "Content-Type": "application/json; charset=utf-8"
          }
        }
      );
      //we change the alert status
      setAlert({
        show: true,
        status: saveMongo.data.status,
        message: saveMongo.data.message
      });
      //we change the state of the form to clear the fields
      setForm({
        nameProduct: "",
        price: "",
        category: "",
        description: ""
      });
      //we get the products to update the view
      getProducts();
    } catch (err) {
      console.log(err);
    }
  }

  //function to count the quantity of products registered in the base
  const countProduct = (r, category) => {
    //validate if there are products
    if (r.data.products.length > 0) {
      r.data.products.map((data, index) => {
        setFilter({
          count: index + 1,
          filter: category
        });
      });
    } else {
      setFilter({
        count: 0,
        filter: "All Products"
      });
    }
  };

  //function to remove the product from the cart
  function removeProduct(productId) {
    // strore products in local storage
    let storageProducts = JSON.parse(localStorage.getItem("product"));
    //all the different id are searched in storage to only save those that will not be deleted
    let products = storageProducts.filter(product => product.id !== productId);

    //all products are stored in the localStorage
    localStorage.setItem("product", JSON.stringify(products));

    //cart products are counted
    countCart();

    //the modal closes
    setShowCart(false);
  }

  //function to execute a function when starting the application
  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div>
      {/** NavBar start */}
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
      {/** end of NavBar */}

      {/** Banner start */}
      {showBanner ? (
        <Carousel>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://www.aceturtle.com/wp-content/uploads/2019/10/Info-sheet-Web-Stores-VS-Marketplaces_Banner.png"
              alt="slide"
            />
            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://merchant.razer.com/v3/wp-content/uploads/2015/03/manage-marketplace-banner.jpg"
              alt="slide"
            />

            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100"
              src="https://www.indusnet.co.in/images/mo_developmentTabBanner.png"
              alt="slide"
            />

            <Carousel.Caption></Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      ) : null}

      {/** Banner end */}

      {/** Filter start */}
      <div className="select-content ">
        <div className="select-content-text">
          <h2>{filter.filter}</h2>
          <p>
            <span>(</span>
            {filter.count} Product(s)<span>)</span>
          </p>
        </div>
        <div className="input-group mb-3 col-sm-3">
          <select
            className="custom-select"
            id="inputGroupSelect01"
            onChange={selectCategory}
          >
            <option value="0">Choose...</option>
            <option value="Technology">Technology</option>
            <option value="Home Appliances">Home Appliances</option>
            <option value="Home">Home</option>
            <option value="Clothing">Clothing</option>
            <option value="Health Beauty">Health Beauty</option>
            <option value="Beauty">Beauty</option>
            <option value="Toy Store">Toy Store</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
      </div>
      {/** Filter end */}

      {/** Start of the Card with the product */}
      <div className="content">
        <CardProduct data={data.products} open={openDetail} action={addCart} />
      </div>
      {/** end of the Card with the product */}

      {/** Modal start to register the product */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Product Registration</Modal.Title>
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
            <ProgressBar now={textImage.progress} />
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
                  <option value="Home Appliances">Home Appliances</option>
                  <option value="Home">Home</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Health Beauty">Health Beauty</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Toy Store">Toy Store</option>
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
      {/** End of the Modal to register the product */}

      {/** start of the modal to show the shopping cart */}
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
      {/** end of the modal to show the shopping cart */}

      {/** start of modal to show product detail */}
      <Modal
        centered
        show={showDetailProduct}
        onHide={handleDetailProductClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Detail Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="content-detail">
            <div className="content-image">
              <img src={detail.urlPhotoProduct} />
            </div>
            <div className="content-info">
              <h3>{detail.nameProduct}</h3>
              <p className="subtitle-cart">{detail.category}</p>
              <p>Price: ${detail.price}</p>
              <p>{detail.description}</p>
              <div className="content-footer"></div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-dark" onClick={e => addCart(detail, e)}>
            <img
              width={20}
              height={20}
              className="mr-3"
              src="../img/shopping-cart.png"
              alt="Generic placeholder"
            />
            Add
          </Button>
        </Modal.Footer>
      </Modal>
      {/** end of modal to show product detail */}

      {/** Start button to add a new product */}
      <div className="xyz">
        <button
          onClick={handleShow}
          type="button"
          className="btn btn-dark btn-circle btn-xl"
        >
          <i className="material-icons">add</i>
        </button>
      </div>
      {/** end of the button to add a new product */}
    </div>
  );
}

export default App;
