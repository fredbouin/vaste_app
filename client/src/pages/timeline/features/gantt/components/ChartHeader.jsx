import TimelineModeToggle from './TimelineModeToggle';

const ChartHeader = ({ timelineMode, onModeChange }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold">Production Timeline</h3>
      <TimelineModeToggle 
        mode={timelineMode}
        onModeChange={onModeChange}
      />
    </div>
  );
};

export default ChartHeader;