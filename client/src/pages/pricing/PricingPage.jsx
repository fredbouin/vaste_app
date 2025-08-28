import FurniturePricingCalculator from './features/calculator/components/FurniturePricingCalculator';

const PricingPage = () => {
  
  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Furniture Pricing Calculator</h1>
        <FurniturePricingCalculator />
      </div>
    </div>
  );
};

export default PricingPage;