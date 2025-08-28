import { Pencil, Trash2 } from 'lucide-react';

const ComponentList = ({ 
  components, 
  selectedComponents, 
  onSelect, 
  onEdit, 
  onDelete 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Saved Components
    </label>
    <div className="space-y-2">
      {components.map(component => {
        const isSelected = (selectedComponents || []).includes(component.id);
        
        return (
          <div key={component.id} 
               onClick={() => onSelect(component.id, isSelected)}
               className={`flex items-center justify-between p-3 border rounded-lg 
                 ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500'} 
                 cursor-pointer`}
          >
            <div>
              <div className="font-medium">{component.name}</div>
              <div className="text-sm text-gray-500">{component.type}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => onEdit(component, e)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => onDelete(component.id, e)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className={`px-3 py-1 text-sm rounded-md
                ${isSelected 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'}`}>
                {isSelected ? 'Selected' : 'Select'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default ComponentList;