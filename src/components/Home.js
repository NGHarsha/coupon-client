import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Form, Dropdown, DropdownButton } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const Coupon = ({ coupon }) => {
  return (
    <div className="coupon">
      <p className="coupon__name">{coupon.code.toUpperCase()}</p>
      {coupon.type === "Flat" && (
        <p>
          Flat <span className="coupon__minimum">{coupon.flatAmount}</span>{" "}
          offer on minimum cart value of{" "}
          <span className="coupon__minimum">{coupon.minimum}</span>
        </p>
      )}
      {coupon.type === "Percentage" && (
        <p>
          <span className="coupon__minimum">{coupon.percentage}</span> % offer
          on minimum cart value of{" "}
          <span className="coupon__minimum">{coupon.minimum}</span> upto{" "}
          <span className="coupon__minimum">{coupon.percentMaxLimit}</span>
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <p className="mute">From {coupon.start.split("T")[0]}</p>
        <p className="mute">Expires on {coupon.end.split("T")[0]}</p>
      </div>
    </div>
  );
};

const Home = () => {
  const [coupons, setCoupons] = useState([]);
  const [couponType, setCouponType] = useState("Coupon Type");

  const [formData, setFormData] = useState({
    code: "",
    flatAmount: "",
    percentage: "",
    percentMaxLimit: "",
    minimum: "",
    start: "",
    end: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [validateForm, setValidateForm] = useState({
    code: "",
    cartValue: "",
  });
  const [validateFormErrors, setValidateFormErrors] = useState({});

  const validateCoupon = async (event) => {
    event.preventDefault();
    const { code, cartValue } = validateForm;
    let errors = {};
    if (!code || code === "") errors.code = "Code cannot be empty";
    if (!cartValue || cartValue < 0)
      errors.minimum = "Please enter a valid number";
    if (Object.keys(errors).length === 0) {
      try {
        let res = await axios.post(
          "https://coupon-server-end.herokuapp.com/api/coupon/validate",
          validateForm
        );

        toast.success(
          `Hurray!!! You will get a discount of ${res.data.discount} RS`
        );
      } catch (err) {
        toast.error(err.response.data.message);
      }
    }
    setValidateFormErrors(errors);
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const checkData = () => {
    const { code, type, start, end, minimum } = formData;

    let formErrors = {};

    if (!code || code === "") formErrors.code = "Code cannot be empty";
    if (!type || type === "Coupon Type")
      formErrors.type = "Select a coupon type";
    if (!minimum || minimum < 0)
      formErrors.minimum = "Please enter a valid number";

    if (type === "Flat") {
      const { flatAmount } = formData;
      if (!flatAmount || flatAmount < 0)
        formErrors.flatAmount = "Please enter a valid number";
    } else if (type === "Percentage") {
      const { percentage, percentMaxLimit } = formData;
      if (!percentage || percentage < 0 || percentage > 100)
        formErrors.percentage = "Percentage should be in range of 0 and 100";
      if (!percentMaxLimit || percentMaxLimit < 0)
        formErrors.percentMaxLimit = "Please enter a valid number";
    }

    if (!start) formErrors.start = "Select a start date";
    if (!end) formErrors.end = "Select a end date";

    return formErrors;
  };

  const createCoupon = async (event) => {
    event.preventDefault();
    const errors = checkData();
    if (Object.keys(errors).length === 0) {
      try {
        let res = await axios.post(
          "https://coupon-server-end.herokuapp.com/api/coupon/create",
          {
            ...formData,
            start: new Date(formData.start).toISOString(),
            end: new Date(formData.end).toISOString(),
          }
        );
        setFormData({
          code: "",
          flatAmount: "",
          percentage: "",
          percentMaxLimit: "",
          minimum: "",
          start: "",
          end: "",
        });
        toast.success(`Coupon created Successfully`);
        getCoupons();
      } catch (err) {
        toast.error(err.response.data.message);
      }
    }
    setFormErrors(errors);
  };

  const getCoupons = useCallback(async () => {
    const res = await axios.get(
      "https://coupon-server-end.herokuapp.com/api/coupon/list"
    );

    setCoupons(res.data.data);
  }, []);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);

  return (
    <div style={{ margin: "2rem 20rem" }}>
      <div
        style={{
          display: "flex",
          marginBottom: "2rem",
          height: "30vh",
        }}
      >
        <div className="child firstChild">
          <div>
            <h3>Validate Coupon</h3>
            <Form onSubmit={validateCoupon}>
              <Form.Control
                type="number"
                placeholder="Minimum cart value"
                value={validateForm.cartValue}
                onChange={(e) =>
                  setValidateForm({
                    ...validateForm,
                    cartValue: e.target.value,
                  })
                }
                isInvalid={validateFormErrors.cartValue}
              />
              <Form.Control.Feedback type="invalid">
                {validateFormErrors.code}
              </Form.Control.Feedback>
              <br />
              <Form.Control
                type="text"
                placeholder="Coupon Code"
                value={validateForm.code}
                onChange={(e) =>
                  setValidateForm({ ...validateForm, code: e.target.value })
                }
                isInvalid={validateFormErrors.code}
              />
              <Form.Control.Feedback type="invalid">
                {validateFormErrors.code}
              </Form.Control.Feedback>
              <br />
              <Button type="submit">Validate</Button>
            </Form>
            <ToastContainer autoClose={false} />
          </div>
        </div>
        <div className="child couponsdiv">
          <h3>Available Coupons</h3>
          {coupons.length > 0 &&
            coupons.map((coupon) => {
              return <Coupon key={coupon._id} coupon={coupon} />;
            })}
        </div>
      </div>
      <div className="creatediv">
        <h3>Create Coupon</h3>
        <Form onSubmit={createCoupon}>
          <Form.Control
            type="text"
            placeholder="Coupon Code"
            value={formData.code}
            onChange={(e) => handleChange("code", e.target.value)}
            isInvalid={formErrors.code}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.code}
          </Form.Control.Feedback>
          <br />
          <DropdownButton title={couponType}>
            <Dropdown.Item
              onClick={(e) => {
                setCouponType(e.target.textContent);
                handleChange("type", e.target.textContent);
              }}
            >
              Flat
            </Dropdown.Item>
            <Dropdown.Item
              onClick={(e) => {
                setCouponType(e.target.textContent);
                handleChange("type", e.target.textContent);
              }}
            >
              Percentage
            </Dropdown.Item>
          </DropdownButton>

          <br />
          {couponType === "Flat" && (
            <>
              {" "}
              <Form.Control
                type="number"
                placeholder="Flat Amount"
                value={formData.flatAmount}
                onChange={(e) => handleChange("flatAmount", e.target.value)}
                isInvalid={formErrors.flatAmount}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.flatAmount}
              </Form.Control.Feedback>
            </>
          )}
          {couponType === "Percentage" && (
            <>
              <Form.Control
                type="number"
                placeholder="Percentage"
                value={formData.percentage}
                onChange={(e) => handleChange("percentage", e.target.value)}
                isInvalid={formErrors.percentage}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.percentage}
              </Form.Control.Feedback>
              <br />
            </>
          )}
          {couponType === "Percentage" && (
            <>
              <Form.Control
                type="number"
                placeholder="Max discount"
                value={formData.percentMaxLimit}
                onChange={(e) =>
                  handleChange("percentMaxLimit", e.target.value)
                }
                isInvalid={formErrors.percentMaxLimit}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.percentMaxLimit}
              </Form.Control.Feedback>
            </>
          )}
          <br />
          <Form.Control
            type="number"
            placeholder="Minimum cart value"
            value={formData.minimum}
            onChange={(e) => handleChange("minimum", e.target.value)}
            isInvalid={formErrors.minimum}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.minimum}
          </Form.Control.Feedback>
          <br />
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={formData.start}
            onChange={(e) => handleChange("start", e.target.value)}
            isInvalid={formErrors.start}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.start}
          </Form.Control.Feedback>
          <br />
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={formData.end}
            onChange={(e) => handleChange("end", e.target.value)}
            isInvalid={formErrors.end}
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.end}
          </Form.Control.Feedback>
          <br />
          <Button type="submit">Create</Button>
        </Form>
      </div>
    </div>
  );
};

export default Home;
