const StatCard = ({ label, value, helper, icon: Icon, tone = "leaf" }) => {
  const tones = {
    leaf: "bg-leaf-50 text-leaf-700",
    petal: "bg-petal-50 text-petal-700",
    tide: "bg-tide-50 text-tide-600",
    nectar: "bg-[#fff8e7] text-[#9a6a13]",
  };

  return (
    <div className="petal-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-ink">{value ?? 0}</p>
          {helper ? <p className="mt-2 text-sm text-moss">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`grid h-11 w-11 shrink-0 place-items-center ${tones[tone]}`} style={{ borderRadius: 8 }}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
