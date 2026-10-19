
import { useRef } from "react";
import { Printer, X, Leaf } from "lucide-react";
import type { OrderResponse } from "../../api/orderApi";
import "./Receipt.css";

interface ReceiptProps {
  order: OrderResponse;
  onClose: () => void;
}

function Receipt({ order, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const paymentMethod =
    order.paymentMethod === 1
      ? "Cash"
      : order.paymentMethod === 2
        ? "Card"
        : "Other";

  return (
    <div className="receipt-overlay">
      <section className="receipt-modal">
        <div className="receipt-actions">
          <h2>Sale completed</h2>

          <button
            type="button"
            className="receipt-close"
            onClick={onClose}
            aria-label="Close receipt"
          >
            <X size={20} />
          </button>
        </div>

        <div className="receipt-paper" ref={receiptRef}>
          <header className="receipt-header">
            <Leaf size={28} />
            <h1>Plant Nursery</h1>
            <p>Thank you for your purchase!</p>
          </header>

          <div className="receipt-meta">
            <p>
              <span>Order No.</span>
              <strong>{order.orderNumber}</strong>
            </p>
            <p>
              <span>Date</span>
              <strong>{orderDate}</strong>
            </p>
            <p>
              <span>Payment</span>
              <strong>{paymentMethod}</strong>
            </p>
          </div>

          <table className="receipt-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.plantName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unitPrice.toFixed(2)}</td>
                  <td>{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-total">
            <span>Grand Total</span>
            <strong>{order.totalAmount.toFixed(2)} SAR</strong>
          </div>

          <footer className="receipt-footer">
            <p>Please keep this receipt for your records.</p>
            <p>Thank you for supporting our nursery.</p>
          </footer>
        </div>

        <div className="receipt-bottom-actions">
          <button
            type="button"
            className="receipt-print-button"
            onClick={handlePrint}
          >
            <Printer size={18} />
            Print receipt
          </button>

          <button
            type="button"
            className="receipt-done-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

export default Receipt;
