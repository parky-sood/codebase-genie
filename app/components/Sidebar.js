export default function Sidebar({ namespaces, selectedNamespace, onSelect }) {
  const getRepoName = (url) => {
    if (!url) {
      return "";
    }
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  return (
    <div className="w-64 h-full bg-emerald-500/15 p-6">
      <div className="flex items-center gap-3 mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Repositories</h2>
      </div>

      <ul className="space-y-3">
        {namespaces.map((ns) => (
          <li
            key={ns}
            className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all
              ${
                selectedNamespace === ns
                  ? "bg-emerald-500 text-white"
                  : "hover:bg-emerald-500/40 text-gray-800"
              }`}
            onClick={() => onSelect(ns)}
          >
            <span className="font-medium">{getRepoName(ns)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
