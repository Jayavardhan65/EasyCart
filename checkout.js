document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const checkoutTotal = document.getElementById("checkout-total");

  // Calculate total price
  let total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace(/[^\d.]/g, "")), 0);
  checkoutTotal.innerHTML = `&#8377;${total.toFixed(2)}`;

  // Handle checkout form submission
  document.getElementById("checkout-form").addEventListener("submit", (event) => {
      event.preventDefault();

      let name = document.getElementById("name").value.trim();
      let email = document.getElementById("email").value.trim();
      let address = document.getElementById("address").value.trim();
      let payment = document.getElementById("payment").value;

      // Validate inputs
      if (!name || !email || !address || !payment) {
          alert("Please fill in all details!");
          return;
      }

      // Email format validation
      if (!/\S+@\S+\.\S+/.test(email)) {
          alert("Please enter a valid email address!");
          return;
      }

      // Simulate sending order details to backend (Replace with actual API call)
      let orderDetails = {
          name,
          email,
          address,
          payment,
          cart,
          total
      };

      console.log("Order Placed:", orderDetails); // Debugging log

      // Simulated order confirmation
      alert(`Thank you, ${name}! Your order of ₹${total.toFixed(2)} has been placed successfully.`);

      // Clear cart after order
      localStorage.removeItem("cart");

      // Redirect to homepage or order confirmation page
      window.location.href = "index.html";
  });
});
