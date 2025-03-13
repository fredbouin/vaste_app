const TimelineModeToggle = ({ mode, onModeChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm font-medium">Mode:</span>
    <button
      onClick={() => onModeChange('sequential')}
      className={`px-3 py-1 text-sm rounded-l-md ${
        mode === 'sequential' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      Sequential
    </button>
    <button
      onClick={() => onModeChange('flexible')}
      className={`px-3 py-1 text-sm rounded-r-md ${
        mode === 'flexible' 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      Flexible
    </button>
  </div>
);

export default TimelineModeToggle;