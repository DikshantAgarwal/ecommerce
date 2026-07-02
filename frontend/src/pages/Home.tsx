import { useProducts } from '../hooks/useProducts';

export default function Home() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) {
    return <div className="p-8 text-gray-500">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load products. Make sure the backend is running.
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {data && data.results?.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <ul className="space-y-2">
          {data?.results?.map((product) => (
            <li
              key={product.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                ${parseFloat(product.price).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
