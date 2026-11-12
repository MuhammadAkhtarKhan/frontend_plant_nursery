
import { useState } from "react";
import "./AdminPanel.css";
import {
  LayoutDashboard,
  Leaf,
  Tags,
  Boxes,
  LogOut,
} from "lucide-react";

type AdminPanelProps = {
  onLogout: () => void;
};

type AdminPage = "dashboard" | "plants" | "categories" | "inventory";

function AdminPanel({ onLogout }: AdminPanelProps) {
  const [currentPage, setCurrentPage] =
    useState<AdminPage>("dashboard");

  const navigation = [
    {
      id: "dashboard" as AdminPage,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "plants" as AdminPage,
      label: "Plants",
      icon: Leaf,
    },
    {
      id: "categories" as AdminPage,
      label: "Categories",
      icon: Tags,
    },
    {
      id: "inventory" as AdminPage,
      label: "Inventory",
      icon: Boxes,
    },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Leaf size={26} />
          <div>
            <h2>Plant Nursery</h2>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="admin-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={
                  currentPage === item.id
                    ? "admin-nav-button active"
                    : "admin-nav-button"
                }
                onClick={() => setCurrentPage(item.id)}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="admin-logout-button"
          onClick={onLogout}
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>
              {navigation.find(
                (item) => item.id === currentPage,
              )?.label}
            </h1>
          </div>

          <span className="admin-role">Administrator</span>
        </header>

        <section className="admin-content">
          {currentPage === "dashboard" && (
            <div className="admin-placeholder">
              <LayoutDashboard size={32} />
              <h2>Admin Dashboard</h2>
              <p>
                Plant inventory and nursery management overview
                will be displayed here.
              </p>
            </div>
          )}

          {currentPage === "plants" && (
            <div className="admin-placeholder">
              <Leaf size={32} />
              <h2>Plants Management</h2>
              <p>
                Manage plants, prices, descriptions, and images.
              </p>
            </div>
          )}

          {currentPage === "categories" && (
            <div className="admin-placeholder">
              <Tags size={32} />
              <h2>Categories Management</h2>
              <p>
                Manage plant categories.
              </p>
            </div>
          )}

          {currentPage === "inventory" && (
            <div className="admin-placeholder">
              <Boxes size={32} />
              <h2>Inventory Management</h2>
              <p>
                Manage stock quantities and low-stock products.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminPanel;
