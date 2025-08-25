const Sidebar = ({ items, activeItem, onItemClick }) => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen p-4">
      <h2 className="text-xl font-semibold mb-6 text-sidebar-foreground">Navigation</h2>
      <nav>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onItemClick(item.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeItem === item.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;