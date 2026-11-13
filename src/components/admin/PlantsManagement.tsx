
import { useEffect, useState } from "react";
import { Search, Plus, RefreshCw } from "lucide-react";
import { getPlants } from "../../api/plantApi";
import type { Plant } from "../../types/plant";
import "./PlantsManagement.css";
import PlantForm from "./PlantForm";

function PlantsManagement() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function loadPlants() {
    try {
      setLoading(true);
      setError("");

      const data = await getPlants();
      setPlants(data);
    } catch (err) {
      console.error("Failed to load plants:", err);
      setError("Unable to load plants. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlants();
  }, []);

  const filteredPlants = plants.filter((plant) =>
    [
      plant.name,
      plant.categoryName,
      plant.scientificName ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  function handlePlantCreated(plant: Plant) {
  setPlants((current) => [...current, plant]);
  setShowForm(false);
}
if (showForm) {
  return (
    <PlantForm
      onCancel={() => setShowForm(false)}
      onCreated={handlePlantCreated}
    />
  );
}

  return (
    <div className="plants-management">
      <div className="plants-toolbar">
        <div className="plants-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="plants-toolbar-actions">
          <button
            type="button"
            className="plants-refresh-button"
            onClick={loadPlants}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="plants-add-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} />
            Add Plant
          </button>
        </div>
      </div>

      {error && <div className="plants-error">{error}</div>}

      {loading ? (
        <div className="plants-message">Loading plants...</div>
      ) : (
        <div className="plants-table-wrapper">
          <table className="plants-table">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredPlants.map((plant) => {
                const primaryImage =
                  plant.images?.find((image) => image.isPrimary) ??
                  plant.images?.[0];

                return (
                  <tr key={plant.id}>
                    <td>
                      <div className="plants-product-cell">
                        {primaryImage ? (
                          <img
                            src={primaryImage.imageUrl}
                            alt={plant.name}
                            className="plants-product-image"
                          />
                        ) : (
                          <div className="plants-image-placeholder">
                            <span>🌱</span>
                          </div>
                        )}

                        <div>
                          <strong>{plant.name}</strong>
                          <small>
                            {plant.scientificName || "No scientific name"}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{plant.categoryName}</td>

                    <td>
                      {plant.price.toFixed(2)}
                    </td>

                    <td>{plant.stockQuantity}</td>

                    <td>
                      <span
                        className={
                          plant.isActive
                            ? "plants-status active"
                            : "plants-status inactive"
                        }
                      >
                        {plant.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredPlants.length === 0 && (
                <tr>
                  <td colSpan={5} className="plants-empty">
                    {searchTerm
                      ? "No plants match your search."
                      : "No plants found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="plants-results">
        Showing {filteredPlants.length} of {plants.length} plants
      </div>
    </div>
  );
}

export default PlantsManagement;
