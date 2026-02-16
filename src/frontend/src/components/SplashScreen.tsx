export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative w-full max-w-4xl px-8 animate-in fade-in duration-700">
        <img
          src="./assets/generated/omnistream-splash.dim_1920x1080.jpg"
          alt="OmniStream"
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent rounded-2xl" />
      </div>
    </div>
  );
}
