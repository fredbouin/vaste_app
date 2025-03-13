// src/pages/pricing/PriceSheet/components/PriceListTabs.jsx
const PriceListTabs = ({ activeTab, onTabChange }) => (
  <div className="border-b">
    <div className="flex space-x-4">
      <button
        onClick={() => onTabChange('pieces')}
        className={`py-2 px-4 -mb-px ${
          activeTab === 'pieces'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Furniture Pieces
      </button>
      <button
        onClick={() => onTabChange('components')}
        className={`py-2 px-4 -mb-px ${
          activeTab === 'components'
            ? 'border-b-2 border-blue-500 text-blue-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Components
      </button>
    </div>
  </div>
);

export default PriceListTabs;