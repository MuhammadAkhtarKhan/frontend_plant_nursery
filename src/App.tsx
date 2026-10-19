
import { useEffect, useMemo, useState } from "react";
import { createPosOrder } from "./api/orderApi";
import Login from "./pages/Login";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Leaf,
  CreditCard,
  Banknote,
  Sprout,
  Receipt,
} from "lucide-react";
import { getPlants } from "./api/plantApi";
import type { Plant as ApiPlant } from "./types/plant";
import "./App.css";

type Plant = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

type CartItem = {
  plant: Plant;
  quantity: number;
};

function PosApp() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<1 | 2>(1);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  // Load plants from the ASP.NET Core API.
  useEffect(() => {
    let isMounted = true;

    async function loadPlants() {
      try {
        setLoading(true);
        setError("");

        const apiPlants: ApiPlant[] = await getPlants();

        const mappedPlants: Plant[] = apiPlants.map((plant) => {
          const primaryImage =
            plant.images?.find((image) => image.isPrimary) ??
            plant.images?.[0];

          return {
            id: plant.id,
            name: plant.name,
            category: plant.categoryName || "Other",
            price: plant.price,
            stock: plant.stockQuantity,
            image: primaryImage?.imageUrl || "",
          };
        });

        if (isMounted) {
          setPlants(mappedPlants);
        }
      } catch (err) {
        console.error("Failed to load plants:", err);

        if (isMounted) {
          setError(
            "Could not load plants. Check your API URL, cashier login, and JWT token.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlants();

    return () => {
      isMounted = false;
    };
  }, []);

  // Build category filters from the API data.
  const categories = useMemo(
    () => ["All", ...new Set(plants.map((plant) => plant.category))],
    [plants],
  );

  // Filter products by name and category.
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch = plant.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());

      const matchesCategory =
        category === "All" || plant.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [plants, search, category]);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const totalAmount = cart.reduce(
    (total, item) => total + item.plant.price * item.quantity,
    0,
  );

  // Add a plant without exceeding available stock.
  function addToCart(plant: Plant) {
    if (plant.stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.plant.id === plant.id,
      );

      if (existing) {
        if (existing.quantity >= plant.stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item.plant.id === plant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { plant, quantity: 1 }];
    });
  }

  // Increase or decrease a cart item's quantity.
  function changeQuantity(plantId: string, amount: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.plant.id !== plantId) {
            return item;
          }

          return {
            ...item,
            quantity: Math.min(
              item.plant.stock,
              item.quantity + amount,
            ),
          };
        })
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(plantId: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.plant.id !== plantId),
    );
  }

  
