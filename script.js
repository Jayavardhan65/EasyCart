
document.addEventListener("DOMContentLoaded", () => {
  console.log("JavaScript loaded successfully!");

  
  const cartButtons = document.querySelectorAll(".product button");
  cartButtons.forEach(button => {
      button.addEventListener("click", (event) => {
          let productName = event.target.parentElement.querySelector("h3").innerText;
          let productPrice = event.target.parentElement.querySelector("p").innerText;
          
          alert(`Added "${productName}" to cart for ${productPrice}`);
      });
  });

 
  document.querySelectorAll("nav ul li a").forEach(link => {
      link.addEventListener("click", function(event) {
          if (this.getAttribute("href").startsWith("#")) {
              event.preventDefault();
              let targetSection = document.querySelector(this.getAttribute("href"));
              targetSection.scrollIntoView({ behavior: "smooth" });
          }
      });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  console.log("JavaScript loaded successfully!");

  // Handle "Add to Cart" buttons
  const cartButtons = document.querySelectorAll(".add-to-cart");
  cartButtons.forEach(button => {
      button.addEventListener("click", (event) => {
          let productElement = event.target.parentElement;
          let productName = productElement.querySelector("h3").innerText;
          let productPrice = productElement.querySelector("p").innerText;
          let productImage = productElement.querySelector("img").src;

          let product = {
              name: productName,
              price: productPrice,
              image: productImage
          };

          // Store cart in localStorage
          let cart = JSON.parse(localStorage.getItem("cart")) || [];
          cart.push(product);
          localStorage.setItem("cart", JSON.stringify(cart));

          alert(`Added "${productName}" to cart!`);
      });
  });
});