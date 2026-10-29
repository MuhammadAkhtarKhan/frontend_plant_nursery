
import { useEffect, useMemo, useState } from "react";
import {
    ArrowLeft,
    Banknote,
    CreditCard,
    RefreshCw,
    ShoppingCart,
    TrendingUp,
} from "lucide-react";
import { getMyOrders } from "../../api/orderApi";
import type { OrderResponse } from "../../api/orderApi";
import "./SalesDashboard.css";

interface SalesDashboardProps {
    onBack: () => void;
}

const currency = new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
});

function SalesDashboard({ onBack }: SalesDashboardProps) {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dateFilter, setDateFilter] = useState<"today" | "7days" | "month" | "all">("today");
    const [searchTerm, setSearchTerm] = useState("");
    async function loadOrders() {
        setLoading(true);
        setError("");

        try {
            const result = await getMyOrders();
            setOrders(result ?? []);
        } catch (err) {
            console.error("Failed to load dashboard:", err);
            setError("Unable to load sales data. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadOrders();
    }, []);


    const stats = useMemo(() => {
        const now = new Date();

        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        const startDate = new Date(startOfToday);

        if (dateFilter === "7days") {
            startDate.setDate(startDate.getDate() - 6);
        } else if (dateFilter === "month") {
            startDate.setDate(1);
        }

        const filteredOrders = orders.filter((order) => {
            if (order.orderStatus === 5) return false;
            if (dateFilter === "all") return true;
            if (!order.createdAt) return false;

            const orderDate = new Date(order.createdAt);

            if (Number.isNaN(orderDate.getTime())) return false;

            if (dateFilter === "today") {
                return orderDate >= startOfToday && orderDate <= now;
            }

            return orderDate >= startDate && orderDate <= now;
        });

        return {
            total: filteredOrders.reduce(
                (sum, order) => sum + Number(order.totalAmount || 0),
                0,
            ),
            count: filteredOrders.length,
            cash: filteredOrders
                .filter((order) => order.paymentMethod === 1)
                .reduce(
                    (sum, order) => sum + Number(order.totalAmount || 0),
                    0,
                ),
            card: filteredOrders
                .filter((order) => order.paymentMethod === 2)
                .reduce(
                    (sum, order) => sum + Number(order.totalAmount || 0),
                    0,
                ),
            recent: [...filteredOrders]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt ?? 0).getTime() -
                        new Date(a.createdAt ?? 0).getTime(),
                )
        };
    }, [orders, dateFilter]);
    const displayedOrders = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) {
            return stats.recent;
        }

        return stats.recent.filter((order) =>
            order.orderNumber.toLowerCase().includes(search),
        );
    }, [stats.recent, searchTerm]);

    if (loading) {
        return <main className="dashboard-page">Loading dashboard...</main>;
    }

    return (
        <main className="dashboard-page">

            <header className="dashboard-header">
                <button
                    type="button"
                    className="dashboard-back-button"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    Back to POS
                </button>

                <div className="dashboard-heading">
                    <h1>Sales Dashboard</h1>
                    <p>Today's sales performance</p>
                </div>
                <div className="dashboard-date-filter">
                    <label htmlFor="sales-date-filter">Sales period:</label>

                    <select
                        id="sales-date-filter"
                        value={dateFilter}
                        onChange={(event) =>
                            setDateFilter(
                                event.target.value as
                                | "today"
                                | "7days"
                                | "month"
                                | "all",
                            )
                        }
                    >
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="month">This Month</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
                <button
                    type="button"
                    className="dashboard-refresh-button"
                    onClick={() => void loadOrders()}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </header>

            {error && (
                <div className="dashboard-error" role="alert">
                    {error}
                    <button type="button" onClick={() => void loadOrders()}>
                        Retry
                    </button>
                </div>
            )}

            {!error && (
                <>
                    <section className="dashboard-stats">
                        <article className="dashboard-stat-card">
                            <TrendingUp size={24} />
                            <p>Today's Sales</p>
                            <h2>{currency.format(stats.total)}</h2>
                        </article>

                        <article className="dashboard-stat-card">
                            <ShoppingCart size={24} />
                            <p>Transactions</p>
                            <h2>{stats.count}</h2>
                        </article>

                        <article className="dashboard-stat-card">
                            <Banknote size={24} />
                            <p>Cash Sales</p>
                            <h2>{currency.format(stats.cash)}</h2>
                        </article>

                        <article className="dashboard-stat-card">
                            <CreditCard size={24} />
                            <p>Card Sales</p>
                            <h2>{currency.format(stats.card)}</h2>
                        </article>
                    </section>

                    <section className="dashboard-recent-card">
                        <h2>Today's Recent Transactions</h2>

                        {displayedOrders.length === 0 ? (
                            <p className="dashboard-empty">
                                No sales recorded today.
                            </p>
                        ) : (
                            <div className="dashboard-table-wrapper">
                                <div className="dashboard-search">
                                    <input
                                        type="search"
                                        placeholder="Search by order number..."
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        aria-label="Search transactions by order number"
                                    />
                                </div>
                                <table className="dashboard-table">
                                    <thead>
                                        <tr>
                                            <th>Order</th>
                                            <th>Time</th>
                                            <th>Payment</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedOrders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.orderNumber}</td>
                                                <td>
                                                    {order.createdAt
                                                        ? new Date(order.createdAt).toLocaleTimeString()
                                                        : "—"}
                                                </td>
                                                <td>
                                                    {order.paymentMethod === 1 ? "Cash" : "Card"}
                                                </td>
                                                <td>{currency.format(order.totalAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}

export default SalesDashboard;
