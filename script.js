document.addEventListener("DOMContentLoaded", () => {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      categoryCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");

      const category = card.dataset.category;
      console.log("Selected category:", category);
    });
  });

  const menuButton = document.getElementById("menuButton");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      menuButton.classList.toggle("active");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuButton.classList.remove("active");
      });
    });
  }

 document.querySelectorAll(".heart-btn").forEach((button) => {
  // Restore favorite state when page loads
  const card = button.closest(".dish-card");
  const dishName = card?.querySelector("h3")?.textContent.trim();
  const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

  if (dishName && favorites.includes(dishName)) {
    button.classList.add("active");
    const icon = button.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
    }
  }

  // Click handler
  button.addEventListener("click", () => {
    button.classList.toggle("active");

    const icon = button.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
    }

    // ===== SAVE FAVORITE =====
    if (!dishName) return;

    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (button.classList.contains("active")) {
      // Add to favorites
      if (!favorites.includes(dishName)) {
        favorites.push(dishName);
      }
    } else {
      // Remove from favorites
      favorites = favorites.filter(name => name !== dishName);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    console.log("Favorites updated:", favorites);
  });
});

  document.querySelectorAll(".qty-control").forEach((control) => {
    const quantity = control.querySelector(".qty");
    const minusButton = control.querySelector(".minus");
    const plusButton = control.querySelector(".plus");

    minusButton?.addEventListener("click", () => {
      const currentQuantity = Number(quantity?.textContent) || 1;
      if (quantity) quantity.textContent = String(Math.max(1, currentQuantity - 1));
    });

    plusButton?.addEventListener("click", () => {
      const currentQuantity = Number(quantity?.textContent) || 1;
      if (quantity) quantity.textContent = String(currentQuantity + 1);
    });
  });

 document.querySelectorAll(".add-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".dish-card");
    if (!card) return;

    // Get dish details
    const itemName = card.querySelector("h3")?.textContent.trim() || "Dish";
    const qtyEl = card.querySelector(".qty");
    const qty = Number(qtyEl?.textContent) || 1;
    const image = card.querySelector(".dish-img img");
    const imageSource = image?.getAttribute("src") || "";
    const imageAlt = image?.getAttribute("alt") || itemName;

    // Try different possible price selectors
    let priceText = card.querySelector(".price")?.textContent || 
                    card.querySelector(".item-price")?.textContent ||
                    card.querySelector("p")?.textContent || "0";

    const price = Number(priceText.replace(/[^0-9.]/g, "")) || 0;

    const cartSidebar = document.querySelector(".cart-sidebar");
    if (!cartSidebar) {
      console.log("Cart sidebar not found");
      return;
    }

    // Check if item already exists in cart
    let existingItem = null;
    cartSidebar.querySelectorAll(".cart-item").forEach((item) => {
      const name = item.querySelector("h4, .item-name, h3")?.textContent.trim();
      if (name === itemName) {
        existingItem = item;
      }
    });

    if (existingItem) {
      // Increase quantity if item already exists
      const qtySpan = existingItem.querySelector(".cart-qty span, .qty");
      if (qtySpan) {
        qtySpan.textContent = Number(qtySpan.textContent) + qty;
      }
    } else {
      // Create new cart item
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.innerHTML = `
        <img src="${imageSource}" alt="${imageAlt}">
        <div class="cart-item-info">
          <h4 class="item-name">${itemName}</h4>
          <p class="item-price">₦${price.toLocaleString()}</p>
          <div class="cart-qty">
            <button class="minus">-</button>
            <span>${qty}</span>
            <button class="plus">+</button>
          </div>
        </div>
        <div class="item-total" style="font-weight:600;">₦${(price * qty).toLocaleString()}</div>
      `;

      // Try to append to .cart-items, otherwise directly to sidebar
      const container = cartSidebar.querySelector(".cart-items") || cartSidebar;
      container.appendChild(cartItem);
    }

    // Update totals
    if (typeof updateCartSummary === "function") {
      updateCartSummary();
    }

    // Button feedback
    const originalHTML = button.innerHTML;
    button.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
    button.style.background = "#28a745";

    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.style.background = "";
    }, 1200);

    console.log(`${itemName} added to cart (${qty})`);
  });
});

  const cart = document.querySelector(".cart");
  const cartSidebar = document.querySelector(".cart-sidebar");
  const checkoutButton = document.querySelector(".checkout-btn");

  const updateCartSummary = () => {
    if (!cartSidebar) return;

    let subtotal = 0;
    cartSidebar.querySelectorAll(".cart-item").forEach((item) => {
      const price = Number(item.querySelector(".item-price")?.textContent.replace(/[^0-9.]/g, "")) || 0;
      const quantity = Number(item.querySelector(".cart-qty span")?.textContent) || 0;
      const itemTotal = price * quantity;
      subtotal += itemTotal;

      const totalElement = item.lastElementChild;
      if (totalElement) totalElement.textContent = `₦${itemTotal.toLocaleString()}`;
    });

    const deliveryFee = subtotal > 0 ? 1500 : 0;
    const summaryRows = cartSidebar.querySelectorAll(".summary-row span:last-child");
    if (summaryRows[0]) summaryRows[0].textContent = `₦${subtotal.toLocaleString()}`;
    if (summaryRows[1]) summaryRows[1].textContent = `₦${deliveryFee.toLocaleString()}`;
    if (summaryRows[2]) summaryRows[2].textContent = `₦${(subtotal + deliveryFee).toLocaleString()}`;

    const cartHeader = cartSidebar.querySelector(".cart-header span");
    const itemCount = [...cartSidebar.querySelectorAll(".cart-qty span")]
      .reduce((total, quantity) => total + (Number(quantity.textContent) || 0), 0);
    if (cartHeader) cartHeader.textContent = `Your Cart (${itemCount})`;
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = String(itemCount);
  };

  cart?.addEventListener("click", () => {
    cartSidebar?.scrollIntoView({ behavior: "smooth", block: "center" });
    cartSidebar?.classList.add("highlight");
    setTimeout(() => cartSidebar?.classList.remove("highlight"), 900);
  });

  cartSidebar?.addEventListener("click", (event) => {
    const button = event.target.closest(".cart-qty button");
    if (!button) return;

    const quantity = button.closest(".cart-qty")?.querySelector("span");
    if (!quantity) return;

    const currentQuantity = Number(quantity.textContent) || 0;
    const change = button.classList.contains("minus") ? -1 : 1;
    quantity.textContent = String(Math.max(0, currentQuantity + change));
    updateCartSummary();
  });

  cartSidebar?.querySelector(".fa-trash")?.addEventListener("click", () => {
    cartSidebar.querySelectorAll(".cart-item").forEach((item) => item.remove());
    updateCartSummary();
  });

  checkoutButton?.addEventListener("click", () => {
    const total = cartSidebar?.querySelector(".summary-row.total span:last-child")?.textContent;
    const itemCount = [...(cartSidebar?.querySelectorAll(".cart-qty span") || [])]
      .reduce((count, quantity) => count + (Number(quantity.textContent) || 0), 0);

    if (!itemCount) {
      alert("Your cart is empty.");
      return;
    }

    alert(`Thank you for your order! Your total is ${total}.`);
  });

  updateCartSummary();

  const viewMenuButton = document.querySelector(".watch-button");
  const menuSection = document.querySelector("#menu");

  viewMenuButton?.addEventListener("click", () => {
    menuSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const learnMoreButton = document.querySelector(".learn-btn");
  const aboutText = document.querySelector(".about-text");

  learnMoreButton?.addEventListener("click", () => {
    const existingDetails = aboutText?.querySelector(".about-details");

    if (!aboutText) return;

    if (existingDetails) {
      existingDetails.remove();
      learnMoreButton.textContent = "Learn More";
      return;
    }

    const details = document.createElement("p");
    details.className = "about-details";
    details.textContent = "From classic favorites to satisfying new flavors, every meal is prepared fresh and delivered with care by our kitchen team.";
    aboutText.insertBefore(details, learnMoreButton);
    learnMoreButton.textContent = "Show Less";
  });

  const newsletterForm = document.querySelector("#newsletterForm");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailInput = newsletterForm.querySelector("input[type='email']");
      const email = emailInput?.value.trim();

      if (!email) {
        alert("Please enter your email address.");
        return;
      }

      alert(`Thanks! ${email} has been subscribed.`);
      newsletterForm.reset();
    });
  }

  const searchInput = document.querySelector(".search-box input");
  const searchButton = document.querySelector(".search-box button");

  if (searchInput) {
    const filterDishes = () => {
      const term = searchInput.value.trim().toLowerCase();

      document.querySelectorAll(".dish-card").forEach((card) => {
        const dishName = card.querySelector("h3")?.textContent.toLowerCase() || "";
        card.style.display = dishName.includes(term) ? "" : "none";
      });
    };

    searchInput.addEventListener("input", filterDishes);
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        filterDishes();
        document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    searchButton?.addEventListener("click", () => {
      filterDishes();
      document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});















































