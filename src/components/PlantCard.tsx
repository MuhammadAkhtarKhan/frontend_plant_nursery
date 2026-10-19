
// import type { Plant } from "../types/plant";

// interface PlantCardProps {
//   plant: Plant;
//   onAdd: (plant: Plant) => void;
// }

// export default function PlantCard({ plant, onAdd }: PlantCardProps) {
//   const outOfStock =
//     plant.stockQuantity !== undefined && plant.stockQuantity <= 0;

//   return (
//     <article className="plant-card">
//       <div className="plant-image">
//         {plant.imageUrl ? (
//           <img src={plant.imageUrl} alt={plant.name} />
//         ) : (
//           <span className="plant-placeholder">🌿</span>
//         )}
//       </div>

//       <div className="plant-card-content">
//         <span className="plant-category">
//           {plant.categoryName ?? "Plant"}
//         </span>

//         <h3>{plant.name}</h3>

//         {plant.sku && (
//           <p className="plant-sku">SKU: {plant.sku}</p>
//         )}

//         <div className="plant-card-footer">
//           <strong>
//             {plant.price.toLocaleString("en-SA", {
//               style: "currency",
//               currency: "SAR",
//             })}
//           </strong>

//           <button
//             className="add-button"
//             disabled={outOfStock}
//             onClick={() => onAdd(plant)}
//           >
//             {outOfStock ? "Out of stock" : "+ Add"}
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// }
