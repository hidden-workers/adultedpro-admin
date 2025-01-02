const Loader = ({ fit }: { fit?: boolean }) => {
  return (
    <div
      className={`flex items-center justify-center bg-white dark:bg-black ${fit ? 'w-fit h-fit' : 'w-full h-screen '}`}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
