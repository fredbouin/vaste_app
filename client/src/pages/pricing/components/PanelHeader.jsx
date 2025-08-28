// src/pages/pricing/components/PanelHeader.jsx

const PanelHeader = ({ title, isActive, onClick }) => (
  <div 
    className={`p-4 cursor-pointer border-b transition-colors duration-200 ${
      isActive ? 'bg-blue-100' : 'hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <h3 className="text-lg font-medium">{title}</h3>
  </div>
);

export default PanelHeader;