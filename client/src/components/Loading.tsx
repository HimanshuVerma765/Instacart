const Loading = () => {
  return (
    <div className="flex-center min-h-95 h-full w-full p-6">
      <div className="w-full max-w-sm space-y-4" aria-label="Loading">
        <div className="h-4 w-2/5 rounded-full animate-shimmer" />
        <div className="h-32 w-full rounded-2xl animate-shimmer" />
        <div className="h-4 w-4/5 rounded-full animate-shimmer" />
        <div className="h-4 w-3/5 rounded-full animate-shimmer" />
      </div>
    </div>
  );
};

export default Loading;
