"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type GuideImage = {
  src: string;
  alt: string;
};

const youtubeContent = {
  name: "YouTube",
  accent: "red",
  subscribeImage: "/discord/youtube-subscribe-step.webp",
  subscribeAlt:
    "Pantalla de suscripción en YouTube con el botón Suscribirse resaltado",
  subscribeTitle: "Hazte miembro en YouTube",
  subscribeDetails: [
    'Busca el botón "Unirme" en el canal',
    "Selecciona el nivel Developer o uno superior",
  ],
  subscribeUrl: "https://www.youtube.com/channel/UCFKZxStYsOVrzdN_FCZ0NGg/join",
  accountNote: "Requiere una cuenta de YouTube",
  connectionImages: [
    {
      src: "/discord/secondStep1.webp",
      alt: "Paso 1: abrir los ajustes de usuario de Discord",
    },
    {
      src: "/discord/secondStep2.webp",
      alt: "Paso 2: seleccionar Conexiones en Discord",
    },
    {
      src: "/discord/secondYoutubeStep3.webp",
      alt: "Paso 3: seleccionar YouTube entre las conexiones",
    },
    {
      src: "/discord/secondStep4.webp",
      alt: "Paso 4: autorizar la conexión con YouTube",
    },
  ],
} as const;

const accentClasses = {
  red: {
    border: "border-red-500/20",
    shadow: "shadow-[0_0_24px_-8px_rgba(239,68,68,0.45)]",
    badge: "from-red-600 to-red-700",
    text: "text-red-400",
    ring: "focus-visible:ring-red-500",
    button: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
    indicator: "bg-red-500",
  },
} as const;

function YouTubeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="#FF0000"
      viewBox="0 0 24 24"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function CheckItem({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm leading-6 text-white/75 sm:text-base">
      <span aria-hidden="true" className={`mt-0.5 font-bold ${color}`}>
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function StepHeading({
  number,
  title,
  gradient,
}: {
  number: number;
  title: string;
  gradient: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-lg ${gradient}`}
      >
        {number}
      </span>
      <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
    </div>
  );
}

function ImageButton({
  image,
  ringClass,
  onOpen,
}: {
  image: GuideImage;
  ringClass: string;
  onOpen: (image: GuideImage) => void;
}) {
  return (
    <button
      aria-label={`Ampliar: ${image.alt}`}
      className={`group relative aspect-video w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131118] ${ringClass}`}
      type="button"
      onClick={() => onOpen(image)}
    >
      <Image
        fill
        alt={image.alt}
        className="object-cover transition duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 100vw, 40vw"
        src={image.src}
      />
      <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        <svg
          aria-hidden="true"
          className="h-10 w-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </span>
    </button>
  );
}

function ImageCarousel({
  images,
  accent,
  onOpen,
}: {
  images: readonly GuideImage[];
  accent: keyof typeof accentClasses;
  onOpen: (image: GuideImage) => void;
}) {
  const [current, setCurrent] = useState(0);
  const colors = accentClasses[accent];
  const image = images[current];

  const move = (direction: number) => {
    setCurrent((value) => (value + direction + images.length) % images.length);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <ImageButton image={image} ringClass={colors.ring} onOpen={onOpen} />
        <button
          aria-label="Captura anterior"
          className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-xl text-white transition hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          type="button"
          onClick={() => move(-1)}
        >
          ‹
        </button>
        <button
          aria-label="Siguiente captura"
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-xl text-white transition hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          type="button"
          onClick={() => move(1)}
        >
          ›
        </button>
      </div>
      <div
        aria-label="Capturas de conexión"
        className="mt-3 flex justify-center gap-2"
        role="group"
      >
        {images.map((item, index) => (
          <button
            key={item.src}
            aria-label={`Mostrar captura ${index + 1}`}
            aria-pressed={current === index}
            className={`h-2.5 rounded-full transition-all ${
              current === index
                ? `w-7 ${colors.indicator}`
                : "w-2.5 bg-white/20 hover:bg-white/40"
            }`}
            type="button"
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-2 text-center text-xs text-white/45">
        Captura {current + 1} de {images.length}
      </p>
    </div>
  );
}

function Lightbox({
  image,
  onClose,
}: {
  image: GuideImage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      aria-label="Vista ampliada"
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center p-4"
      role="dialog"
    >
      <button
        aria-label="Cerrar vista ampliada"
        className="absolute inset-0 h-full w-full cursor-default bg-black/85 backdrop-blur-sm"
        type="button"
        onClick={onClose}
      />
      <div className="relative h-[80vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-[#131118] shadow-2xl">
        <Image
          fill
          priority
          alt={image.alt}
          className="object-contain p-3"
          sizes="100vw"
          src={image.src}
        />
        <button
          aria-label="Cerrar imagen ampliada"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-2xl text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          type="button"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function YouTubeGuide() {
  const [lightboxImage, setLightboxImage] = useState<GuideImage | null>(null);
  const content = youtubeContent;
  const colors = accentClasses[content.accent];
  const cardClasses = `flex flex-col items-center gap-5 rounded-xl border bg-gradient-to-br from-[#131118] to-[#1e1b2a] p-4 sm:p-5 md:flex-row ${colors.border} ${colors.shadow}`;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center">
        <h3
          className={`mb-1.5 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent ${colors.button}`}
        >
          Cómo unirte al Discord con {content.name}
        </h3>
        <p className="text-white/60">Sigue estos pasos para obtener acceso</p>
      </div>

      <article className={cardClasses}>
        <div className="w-full md:w-2/5">
          <ImageButton
            image={{ src: content.subscribeImage, alt: content.subscribeAlt }}
            ringClass={colors.ring}
            onOpen={setLightboxImage}
          />
        </div>
        <div className="w-full flex-1">
          <StepHeading
            gradient={colors.badge}
            number={1}
            title={content.subscribeTitle}
          />
          <ul className="mb-5 space-y-2">
            {content.subscribeDetails.map((detail) => (
              <CheckItem key={detail} color={colors.text}>
                {detail}
              </CheckItem>
            ))}
          </ul>
          <Link
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-5 py-2.5 font-semibold text-white shadow-lg transition ${colors.button} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white`}
            href={content.subscribeUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <YouTubeIcon />
            Suscribirme ahora
          </Link>
          <p className="mt-2 text-xs text-white/45">{content.accountNote}</p>
        </div>
      </article>

      <article className={cardClasses}>
        <div className="w-full md:w-2/5">
          <ImageCarousel
            accent={content.accent}
            images={content.connectionImages}
            onOpen={setLightboxImage}
          />
        </div>
        <div className="w-full flex-1">
          <StepHeading
            gradient={colors.badge}
            number={2}
            title="Vincula tus cuentas"
          />
          <ul className="space-y-2">
            <CheckItem color={colors.text}>
              En Discord, ve a{" "}
              <span className="font-mono text-blue-300">
                Ajustes de usuario → Conexiones
              </span>
            </CheckItem>
            <CheckItem color={colors.text}>
              Selecciona YouTube y pulsa{" "}
              <strong className="text-white">Autorizar</strong>
            </CheckItem>
            <CheckItem color={colors.text}>
              Acepta los permisos necesarios
            </CheckItem>
          </ul>
        </div>
      </article>

      <article className={cardClasses}>
        <div className="w-full md:w-2/5">
          <ImageButton
            image={{
              src: "/discord/server.webp",
              alt: "Notificación de acceso al servidor privado de Discord",
            }}
            ringClass={colors.ring}
            onOpen={setLightboxImage}
          />
        </div>
        <div className="w-full flex-1">
          <StepHeading
            gradient={colors.badge}
            number={3}
            title="Obtén acceso a Discord"
          />
          <ul className="mb-3 space-y-2">
            <CheckItem color={colors.text}>
              Recibirás acceso automático al servidor privado
            </CheckItem>
          </ul>
          <p className="text-sm text-white/45">
            El acceso suele activarse durante los primeros cinco minutos después
            de vincular tus cuentas.
          </p>
        </div>
      </article>

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}

export function DiscordGuide() {
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setShowScrollHint(true), 500);
    const hideTimer = window.setTimeout(() => setShowScrollHint(false), 12000);

    const hideAfterScrolling = () => {
      if (window.scrollY > 420) setShowScrollHint(false);
    };

    window.addEventListener("scroll", hideAfterScrolling, { passive: true });

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.removeEventListener("scroll", hideAfterScrolling);
    };
  }, []);

  const goToInstructions = () => {
    setShowScrollHint(false);
    document
      .getElementById("como-acceder")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="overflow-hidden bg-[#131118] text-white">
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10">
          <Image
            fill
            priority
            alt="Comunidad D-velopers"
            className="object-cover"
            sizes="100vw"
            src="/discord/background-image.jpg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#131118]/90 backdrop-blur-[2px]" />
          <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center px-6 py-9 text-center">
            <Image
              priority
              alt="DiegoVeloper"
              className="h-auto w-full max-w-[320px] drop-shadow-xl"
              height={150}
              src="/discord/png_logo.png"
              width={400}
            />
            <p className="mt-6 text-xl font-bold drop-shadow-lg sm:text-2xl">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Beneficios exclusivos
              </span>{" "}
              para miembros
            </p>
            <p className="mt-3 max-w-xl text-sm text-white/75 sm:text-lg">
              Conéctate con la comunidad, accede a contenido premium y participa
              en eventos privados.
            </p>
            <button
              className="mt-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:from-purple-700 hover:to-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-base"
              type="button"
              onClick={goToInstructions}
            >
              Ver cómo unirme
            </button>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="community-video-title"
        className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <h2
            className="mb-8 text-center text-3xl font-bold sm:text-4xl"
            id="community-video-title"
          >
            <span className="bg-gradient-to-r from-[#00e0ff] to-[#b45cff] bg-clip-text text-transparent">
              Descubre el poder
            </span>{" "}
            de la comunidad
          </h2>
          <div className="aspect-video overflow-hidden rounded-xl border border-cyan-400/30 shadow-[0_10px_32px_rgba(0,224,255,0.1)] sm:h-[390px] sm:aspect-auto">
            <iframe
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="h-full w-full"
              loading="lazy"
              src="https://www.youtube-nocookie.com/embed/8eecM6r9i6U?rel=0"
              title="Conoce la comunidad D-velopers"
            />
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
        id="como-acceder"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="mb-3 bg-gradient-to-r from-[#00e0ff] to-[#b45cff] bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
              Accede al Discord exclusivo
            </h2>
            <p className="mx-auto max-w-2xl text-base text-white/65 sm:text-lg">
              Sigue estos pasos para unirte a nuestra comunidad privada de
              desarrolladores.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_8px_32px_rgba(0,224,255,0.07)] backdrop-blur-lg sm:p-7">
            <YouTubeGuide />
          </div>
        </div>
      </section>

      {showScrollHint ? (
        <aside
          aria-live="polite"
          className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%_-_2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/15 bg-[#1b1824]/95 p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:bottom-7 sm:p-4"
          role="status"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/25 text-cyan-300 ring-1 ring-white/10">
            <svg
              aria-hidden="true"
              className="h-5 w-5 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="m6 9 6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              ¿Quieres entrar al Discord?
            </p>
            <p className="mt-0.5 text-xs leading-5 text-white/60 sm:text-sm">
              Baja para ver la guía paso a paso.
            </p>
          </div>

          <button
            className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:px-4 sm:text-sm"
            type="button"
            onClick={goToInstructions}
          >
            <span className="sm:hidden">Ver guía</span>
            <span className="hidden sm:inline">Ver instrucciones</span>
          </button>

          <button
            aria-label="Cerrar aviso"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-lg text-white/45 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            type="button"
            onClick={() => setShowScrollHint(false)}
          >
            ×
          </button>
        </aside>
      ) : null}
    </div>
  );
}
