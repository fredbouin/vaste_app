const TimelineRow = ({
  operation,
  startDay,
  duration,
  operationColor,
  assignedEmployees = [],
  onDragStart,
  onSelect
}) => {
  return (
    <div className="flex items-center mt-2">
      <div className="w-48 flex-shrink-0 font-medium flex items-center">
        <span className="ml-4">{operation}</span>
      </div>
      
      <div className="flex">
        {Array.from({ length: startDay }, (_, i) => (
          <div key={`space-${i}`} className="w-12 flex-shrink-0"></div>
        ))}
        
        <div 
          className={`h-8 ${operationColor} rounded relative cursor-move 
            transition-colors hover:brightness-90 transition-all duration-200 group`}
          style={{
            width: `${duration * 3}rem`,
            touchAction: 'none',
            position: 'relative'
          }}
          onMouseDown={onDragStart}
        >
          {/* Menu button */}
          <button
            className="absolute right-0 top-0 w-8 h-full opacity-0 group-hover:opacity-100 
              hover:bg-black/10 rounded-r flex items-center justify-center transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <svg 
              className="w-4 h-4 text-white/90" 
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <circle cx="8" cy="4" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
            </svg>
          </button>

          {/* Employee count */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 px-1 rounded text-sm">
            {assignedEmployees.length > 0 && (
              <span>{assignedEmployees.length} 👥</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineRow;