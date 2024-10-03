

// Function to display products on the page
function displayProducts(products) {
    const productsContainer = document.getElementById("product-list");
    productsContainer.innerHTML = ""; // Clear existing products
  
    if (!products.length) {
      productsContainer.innerHTML = "<p>No products found.</p>";
    } else {
      products.forEach((product) => {
        const imageUrl = `http://localhost:5148${product.image}`;
        productsContainer.innerHTML += `
                  <div class="col-md-4 col-xs-6 product-item">
                      <div class="product">
                          <div class="product-img">
                              <img src="${imageUrl}" alt="${
          product.name
        }" class="card-img-top">
                              <div class="product-overlay">
                                  <button class="add-to-cart-btn" onclick="addToCart(${
                                    product.productId
                                  }, '${product.name}', ${
          product.price
        }, '${imageUrl}')">
                                      <i class="fa fa-shopping-cart"></i> add to cart
                                  </button>
                              </div>
                          </div>
                          <div class="product-body">
                              <p class="product-category">${
                                product.category
                                  ? product.category.name
                                  : "Uncategorized"
                              }</p>
                              <h3 class="product-name"><a href="#" onclick="redirectToProductDetail(${
                                product.productId
                              })">${product.name}</a></h3>
                              <h4 class="product-price">${product.price.toFixed(
                                2
                              )} JD</h4>
                          </div>
                      </div>
                  </div>
              `;
      });
    }
  }
  









//function to display products for certian category
document.addEventListener("DOMContentLoaded", function () {
  const categoryId = localStorage.getItem("selectedCategoryId");
  if (categoryId) {
    fetchProductsByCategory(categoryId);
  }
});

function fetchProductsByCategory(categoryId) {
  fetch(`http://localhost:5148/api/Products/ByCategory/${categoryId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    })
    .then((products) => {
      const productsContainer = document.getElementById("product-list");
      productsContainer.innerHTML = ""; // Clear previous products
      if (products.length === 0) {
        productsContainer.innerHTML =
          "<p>No products found for this category.</p>";
      } else {
        products.forEach((product) => {
          const imageUrl = `http://localhost:5148${product.image}`;
          productsContainer.innerHTML += `
                        <div class="col-md-4 col-xs-6 product-item">
                            <div class="product">
                                <div class="product-img">
                                    <img src="${imageUrl}" alt="${
            product.name
          }" class="card-img-top">
                                    <div class="product-overlay">
                                        <button class="add-to-cart-btn" onclick="addToCart(${
                                          product.productId
                                        }, '${product.name}', ${
            product.price
          }, '${imageUrl}')">
                                            <i class="fa fa-shopping-cart"></i> add to cart
                                        </button>
                                    </div>
                                </div>
                                <div class="product-body">
                                    <p class="product-category">${
                                      product.category
                                        ? product.category.name
                                        : "Uncategorized"
                                    }</p>
                                   <h3 class="product-name"><a href="#" onclick="redirectToProductDetail(${
                                     product.productId
                                   })">${product.name}</a></h3>
                                    <h4 class="product-price">${product.price.toFixed(
                                      2
                                    )} JD</h4>
                                </div>
                            </div>
                        </div>
                    `;
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching products by category:", error);
      productsContainer.innerHTML = "<p>Error loading products.</p>";
    });
}

// Fetch categories with product counts for filtering
fetch("http://localhost:5148/api/Categories/categories-with-product-count")
  .then((response) => response.json())
  .then((categories) => {
    const categoriesContainer = document.getElementById("category-filter");
    categoriesContainer.innerHTML = "";
    categories.forEach((category) => {
      categoriesContainer.innerHTML += `
                <div class="input-checkbox">
                    <input type="checkbox" id="category-${category.categoryId}" data-category-id="${category.categoryId}">
                    <label for="category-${category.categoryId}">
                        <span></span>
                        ${category.name} <small>(${category.productCount})</small>
                    </label>
                </div>
            `;
    });

    // Attach event listeners for filter checkboxes
    document.querySelectorAll(".input-checkbox input").forEach((checkbox) => {
      checkbox.addEventListener("change", filterProducts);
    });
  })
  .catch((error) =>
    console.error("Error fetching categories with counts:", error)
  );

