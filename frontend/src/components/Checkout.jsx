import React from "react";

function Checkout({ userData, setIsbn, setPage, checkoutItems }) {
    return(
    <>
    <div className="checkout">
        <h2 id="header">Checkout</h2>
        <h2 class="user_credits">Your Credits: {userData.credits}</h2>
        <h2 class="grand_total">Grand Total: 100</h2>
    </div>
    </>
    );
}

export default Checkout;
