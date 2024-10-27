export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-[color:var(--color-hubspot)] hover:bg-[color:var(--color-hubspot-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

