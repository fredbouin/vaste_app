
const ModelInput = ({ modelNumber, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      Model Number
    </label>
    <input 
      type="text"
      placeholder="e.g. 110"
      value={modelNumber}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
    />
    <p className="mt-1 text-sm text-gray-500">
      Enter 3-digit model number (e.g., 110 means Collection 100, Piece 10)
    </p>
  </div>
);

export default ModelInput;