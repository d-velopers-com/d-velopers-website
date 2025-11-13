export const metadata = {
  title: "D-velopers - Discord",
  description: "Desbloquea tu acceso a Discord con una suscripción a YouTube/Twitch.",
};

export default function DiscordPage() {
  return (
    <div className="w-full" style={{ height: "calc(100vh - 64px)", minHeight: "600px" }}>
      <iframe
        src="/discord/index.html"
        className="w-full h-full"
        style={{ border: "none", display: "block" }}
        title="Discord landing"
      />
    </div>
  );
}

