
export default function StatCard({ label, value }) {
  return (
    <div className="bg-bg-panel p-4 rounded-xl text-center shadow-md">
      <p className="text-2xl font-bold text-orange-400">{value}</p>
      <p className="text-gray-400">{label}</p>
    </div>
  );
}
