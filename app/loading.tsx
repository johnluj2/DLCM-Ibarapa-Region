import LogoLoader from '@/components/LogoLoader';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8" id="app-global-loading">
      <LogoLoader
        size="md"
        text="Deeper Life Bible Church"
        subtext="Loading Ibarapa Regional Hub..."
      />
    </div>
  );
}
