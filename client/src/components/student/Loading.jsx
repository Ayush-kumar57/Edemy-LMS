import Footer from '../../components/student/Footer';
const Loading = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-50/50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>

          <h1 className="text-xl font-semibold text-slate-700 animate-pulse tracking-wide font-outfit">
            Loading Course Details...
          </h1>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Loading;
