
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Search, RefreshCw, Printer } from "lucide-react";
import { getMyOrders } from "../../api/orderApi";
import type { OrderResponse } from "../../api/orderApi";
import Receipt from "./Receipt";
import "./SalesHistory.css";

interface SalesHistoryProps {
  onBack: () => void;
}

function formatPaymentMethod(method: number): string {
  switch (method) {
    case 1:
      return "Cash";
    case 2:
      return "Card";
    default:
      return "Other";
  }
}

function formatOrderStatus(status: number): string {
  switch (status) {
    case 1:
      return "Pending";
    case 2:
      return "Confirmed";
    case 3:
      return "Processing";
    case 4:
      return "Completed";
    case 5:
      return "Cancelled";
    default:
      return "Unknown";
  }
}

function SalesHistory({ onBack }: SalesHistoryProps) {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] =
    useState<OrderResponse | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const result = await getMyOrders();
      setOrders(result ?? []);
    } catch (err) {
      console.error("Failed to load sales history:", err);
      setError("Unable to load sales history. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders
      .filter((order) =>
        order.orderNumber.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [orders, search]);

  return (
    <main className="sales-history-page">
      <header className="sales-history-header">
        <button
          type="button"
          className="sales-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Back to POS
        </button>

        <div>
          <h1>Sales History</h1>
          <p>Review previous transactions and reprint receipts.</p>
        </div>

        <button
          type="button"
          className="sales-refresh-button"
          onClick={() => void loadOrders()}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>

      <section className="sales-history-card">
        <div className="sales-history-toolbar">
          <div>
            <h2>Transactions</h2>
            <p>{filteredOrders.length} order(s)</p>
          </div>

          <label className="sales-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search order number..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="sales-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void loadOrders()}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="sales-empty">Loading sales history...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="sales-empty">
            {search
              ? "No orders match your search."
              : "No sales found for this account."}
          </div>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Order number</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="sales-order-number">
                      {order.orderNumber}
                    </td>
                    <td>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td>{formatPaymentMethod(order.paymentMethod)}</td>
                    <td>{order.totalAmount.toFixed(2)} SAR</td>
                    <td>
                      <span
                        className={`sales-status sales-status-${order.orderStatus}`}
                      >
                        {formatOrderStatus(order.orderStatus)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sales-receipt-button"
                        onClick={() => setSelectedOrder(order)}
                        title="View and print receipt"
                      >
                        <Printer size={16} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <Receipt
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </main>
  );
}

export default SalesHistory;
