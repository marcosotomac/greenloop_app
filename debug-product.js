// Test para debuggear el problema de creación de productos
console.log("=== DEBUGGING PRODUCT CREATION ===");

// Simulamos el objeto Product que se está enviando desde el frontend
const frontendProduct = {
  productName: "Test Product",
  description: "This is a test product description with at least 10 characters",
  imageUrl: "https://via.placeholder.com/300x200.jpg",
  category: "ELECTRONICS",
  condition: "NEW",
  availableForExchange: true,
  exchangePreferences: "Looking for books or other electronics",
  estimatedValue: 50.0,
};

console.log(
  "Frontend Product Object:",
  JSON.stringify(frontendProduct, null, 2)
);

// Verificar tipos de datos
console.log("\n=== TYPE CHECKING ===");
console.log("productName type:", typeof frontendProduct.productName);
console.log("description type:", typeof frontendProduct.description);
console.log("imageUrl type:", typeof frontendProduct.imageUrl);
console.log("category type:", typeof frontendProduct.category);
console.log("condition type:", typeof frontendProduct.condition);
console.log(
  "availableForExchange type:",
  typeof frontendProduct.availableForExchange
);
console.log(
  "exchangePreferences type:",
  typeof frontendProduct.exchangePreferences
);
console.log("estimatedValue type:", typeof frontendProduct.estimatedValue);

// Validaciones básicas
console.log("\n=== VALIDATION CHECKS ===");
console.log("productName length:", frontendProduct.productName.length);
console.log("description length:", frontendProduct.description.length);
console.log(
  "category is valid:",
  [
    "CLOTHING",
    "ACCESSORIES",
    "ELECTRONICS",
    "BOOKS",
    "FURNITURE",
    "TOYS",
    "HOME",
    "SPORTS",
    "INSTRUMENTS",
  ].includes(frontendProduct.category)
);
console.log(
  "condition is valid:",
  ["NEW", "LIKE_NEW", "USED", "REFURBISHED", "OPEN_BOX"].includes(
    frontendProduct.condition
  )
);
console.log(
  "estimatedValue is positive number:",
  frontendProduct.estimatedValue > 0
);

// JSON que se enviará al backend
const jsonPayload = JSON.stringify(frontendProduct);
console.log("\n=== JSON PAYLOAD ===");
console.log("JSON length:", jsonPayload.length);
console.log("JSON payload:", jsonPayload);