async function handleCheckout() {
  if (cart.length === 0 || checkoutLoading) {
    return;
  }

  setCheckoutError("");
  setCheckoutSuccess("");
  setCheckoutLoading(true);

  try {
    const order = await createPosOrder({
      paymentMethod,
      items: cart.map((item) => ({
        plantId: item.plant.id,
        quantity: item.quantity
      })),
    });

    setCheckoutSuccess(
      `Sale completed successfully. Order: ${order.orderNumber}`
    );

    // Clear the cart only after the API succeeds.
    setCart([]);

    // Refresh stock from the backend after the sale.
    const updatedPlants = await getPlants();

    setPlants(
      updatedPlants.map((plant) => {
        const primaryImage =
          plant.images?.find((image) => image.isPrimary) ??
          plant.images?.[0];

        return {
          id: plant.id,
          name: plant.name,
          category: plant.categoryName || "Other",
          price: plant.price,
          stock: plant.stockQuantity,
          image: primaryImage?.imageUrl || "",
        };
      }),
    );
  } catch (err) {
    console.error("Checkout failed:", err);

    if (typeof err === "object" && err !== null && "response" in err) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };

      setCheckoutError(
        apiError.response?.data?.message ??
          "The sale could not be completed. Please check stock and try again.",
      );
    } else {
      setCheckoutError(
        "Could not reach the server. Check your connection and try again.",
      );
    }
  } finally {
    setCheckoutLoading(false);
  }
}


  return (
    <div className="pos-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Sprout size={25} />
          </div>

          <div>
            <h1>Plant Nursery</h1>
            <p>Point of Sale</p>
          </div>
        </div>

        <div className="cashier-info">
          <span className="status-dot" />
          <div>
            <strong>Cashier Workspace</strong>
            <p>POS Terminal</p>
          </div>
        </div>
      </header>

      <main className="pos-layout">
        <section className="products-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INVENTORY</p>
              <h2>Choose your plants</h2>
              <p className="muted">
                Search and add plants to the current sale.
              </p>
            </div>

            <div className="product-count">
              <Leaf size={17} />
              {loading ? "Loading..." : `${filteredPlants.length} products`}
            </div>
          </div>

          <div className="search-box">
            <Search size={20} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plants by name..."
              aria-label="Search plants"
            />
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={
                  category === item
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-products">
              <Leaf size={30} />
              <h3>Loading plants</h3>
              <p>Fetching your inventory from the server...</p>
            </div>
          ) : error ? (
            <div className="empty-products">
              <h3>Unable to load plants</h3>
              <p>{error}</p>
              <button
                className="add-button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {filteredPlants.map((plant) => {
                  const cartItem = cart.find(
                    (item) => item.plant.id === plant.id,
                  );

                  const soldQuantity = cartItem?.quantity ?? 0;
                  const outOfStock = soldQuantity >= plant.stock;

                  return (
                    <article className="product-card" key={plant.id}>
                      <div className="product-image">
                        {plant.image ? (
                          <img
                            src={plant.image}
                            alt={plant.name}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="empty-image">
                            <Leaf size={32} />
                          </div>
                        )}

                        <span className="category-tag">
                          {plant.category}
                        </span>
                      </div>

                      <div className="product-info">
                        <h3>{plant.name}</h3>

                        <p className="stock-text">
                          {Math.max(0, plant.stock - soldQuantity)} in stock
                        </p>

                        <div className="product-footer">
                          <strong className="price">
                            SAR {plant.price.toFixed(2)}
                          </strong>

                          <button
                            className="add-button"
                            disabled={outOfStock || plant.stock <= 0}
                            onClick={() => addToCart(plant)}
                            aria-label={`Add ${plant.name} to cart`}
                          >
                            <Plus size={17} />
                            {plant.stock <= 0 ? "Out of stock" : "Add"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {filteredPlants.length === 0 && (
                <div className="empty-products">
                  <Leaf size={30} />
                  <h3>No plants found</h3>
                  <p>Try a different search or category.</p>
                </div>
              )}
            </>
          )}
        </section>

        <aside className="cart-panel">
          <div className="cart-heading">
            <div className="cart-title">
              <div className="cart-icon">
                <ShoppingCart size={21} />
              </div>

              <div>
                <h2>Current Sale</h2>
                <p>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </p>
              </div>
            </div>

            <span className="sale-label">NEW SALE</span>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <ShoppingCart size={29} />
                </div>

                <h3>Your cart is empty</h3>
                <p>Select a plant to start a sale.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.plant.id}>
                  {item.plant.image ? (
                    <img src={item.plant.image} alt={item.plant.name} />
                  ) : (
                    <div className="empty-image">
                      <Leaf size={20} />
                    </div>
                  )}

                  <div className="cart-item-details">
                    <h4>{item.plant.name}</h4>
                    <p>SAR {item.plant.price.toFixed(2)} each</p>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          changeQuantity(item.plant.id, -1)
                        }
                        aria-label={`Decrease ${item.plant.name} quantity`}
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          changeQuantity(item.plant.id, 1)
                        }
                        disabled={item.quantity >= item.plant.stock}
                        aria-label={`Increase ${item.plant.name} quantity`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-end">
                    <strong>
                      SAR{" "}
                      {(item.plant.price * item.quantity).toFixed(2)}
                    </strong>

                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(item.plant.id)}
                      aria-label={`Remove ${item.plant.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="checkout-section">
            <h3>Payment method</h3>

            <div className="payment-options">
              <button
                className={
                  paymentMethod === 1
                    ? "payment-option selected"
                    : "payment-option"
                }
                onClick={() => setPaymentMethod(1)}
              >
                <Banknote size={20} />
                <span>Cash</span>
              </button>

              <button
                className={
                  paymentMethod === 2
                    ? "payment-option selected"
                    : "payment-option"
                }
                onClick={() => setPaymentMethod(2)}
              >
                <CreditCard size={20} />
                <span>Card</span>
              </button>
            </div>

            <div className="summary-row">
              <span>Items</span>
              <span>{totalItems}</span>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>
              <strong>SAR {totalAmount.toFixed(2)}</strong>
            </div>

            <button
              className="checkout-button"
              disabled={cart.length === 0 || loading || Boolean(error)}
              onClick={handleCheckout}
            >
              <Receipt size={19} />
              Complete Sale
            </button>

            <p className="checkout-note">
              <Leaf size={14} />
              Inventory is updated by the server when a sale succeeds.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}


function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");

    try {
      const roles: string[] = JSON.parse(
        localStorage.getItem("roles") || "[]",
      );

      return Boolean(
        token &&
        roles.some((role) => role.toLowerCase() === "cashier"),
      );
    } catch {
      return false;
    }
  });

  function handleLogin(token: string, roles: string[]) {
    localStorage.setItem("token", token);
    localStorage.setItem("roles", JSON.stringify(roles));
    setAuthenticated(true);
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <PosApp />;
}

export default App;

