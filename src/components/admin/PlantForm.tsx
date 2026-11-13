
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getCategories } from "../../api/categoryApi";
import { createPlant } from "../../api/plantApi";
import "./PlantForm.css";
import type {
  Category,
  CreatePlantImageRequest,
  Plant,
  PlantRequest,
} from "../../types/plant";

type PlantFormProps = {
  onCancel: () => void;
  onCreated: (plant: Plant) => void;
};

function PlantForm({ onCancel, onCreated }: PlantFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [scientificName, setScientificName] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [sunlightRequirement, setSunlightRequirement] = useState("");
  const [wateringFrequency, setWateringFrequency] = useState("");
  const [size, setSize] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [images, setImages] = useState<CreatePlantImageRequest[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        const activeCategories = data.filter(
          (category) => category.isActive
        );

        setCategories(activeCategories);

        if (activeCategories.length > 0) {
          setCategoryId(activeCategories[0].id);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Unable to load categories.");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function addImage() {
    const url = newImageUrl.trim();

    if (!url) {
      return;
    }

    try {
      const parsedUrl = new URL(url);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        setError("Image URL must start with http:// or https://.");
        return;
      }
    } catch {
      setError("Please enter a valid image URL.");
      return;
    }

    setError("");

    setImages((current) => [
      ...current,
      {
        imageUrl: url,
        isPrimary: current.length === 0,
      },
    ]);

    setNewImageUrl("");
  }

  function removeImage(index: number) {
    setImages((current) => {
      const updated = current.filter((_, i) => i !== index);

      if (current[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }

      return updated;
    });
  }

  function setPrimaryImage(index: number) {
    setImages((current) =>
      current.map((image, i) => ({
        ...image,
        isPrimary: i === index,
      }))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stockQuantity);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setError("Stock quantity must be a whole number of zero or more.");
      return;
    }

    const request: PlantRequest = {
      name: name.trim(),
      description: description.trim() || null,
      price: numericPrice,
      stockQuantity: numericStock,
      scientificName: scientificName.trim() || null,
      careInstructions: careInstructions.trim() || null,
      sunlightRequirement: sunlightRequirement.trim() || null,
      wateringFrequency: wateringFrequency.trim() || null,
      size: size.trim() || null,
      categoryId,
      images,
    };

    try {
      setSaving(true);

      const createdPlant = await createPlant(request);
      onCreated(createdPlant);
    } catch (err) {
      console.error("Failed to create plant:", err);
      setError("Unable to create plant. Please check the information and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="plant-form-container">
      <div className="plant-form-heading">
        <div>
          <h2>Add New Plant</h2>
          <p>Enter the plant details below.</p>
        </div>

        <button
          type="button"
          className="plant-form-cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      {error && <div className="plant-form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="plant-form-grid">
          <div className="plant-form-field">
            <label htmlFor="plant-name">Plant Name *</label>
            <input
              id="plant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={200}
              required
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-category">Category *</label>
            <select
              id="plant-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories || categories.length === 0}
            >
              {categories.length === 0 && (
                <option value="">No active categories available</option>
              )}

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-price">Price *</label>
            <input
              id="plant-price"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-stock">Stock Quantity *</label>
            <input
              id="plant-stock"
              type="number"
              min="0"
              step="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-scientific-name">Scientific Name</label>
            <input
              id="plant-scientific-name"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-size">Size</label>
            <input
              id="plant-size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              maxLength={100}
              placeholder="e.g. Small, Medium, Large"
            />
          </div>

          <div className="plant-form-field plant-form-full">
            <label htmlFor="plant-description">Description</label>
            <textarea
              id="plant-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-sunlight">Sunlight Requirement</label>
            <input
              id="plant-sunlight"
              value={sunlightRequirement}
              onChange={(e) => setSunlightRequirement(e.target.value)}
              maxLength={200}
              placeholder="e.g. Indirect sunlight"
            />
          </div>

          <div className="plant-form-field">
            <label htmlFor="plant-watering">Watering Frequency</label>
            <input
              id="plant-watering"
              value={wateringFrequency}
              onChange={(e) => setWateringFrequency(e.target.value)}
              maxLength={200}
              placeholder="e.g. Twice a week"
            />
          </div>

          <div className="plant-form-field plant-form-full">
            <label htmlFor="plant-care">Care Instructions</label>
            <textarea
              id="plant-care"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>
        </div>

        <div className="plant-images-section">
          <h3>Plant Images</h3>
          <p>Add image URLs and choose one primary image.</p>

          <div className="plant-image-add">
            <input
              type="url"
              placeholder="https://example.com/plant.jpg"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
            />

            <button
              type="button"
              onClick={addImage}
              disabled={!newImageUrl.trim()}
            >
              <Plus size={17} />
              Add Image
            </button>
          </div>

          {images.map((image, index) => (
            <div className="plant-image-item" key={`${image.imageUrl}-${index}`}>
              <img src={image.imageUrl} alt={`Plant ${index + 1}`} />

              <span title={image.imageUrl}>
                {image.imageUrl}
              </span>

              <label>
                <input
                  type="radio"
                  name="primaryPlantImage"
                  checked={image.isPrimary}
                  onChange={() => setPrimaryImage(index)}
                />
                Primary
              </label>

              <button
                type="button"
                className="plant-image-remove"
                onClick={() => removeImage(index)}
                aria-label="Remove image"
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>

        <div className="plant-form-actions">
          <button
            type="button"
            className="plant-form-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="plant-form-submit"
            disabled={saving || loadingCategories || categories.length === 0}
          >
            {saving ? "Saving..." : "Save Plant"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlantForm;