// Function to filter products based on checked categories
function filterProducts() {
  const selectedCategories = Array.from(
    document.querySelectorAll(".input-checkbox input:checked")
  ).map((cb) => parseInt(cb.dataset.categoryId));

  fetch("http://localhost:5148/api/products")
    .then((response) => response.json())
    .then((allProducts) => {
      const filteredProducts =
        selectedCategories.length > 0
          ? allProducts.filter((product) =>
              selectedCategories.includes(product.categoryId)
            )
          : allProducts;
      displayProducts(filteredProducts);
    })
    .catch((error) => console.error("Error fetching products:", error));
}

// Function to add products to the cart
function addToCart(productId, name, price, imageUrl) {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    Swal.fire("You must be logged in to add items to the cart.", "", "error");
    return;
  }

  const cartData = {
    ProductId: productId,
    UserId: parseInt(userId),
    Quantity: 1,
  };

  fetch("http://localhost:5148/api/Cart/CreateNewCartItem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cartData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to add item to cart.");
      return response.json();
    })
    .then((data) => {
      Swal.fire(data.msg || "Item added to cart successfully!", "", "success");
      updateCartCount();
    })
    .catch((error) => {
      console.error("Error adding item to cart:", error);
      Swal.fire("Failed to add item to cart.", error.message, "error");
    });
}

// Function to update the cart count
function updateCartCount() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  fetch(`http://localhost:5148/api/Cart/GetCartItemCount/${userId}`)
    .then((response) => response.json())
    .then((count) => {
      const cartCountElement = document.querySelector(".cart-icon .qty");
      if (cartCountElement) {
        cartCountElement.textContent = count; // Update the displayed count
      }
    })
    .catch((error) => console.error("Error fetching cart count:", error));
}

// Initial fetch of products
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount(); // Update the cart count on page load
});




// Redirect function
function redirectToProductDetail(productId) {
  localStorage.setItem("selectedProductId", productId); // Storing product ID in localStorage
  window.location.href = "/product detail/product-detail.html"; // Redirect to the detail page
}





function updatePriceInput(value) {
  document.getElementById('price-max').value = value;
}

function filterByPrice() {
  const minPrice = document.getElementById('price-min').value;
  const maxPrice = document.getElementById('price-max').value;

  fetch("http://localhost:5148/api/products")
    .then(response => response.json())
    .then(allProducts => {
      const filteredProducts = allProducts.filter(product =>
        product.price >= parseFloat(minPrice) && product.price <= parseFloat(maxPrice)
      );
      displayProducts(filteredProducts);
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      displayProducts([]); // Clear or show error message in product display area
    });
}

// Adjusted displayProducts function as before
function displayProducts(products) {
  const productsContainer = document.getElementById("product-list");
  productsContainer.innerHTML = "";

  if (!products.length) {
    productsContainer.innerHTML = "<p>No products found within this price range.</p>";
    return;
  }

  products.forEach(product => {
    const imageUrl = `http://localhost:5148${product.image}`;
    productsContainer.innerHTML += `
      <div class="col-md-4 col-xs-6 product-item">
          <div class="product">
              <div class="product-img">
                  <img src="${imageUrl}" alt="${product.name}" class="card-img-top">
                  <div class="product-overlay">
                      <button class="add-to-cart-btn" onclick="addToCart(${product.productId}, '${product.name}', ${product.price}, '${imageUrl}')">
                          <i class="fa fa-shopping-cart"></i> add to cart
                      </button>
                  </div>
              </div>
              <div class="product-body">
                  <h3 class="product-name"><a href="#" onclick="redirectToProductDetail(${product.productId})">${product.name}</a></h3>
                  <h4 class="product-price">${product.price.toFixed(2)} JD</h4>
              </div>
          </div>
      </div>`;
  });
}
