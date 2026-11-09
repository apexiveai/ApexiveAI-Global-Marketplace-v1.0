export default function JewelryVideoPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#10141b]">
      <div className="border-b border-white/[0.08] px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Product video</h2>
      </div>
      <video
        controls
        preload="metadata"
        className="aspect-video w-full bg-black"
        aria-label={`${title} product video`}
      >
        <source src={src} />
        Your browser does not support embedded videos.
      </video>
    </section>
  );
}
