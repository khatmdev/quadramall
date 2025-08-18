const ViewToggle = ({ view = 'grid', onChange }: { view?: 'grid' | 'list', onChange?: (v: 'grid' | 'list') => void }) => (
  <div className="flex items-center gap-2">
    <button
      className={`flex items-center justify-center p-2 border rounded-xl transition-colors focus:outline-none duration-150 shadow-sm ${view === 'grid' ? 'bg-green-900 border-green-900' : 'bg-white border-gray-200 hover:bg-gray-100'} `}
      style={{ width: 36, height: 36 }}
      title="Grid view"
      aria-label="Grid view"
      onClick={() => onChange && onChange('grid')}
    >
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="4" width="6" height="6" rx="1.5" fill={view === 'grid' ? '#fff' : '#E5E7EB'} />
        <rect x="14" y="4" width="6" height="6" rx="1.5" fill={view === 'grid' ? '#fff' : '#E5E7EB'} />
        <rect x="14" y="14" width="6" height="6" rx="1.5" fill={view === 'grid' ? '#fff' : '#E5E7EB'} />
        <rect x="4" y="14" width="6" height="6" rx="1.5" fill={view === 'grid' ? '#fff' : '#E5E7EB'} />
      </svg>
    </button>
    <button
      className={`flex items-center justify-center p-2 border rounded-xl transition-colors focus:outline-none duration-150 shadow-sm ${view === 'list' ? 'bg-green-900 border-green-900' : 'bg-white border-gray-200 hover:bg-gray-100'} `}
      style={{ width: 36, height: 36 }}
      title="List view"
      aria-label="List view"
      onClick={() => onChange && onChange('list')}
    >
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="6" width="16" height="3" rx="1.5" fill={view === 'list' ? '#fff' : '#E5E7EB'} />
        <rect x="4" y="11" width="16" height="3" rx="1.5" fill={view === 'list' ? '#fff' : '#E5E7EB'} />
        <rect x="4" y="16" width="16" height="3" rx="1.5" fill={view === 'list' ? '#fff' : '#E5E7EB'} />
      </svg>
    </button>
  </div>
);

export default ViewToggle;
