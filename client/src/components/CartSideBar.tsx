import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingBagIcon, XIcon } from "lucide-react";

const CartSideBar = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "₹";

  const {
    items,
    updateQuantity,
    removeFromCart,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const deliveryFee = cartTotal > 1500 ? 0 : 250;
  const grandTotal = cartTotal + deliveryFee;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-fade">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="size-5" />

            <h2 className="text-lg font-medium">Your Cart</h2>

            <span className="px-2 py-0.5 text-xs font-semibold bg-app-cream rounded-full">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl hover:bg-app-cream transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingBagIcon className="size-12 text-app-orange mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900">
              Your cart is empty
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Add items to see them here.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="flex items-center gap-3 rounded-2xl border border-app-border p-3"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="size-14 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                    {item.product.name}
                  </p>
                  <p className="text-sm font-semibold text-app-orange mt-1">
                    {currency}
                    {(item.product.price * item.quantity).toFixed(1)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity - 1)
                    }
                    className="size-7 rounded-full border border-app-border"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.quantity + 1)
                    }
                    className="size-7 rounded-full border border-app-border"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSideBar;
