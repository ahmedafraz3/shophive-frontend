const Message = ({ type = "error", message }) => {
  const styles = {
    error: "bg-red-50 text-red-700 border-l-4 border-red-500",
    success: "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500",
    info: "bg-[#fdf7e2] text-[#7a6427] border-l-4 border-[#c9a84c]",
  };

  const icons = {
    error: "✕",
    success: "✓",
    info: "ℹ",
  };

  return (
    <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-3 ${styles[type]}`}>
      <span className="font-bold text-base">{icons[type]}</span>
      <span>{message}</span>
    </div>
  );
};

export default Message;