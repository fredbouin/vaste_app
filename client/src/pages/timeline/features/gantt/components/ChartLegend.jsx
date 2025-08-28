
const ChartLegend = ({ operationColors }) => {
  return (
    <div className="mt-6 flex flex-wrap gap-4">
      {Object.entries(operationColors).map(([operation, color]) => (
        <div key={operation} className="flex items-center">
          <div className={`w-4 h-4 ${color} rounded mr-2`}></div>
          <span className="text-sm">{operation}</span>
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;