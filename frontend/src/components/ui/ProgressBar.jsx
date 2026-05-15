const ProgressBar = ({ value = 0, tone = "leaf" }) => {
  const colors = {
    leaf: "bg-leaf-500",
    petal: "bg-petal-500",
    tide: "bg-tide-600",
    nectar: "bg-nectar",
  };

  return (
    <div className="h-2 w-full overflow-hidden bg-leaf-50" style={{ borderRadius: 8 }}>
      <div
        className={`h-full ${colors[tone] || colors.leaf} transition-all duration-500`}
        style={{ width: `${Math.min(Math.max(Number(value) || 0, 0), 100)}%` }}
      />
    </div>
  );
};

export default ProgressBar;
