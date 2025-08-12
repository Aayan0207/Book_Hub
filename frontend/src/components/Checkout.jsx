import React, { useState, useEffect } from "react";

function Checkout({ userData, setIsbn, setPage, checkoutItems }) {
  const [checkoutItemsData, setCheckoutItemsData] = useState({});
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (!showCart) return;
    setPage("cart");
  }, [showCart]);

  useEffect(() => {
    if (!checkoutItems) return;
    checkoutItems.forEach(item => {
        
    }) 
  }, [checkoutItems]);
  return (
    <>
      <div className="checkout">
        <h2 id="header">Checkout</h2>
        <h2 class="user_credits">Your Credits: {userData.credits}</h2>
        <h2 class="grand_total">Grand Total: {total}</h2>
        <hr />
        <div
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="submit"
            className="btn btn-success"
            value="Purchase"
            id="purchase_button"
            disabled={userData.credits >= total}
          />
          <input
            type="reset"
            className="btn btn-danger"
            value="Cancel"
            id="cancel_purchase_button"
            onClick={() => setShowCart(true)}
          />
        </div>
        <h3>Purchasing the following items:</h3>
      </div>
    </>
  );
}

export default Checkout;
