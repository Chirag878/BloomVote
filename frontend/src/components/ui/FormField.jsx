const FormField = ({
  label,
  error,
  as = "input",
  className = "",
  children,
  ...props
}) => {
  const Component = as;

  return (
    <label className="block">
      <span className="label">{label}</span>
      {children || <Component className={`field mt-2 ${className}`} {...props} />}
      {error ? <span className="mt-2 block text-sm font-semibold text-petal-700">{error}</span> : null}
    </label>
  );
};

export default FormField;
