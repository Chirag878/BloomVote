const variants = {
  primary: "bg-ink text-white shadow-petal hover:bg-petal-700",
  secondary: "bg-white/80 text-ink border border-leaf-100 hover:border-leaf-300 hover:bg-leaf-50",
  ghost: "bg-transparent text-moss hover:bg-white/70 hover:text-ink",
  danger: "bg-petal-700 text-white hover:bg-ink",
};

const Button = ({
  children,
  variant = "primary",
  className = "",
  icon: Icon,
  disabled,
  ...props
}) => (
  <button
    className={`inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    style={{ borderRadius: 8 }}
    disabled={disabled}
    {...props}
  >
    {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
    <span className="truncate">{children}</span>
  </button>
);

export default Button;
