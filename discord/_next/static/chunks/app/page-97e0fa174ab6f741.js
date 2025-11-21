(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [974],
  {
    1234: (e, t, s) => {
      "use strict";
      s.d(t, { CommunityShowcaseSection: () => l });
      var r = s(5155),
        a = s(6444);
      function l() {
        return (0, r.jsx)("section", {
          className: "w-full py-16 sm:py-24",
          children: (0, r.jsxs)("div", {
            className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
              (0, r.jsxs)("h2", {
                className: "text-3xl sm:text-5xl font-bold text-center mb-12",
                children: [
                  (0, r.jsx)("span", {
                    className:
                      "text-transparent bg-clip-text bg-gradient-to-r from-[#00E0FF] to-[#B45CFF]",
                    children: "Descubre el poder",
                  }),
                  " ",
                  (0, r.jsx)("span", {
                    className: "text-white",
                    children: "de la comunidad",
                  }),
                ],
              }),
              (0, r.jsx)("div", {
                className:
                  "aspect-w-16 aspect-h-9 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,224,255,0.15)] border-2 border-[#00E0FF]/30",
                children: (0, r.jsx)(a.A, {
                  videoId: "QOYRF1Jv3mg",
                  opts: {
                    width: "100%",
                    playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
                  },
                  className: "w-full h-full",
                }),
              }),
            ],
          }),
        });
      }
    },
    2903: (e, t, s) => {
      "use strict";
      s.d(t, { DiscordAccessSection: () => y });
      var r = s(5155),
        a = s(9785),
        l = s(2020),
        o = s(2115),
        i = s(2671),
        n = s(1407),
        c = s(7721),
        d = s(4520),
        u = s(1493),
        h = s(6766);
      let x = {
          src: "./_next/static/media/twitch-subscribe-step.75fcc331.webp",
          height: 655,
          width: 1366,
          blurDataURL:
            "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAACQAQCdASoIAAQAAkA4JZwAAudGFyYA/vzpLd3Xl1CHiy7T/AA=",
          blurWidth: 8,
          blurHeight: 4,
        },
        m = { src: "./_next/static/media/secondStep1.39c4f29e.webp" },
        p = { src: "./_next/static/media/secondStep2.3c3fb1b6.webp" },
        f = { src: "./_next/static/media/secondStep3.6baf67ff.webp" },
        b = { src: "./_next/static/media/secondStep4.db5409e7.webp" },
        g = {
          src: "./_next/static/media/server.ee6aeef7.webp",
          height: 304,
          width: 582,
          blurDataURL:
            "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoIAAQAAkA4JZQC7AD0j15rEAD+/XFC+Sr94Xx9FcelKVflYdgU1QRVpW0ErVGSXC9AAA==",
          blurWidth: 8,
          blurHeight: 4,
        };
      function j() {
        let [e, t] = (0, o.useState)(null),
          [s, a] = (0, o.useState)(1),
          [l, j] = (0, o.useState)({ x: 0, y: 0 }),
          [v, w] = (0, o.useState)(!1),
          [N, y] = (0, o.useState)({ x: 0, y: 0 }),
          [k, M] = (0, o.useState)(null),
          A = (0, o.useRef)(null),
          C = (0, o.useCallback)(() => {
            if (!A.current || s <= 1) return { maxX: 0, maxY: 0 };
            let e = A.current,
              t = Math.min(0.3, 0.5 / s),
              r = (s - 1) * (1 - t);
            return {
              maxX: (e.clientWidth * r) / 2,
              maxY: (e.clientHeight * r) / 2,
              marginFactor: t,
            };
          }, [s]),
          L = (e) => {
            t(e), a(1), j({ x: 0, y: 0 });
          },
          S = (0, o.useCallback)(
            (e, t) => {
              let { maxX: r, maxY: a, marginFactor: l } = C(),
                o = Math.min(1, 1.5 / s);
              j((l) => {
                let i = l.x + (e - N.x) * o,
                  n = l.y + (t - N.y) * o,
                  c = (e, t) => {
                    let r = 0.7 * t,
                      a = Math.abs(e) - r;
                    if (a > 0) {
                      let t = e > 0 ? 1 : -1;
                      return r * t + a * t * (0.2 + s / 10);
                    }
                    return e;
                  };
                return { x: c(i, r), y: c(n, a) };
              }),
                y({ x: e, y: t });
            },
            [C, s, N.x, N.y],
          );
        (0, o.useEffect)(() => {
          if (!A.current) return;
          let { maxX: e, maxY: t } = C();
          j((s) => {
            let r = Math.max(-e, Math.min(e, s.x)),
              a = Math.max(-t, Math.min(t, s.y));
            return { x: s.x + (r - s.x) * 0.3, y: s.y + (a - s.y) * 0.3 };
          });
        }, [s, C]);
        let _ = [
          {
            src: m.src,
            alt: "Paso 1: Ir a Configuraci\xf3n de usuario > Conexiones",
          },
          { src: p.src, alt: "Paso 2: Buscar y seleccionar Conexiones" },
          { src: f.src, alt: "Paso 3: Busca y selecciona Twitch" },
          { src: b.src, alt: "Paso 4: Autorizar la conexi\xf3n" },
        ];
        return (0, r.jsxs)("div", {
          className: "space-y-8",
          children: [
            (0, r.jsxs)("div", {
              className: "text-center mb-8",
              children: [
                (0, r.jsx)("h2", {
                  className:
                    "text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-400 mb-2",
                  children: "C\xf3mo unirte al Discord (Twitch)",
                }),
                (0, r.jsx)("p", {
                  className: "text-white/70",
                  children: "Sigue estos sencillos pasos para obtener acceso",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className:
                "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-purple-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
              children: [
                (0, r.jsxs)("button", {
                  onClick: () => L(x.src),
                  className:
                    "relative w-full md:w-2/5 aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#131118]",
                  "aria-label": "Ampliar imagen de suscripci\xf3n",
                  children: [
                    (0, r.jsx)(h.default, {
                      src: x,
                      alt: "Pantalla de suscripci\xf3n en Twitch mostrando el bot\xf3n 'Suscribirse' resaltado",
                      fill: !0,
                      className:
                        "object-cover group-hover:scale-102 transition-transform duration-300",
                    }),
                    (0, r.jsx)("div", {
                      className:
                        "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                      children: (0, r.jsx)("svg", {
                        className: "w-10 h-10 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                        }),
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "flex-1",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-3 mb-4",
                      children: [
                        (0, r.jsx)("div", {
                          className:
                            "w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg",
                          children: "1",
                        }),
                        (0, r.jsx)("h3", {
                          className:
                            "text-xl font-bold text-white tracking-tight",
                          children: "Hazte Suscriptor en Twitch",
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "space-y-3 mb-5",
                      children: [
                        (0, r.jsxs)("p", {
                          className: "text-white/80 flex items-start",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "inline-block w-5 h-5 mr-2 text-purple-400",
                              children: "✓",
                            }),
                            "Busca el bot\xf3n",
                            " ",
                            (0, r.jsx)("span", {
                              className: "font-medium text-white mx-1",
                              children: '"Suscribirse"',
                            }),
                          ],
                        }),
                        (0, r.jsx)("p", {
                          className: "text-white/80",
                          children: (0, r.jsxs)("span", {
                            className: "inline-flex items-start",
                            children: [
                              (0, r.jsx)("span", {
                                className:
                                  "inline-block w-5 h-5 mr-2 text-purple-400",
                                children: "✓",
                              }),
                              (0, r.jsx)("span", {
                                className: "font-medium text-white",
                                children:
                                  "Selecciona el plan de $1.99/mes o m\xe1s",
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    (0, r.jsxs)(i.T, {
                      as: "a",
                      href: "https://www.twitch.tv/subs/diegoveloper",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "relative overflow-hidden group",
                      children: [
                        (0, r.jsxs)("span", {
                          className:
                            "relative z-10 flex items-center justify-center gap-2 text-white",
                          children: [
                            (0, r.jsx)("svg", {
                              className: "w-5 h-5",
                              fill: "currentColor",
                              viewBox: "0 0 24 24",
                              children: (0, r.jsx)("path", {
                                d: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z",
                              }),
                            }),
                            "Link para suscribirse ahora",
                          ],
                        }),
                        (0, r.jsx)("span", {
                          className:
                            "absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 group-hover:from-purple-700 group-hover:to-blue-600 transition-all duration-300",
                        }),
                        (0, r.jsx)("span", {
                          className:
                            "absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        }),
                      ],
                    }),
                    (0, r.jsx)("p", {
                      className: "text-xs text-white/50 mt-2",
                      children: "Requiere cuenta de Twitch",
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className:
                "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-purple-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
              children: [
                (0, r.jsxs)("div", {
                  className: "relative w-full md:w-2/5 group/carousel",
                  children: [
                    (0, r.jsx)("button", {
                      className:
                        "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-purple-500",
                      "aria-label": "Anterior imagen",
                      onClick: (e) => {
                        var t;
                        e.stopPropagation();
                        let s =
                          null == (t = e.currentTarget.parentElement)
                            ? void 0
                            : t.querySelector(".carousel-container");
                        s &&
                          s.scrollBy({
                            left: -s.clientWidth,
                            behavior: "smooth",
                          });
                      },
                      children: (0, r.jsx)("svg", {
                        className: "w-5 h-5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M15 19l-7-7 7-7",
                        }),
                      }),
                    }),
                    (0, r.jsx)("div", {
                      className:
                        "carousel-container flex space-x-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide",
                      ref: (e) => {
                        if (!e) return;
                        let t = () => {
                          var t;
                          let s = Math.round(e.scrollLeft / e.clientWidth);
                          null == (t = e.parentElement) ||
                            t
                              .querySelectorAll(".carousel-indicator")
                              .forEach((e, t) => {
                                t === s
                                  ? (e.classList.remove("bg-white/20"),
                                    e.classList.add("bg-purple-400"))
                                  : (e.classList.remove("bg-purple-400"),
                                    e.classList.add("bg-white/20"));
                              });
                        };
                        e.addEventListener("scroll", t), t();
                      },
                      children: _.map((e, t) =>
                        (0, r.jsxs)(
                          "button",
                          {
                            onClick: () => L(e.src),
                            className:
                              "relative flex-shrink-0 w-full aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#131118] snap-center",
                            "aria-label": "Ampliar imagen del paso ".concat(
                              t + 1,
                            ),
                            children: [
                              (0, r.jsx)(h.default, {
                                src: e.src,
                                alt: e.alt,
                                fill: !0,
                                className:
                                  "object-cover group-hover:scale-102 transition-transform duration-300",
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                                children: (0, r.jsx)("svg", {
                                  className: "w-10 h-10 text-white",
                                  fill: "none",
                                  stroke: "currentColor",
                                  viewBox: "0 0 24 24",
                                  children: (0, r.jsx)("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                                  }),
                                }),
                              }),
                            ],
                          },
                          t,
                        ),
                      ),
                    }),
                    (0, r.jsx)("button", {
                      className:
                        "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-purple-500",
                      "aria-label": "Siguiente imagen",
                      onClick: (e) => {
                        var t;
                        e.stopPropagation();
                        let s =
                          null == (t = e.currentTarget.parentElement)
                            ? void 0
                            : t.querySelector(".carousel-container");
                        s &&
                          s.scrollBy({
                            left: s.clientWidth,
                            behavior: "smooth",
                          });
                      },
                      children: (0, r.jsx)("svg", {
                        className: "w-5 h-5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M9 5l7 7-7 7",
                        }),
                      }),
                    }),
                    (0, r.jsx)("div", {
                      className: "flex justify-center space-x-2 mt-3",
                      children: [0, 1, 2, 3].map((e) =>
                        (0, r.jsx)(
                          "button",
                          {
                            className:
                              "carousel-indicator block w-2 h-2 rounded-full bg-white/20 transition-colors duration-300 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500",
                            "aria-label": "Ir a imagen ".concat(e + 1),
                            onClick: (t) => {
                              var s;
                              t.stopPropagation();
                              let r =
                                null ==
                                (s = t.currentTarget.closest(".relative"))
                                  ? void 0
                                  : s.querySelector(".carousel-container");
                              r &&
                                r.scrollTo({
                                  left: r.clientWidth * e,
                                  behavior: "smooth",
                                });
                            },
                          },
                          e,
                        ),
                      ),
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "flex-1",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-3 mb-4",
                      children: [
                        (0, r.jsx)("div", {
                          className:
                            "w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg",
                          children: "2",
                        }),
                        (0, r.jsx)("h3", {
                          className:
                            "text-xl font-bold text-white tracking-tight",
                          children: "Vincula tus cuentas",
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "space-y-3 mb-5",
                      children: [
                        (0, r.jsxs)("p", {
                          className: "text-white/80",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "inline-block w-5 h-5 mr-2 text-purple-400",
                              children: "✓",
                            }),
                            "Ve a",
                            " ",
                            (0, r.jsxs)("span", {
                              className: "font-mono text-blue-300",
                              children: [
                                "Ajustes de usuario ",
                                ">",
                                " Conexiones",
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)("p", {
                          className: "text-white/80",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "inline-block w-5 h-5 mr-2 text-purple-400",
                              children: "✓",
                            }),
                            "Busca Twitch y haz clic en",
                            " ",
                            (0, r.jsx)("span", {
                              className: "font-medium text-white",
                              children: '"Autorizar"',
                            }),
                          ],
                        }),
                        (0, r.jsxs)("p", {
                          className: "text-white/80 flex items-start",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "inline-block w-5 h-5 mr-2 text-purple-400",
                              children: "✓",
                            }),
                            "Autoriza los permisos necesarios",
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className:
                "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-purple-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]",
              children: [
                (0, r.jsxs)("button", {
                  onClick: () => L(g.src),
                  className:
                    "relative w-full md:w-2/5 aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#131118]",
                  "aria-label": "Ampliar imagen de acceso a Discord",
                  children: [
                    (0, r.jsx)(h.default, {
                      src: g,
                      alt: "Notificaci\xf3n de acceso a Discord",
                      fill: !0,
                      className:
                        "object-cover group-hover:scale-102 transition-transform duration-300",
                    }),
                    (0, r.jsx)("div", {
                      className:
                        "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                      children: (0, r.jsx)("svg", {
                        className: "w-10 h-10 text-white",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                        }),
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "flex-1",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-3 mb-4",
                      children: [
                        (0, r.jsx)("div", {
                          className:
                            "w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg",
                          children: "3",
                        }),
                        (0, r.jsx)("h3", {
                          className:
                            "text-xl font-bold text-white tracking-tight",
                          children: "Obt\xe9n acceso a Discord",
                        }),
                      ],
                    }),
                    (0, r.jsx)("div", {
                      className: "space-y-3 mb-5",
                      children: (0, r.jsxs)("p", {
                        className: "text-white/80 flex items-start",
                        children: [
                          (0, r.jsx)("span", {
                            className:
                              "inline-block w-5 h-5 mr-2 text-purple-400",
                            children: "✓",
                          }),
                          "Recibir\xe1s una invitaci\xf3n autom\xe1tica al servidor privado",
                        ],
                      }),
                    }),
                    (0, r.jsx)("p", {
                      className: "text-sm text-white/50",
                      children:
                        "El acceso se otorga en los primeros 5 minutos despu\xe9s de suscribirte",
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsx)(n.Y, {
              isOpen: !!e,
              onClose: () => {
                t(null);
              },
              size: "5xl",
              placement: "center",
              backdrop: "opaque",
              classNames: {
                body: "py-6",
                backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                header: "border-b-[1px] border-[#292f46]",
                footer: "border-t-[1px] border-[#292f46]",
                closeButton: "hover:bg-white/5 active:bg-white/10",
              },
              children: (0, r.jsxs)(c.g, {
                children: [
                  (0, r.jsx)(d.c, {
                    children: (0, r.jsx)("h3", {
                      className: "text-xl font-semibold text-white",
                      children: "Vista ampliada",
                    }),
                  }),
                  (0, r.jsx)(u.h, {
                    children:
                      e &&
                      (0, r.jsxs)("div", {
                        className:
                          "relative w-full h-[70vh] overflow-hidden touch-none",
                        ref: A,
                        children: [
                          (0, r.jsx)("div", {
                            className:
                              "absolute inset-0 flex items-center justify-center",
                            children: (0, r.jsx)("div", {
                              className:
                                "relative w-full h-full transition-transform duration-100 ease-out will-change-transform",
                              style: {
                                transform: "scale("
                                  .concat(s, ") translate(")
                                  .concat(l.x, "px, ")
                                  .concat(l.y, "px)"),
                                cursor:
                                  s > 1 ? (v ? "grabbing" : "grab") : "zoom-in",
                                touchAction: "none",
                              },
                              onWheel: (e) => {
                                e.preventDefault();
                                let t = -(0.005 * e.deltaY);
                                a((e) => Math.min(Math.max(1, e + t), 3));
                              },
                              onMouseDown: (e) => {
                                s > 1 &&
                                  0 === e.button &&
                                  (w(!0), y({ x: e.clientX, y: e.clientY }));
                              },
                              onMouseMove: (e) => {
                                v && S(e.clientX, e.clientY);
                              },
                              onMouseUp: () => w(!1),
                              onMouseLeave: () => w(!1),
                              onTouchStart: (e) => {
                                if (2 === e.touches.length) {
                                  let t = e.touches[0],
                                    s = e.touches[1];
                                  M(
                                    Math.hypot(
                                      s.clientX - t.clientX,
                                      s.clientY - t.clientY,
                                    ),
                                  );
                                } else
                                  1 === e.touches.length &&
                                    s > 1 &&
                                    (w(!0),
                                    y({
                                      x: e.touches[0].clientX,
                                      y: e.touches[0].clientY,
                                    }));
                              },
                              onTouchMove: (e) => {
                                if (2 === e.touches.length && null !== k) {
                                  e.preventDefault();
                                  let t = e.touches[0],
                                    s = e.touches[1],
                                    r = Math.hypot(
                                      s.clientX - t.clientX,
                                      s.clientY - t.clientY,
                                    ),
                                    l = r / k;
                                  a((e) => Math.min(Math.max(1, e * l), 3)),
                                    M(r);
                                } else
                                  1 === e.touches.length &&
                                    v &&
                                    (e.preventDefault(),
                                    S(
                                      e.touches[0].clientX,
                                      e.touches[0].clientY,
                                    ));
                              },
                              onTouchEnd: () => {
                                w(!1), M(null);
                              },
                              children: (0, r.jsx)(h.default, {
                                src: e,
                                alt: "Imagen ampliada",
                                fill: !0,
                                className:
                                  "object-contain select-none pointer-events-none",
                                priority: !0,
                                draggable: !1,
                              }),
                            }),
                          }),
                          (0, r.jsxs)("div", {
                            className:
                              "absolute bottom-4 right-4 flex flex-col space-y-2 z-10",
                            children: [
                              (0, r.jsx)("button", {
                                onClick: () => {
                                  if (
                                    (a((e) => Math.min(e + 0.25, 3)), A.current)
                                  ) {
                                    let { maxX: e, maxY: t } = C();
                                    j((s) => ({
                                      x: Math.max(-e, Math.min(e, s.x)),
                                      y: Math.max(-t, Math.min(t, s.y)),
                                    }));
                                  }
                                },
                                className:
                                  "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                "aria-label": "Acercar",
                                children: (0, r.jsx)("svg", {
                                  className: "w-5 h-5",
                                  fill: "none",
                                  stroke: "currentColor",
                                  viewBox: "0 0 24 24",
                                  children: (0, r.jsx)("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M12 6v6m0 0v6m0-6h6m-6 0H6",
                                  }),
                                }),
                              }),
                              (0, r.jsx)("button", {
                                onClick: () => {
                                  a((e) => Math.max(e - 0.25, 1)),
                                    s - 0.25 <= 1 && j({ x: 0, y: 0 });
                                },
                                className:
                                  "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                "aria-label": "Alejar",
                                children: (0, r.jsx)("svg", {
                                  className: "w-5 h-5",
                                  fill: "none",
                                  stroke: "currentColor",
                                  viewBox: "0 0 24 24",
                                  children: (0, r.jsx)("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M20 12H4",
                                  }),
                                }),
                              }),
                              (0, r.jsx)("button", {
                                onClick: () => {
                                  a(1), j({ x: 0, y: 0 });
                                },
                                className:
                                  "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                "aria-label": "Resetear zoom",
                                children: (0, r.jsx)("svg", {
                                  className: "w-5 h-5",
                                  fill: "none",
                                  stroke: "currentColor",
                                  viewBox: "0 0 24 24",
                                  children: (0, r.jsx)("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
                                  }),
                                }),
                              }),
                            ],
                          }),
                        ],
                      }),
                  }),
                ],
              }),
            }),
          ],
        });
      }
      let v = {
          src: "./_next/static/media/youtube-subscribe-step.c3ef71ae.webp",
        },
        w = { src: "./_next/static/media/secondYoutubeStep3.d985c0c4.webp" };
      function N() {
        let [e, t] = (0, o.useState)(null),
          [s, a] = (0, o.useState)(1),
          [l, x] = (0, o.useState)({ x: 0, y: 0 }),
          [f, j] = (0, o.useState)(!1),
          [N, y] = (0, o.useState)({ x: 0, y: 0 }),
          [k, M] = (0, o.useState)(null),
          A = (0, o.useRef)(null),
          C = (0, o.useCallback)(() => {
            if (!A.current || s <= 1) return { maxX: 0, maxY: 0 };
            let e = A.current,
              t = Math.min(0.3, 0.5 / s),
              r = (s - 1) * (1 - t);
            return {
              maxX: (e.clientWidth * r) / 2,
              maxY: (e.clientHeight * r) / 2,
              marginFactor: t,
            };
          }, [s]),
          L = (e) => {
            t(e), a(1), x({ x: 0, y: 0 });
          },
          S = (0, o.useCallback)(
            (e, t) => {
              let { maxX: r, maxY: a, marginFactor: l } = C(),
                o = Math.min(1, 1.5 / s);
              x((l) => {
                let i = l.x + (e - N.x) * o,
                  n = l.y + (t - N.y) * o,
                  c = (e, t) => {
                    let r = 0.7 * t,
                      a = Math.abs(e) - r;
                    if (a > 0) {
                      let t = e > 0 ? 1 : -1;
                      return r * t + a * t * (0.2 + s / 10);
                    }
                    return e;
                  };
                return { x: c(i, r), y: c(n, a) };
              }),
                y({ x: e, y: t });
            },
            [C, s, N.x, N.y],
          );
        return (
          (0, o.useEffect)(() => {
            if (!A.current) return;
            let { maxX: e, maxY: t } = C();
            x((s) => {
              let r = Math.max(-e, Math.min(e, s.x)),
                a = Math.max(-t, Math.min(t, s.y));
              return { x: s.x + (r - s.x) * 0.3, y: s.y + (a - s.y) * 0.3 };
            });
          }, [s, C]),
          (0, r.jsxs)("div", {
            className: "space-y-8",
            children: [
              (0, r.jsxs)("div", {
                className: "text-center mb-8",
                children: [
                  (0, r.jsx)("h2", {
                    className:
                      "text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 mb-2",
                    children: "C\xf3mo unirte al Discord (YouTube)",
                  }),
                  (0, r.jsx)("p", {
                    className: "text-white/70",
                    children: "Sigue estos sencillos pasos para obtener acceso",
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                className:
                  "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-red-500/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
                children: [
                  (0, r.jsxs)("button", {
                    onClick: () => L(v.src),
                    className:
                      "relative w-full md:w-2/5 aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#131118]",
                    "aria-label": "Ampliar imagen de suscripci\xf3n",
                    children: [
                      (0, r.jsx)(h.default, {
                        src: v.src,
                        alt: "Pantalla de suscripci\xf3n en YouTube mostrando el bot\xf3n 'Suscribirse' resaltado",
                        fill: !0,
                        className:
                          "object-cover group-hover:scale-102 transition-transform duration-300",
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                        children: (0, r.jsx)("svg", {
                          className: "w-10 h-10 text-white",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: (0, r.jsx)("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                          }),
                        }),
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: "flex-1",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                          (0, r.jsx)("div", {
                            className:
                              "w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-lg",
                            children: "1",
                          }),
                          (0, r.jsx)("h3", {
                            className:
                              "text-xl font-bold text-white tracking-tight",
                            children: "Hazte Suscriptor en YouTube",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        className: "space-y-3 mb-5",
                        children: [
                          (0, r.jsxs)("p", {
                            className: "text-white/80 flex items-start",
                            children: [
                              (0, r.jsx)("span", {
                                className:
                                  "inline-block w-5 h-5 mr-2 text-red-400",
                                children: "✓",
                              }),
                              "Busca el bot\xf3n",
                              " ",
                              (0, r.jsx)("span", {
                                className: "font-medium text-white mx-1",
                                children: '"Suscribirse"',
                              }),
                            ],
                          }),
                          (0, r.jsx)("p", {
                            className: "text-white/80",
                            children: (0, r.jsxs)("span", {
                              className: "inline-flex items-start",
                              children: [
                                (0, r.jsx)("span", {
                                  className:
                                    "inline-block w-5 h-5 mr-2 text-red-400",
                                  children: "✓",
                                }),
                                (0, r.jsx)("span", {
                                  className: "font-medium text-white",
                                  children:
                                    "Selecciona el plan developer en adelante",
                                }),
                              ],
                            }),
                          }),
                        ],
                      }),
                      (0, r.jsxs)(i.T, {
                        as: "a",
                        href: "https://www.youtube.com/channel/UCFKZxStYsOVrzdN_FCZ0NGg/join",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "relative overflow-hidden group",
                        children: [
                          (0, r.jsxs)("span", {
                            className:
                              "relative z-10 flex items-center justify-center gap-2 text-white",
                            children: [
                              (0, r.jsx)("svg", {
                                className: "w-5 h-5",
                                fill: "currentColor",
                                viewBox: "0 0 24 24",
                                children: (0, r.jsx)("path", {
                                  d: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
                                }),
                              }),
                              "Link para suscribirse ahora",
                            ],
                          }),
                          (0, r.jsx)("span", {
                            className:
                              "absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 group-hover:from-red-700 group-hover:to-red-800 transition-all duration-300",
                          }),
                          (0, r.jsx)("span", {
                            className:
                              "absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                          }),
                        ],
                      }),
                      (0, r.jsx)("p", {
                        className: "text-xs text-white/50 mt-2",
                        children: "Requiere cuenta de YouTube",
                      }),
                    ],
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                className:
                  "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-red-500/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
                children: [
                  (0, r.jsxs)("div", {
                    className: "relative w-full md:w-2/5 group/carousel",
                    children: [
                      (0, r.jsx)("button", {
                        className:
                          "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-red-500",
                        "aria-label": "Anterior imagen",
                        onClick: (e) => {
                          var t;
                          e.stopPropagation();
                          let s =
                            null == (t = e.currentTarget.parentElement)
                              ? void 0
                              : t.querySelector(".carousel-container");
                          s &&
                            s.scrollBy({
                              left: -s.clientWidth,
                              behavior: "smooth",
                            });
                        },
                        children: (0, r.jsx)("svg", {
                          className: "w-5 h-5",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: (0, r.jsx)("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M15 19l-7-7 7-7",
                          }),
                        }),
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "carousel-container flex space-x-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide",
                        ref: (e) => {
                          if (!e) return;
                          let t = () => {
                            var t;
                            let s = Math.round(e.scrollLeft / e.clientWidth);
                            null == (t = e.parentElement) ||
                              t
                                .querySelectorAll(".carousel-indicator")
                                .forEach((e, t) => {
                                  t === s
                                    ? (e.classList.remove("bg-white/20"),
                                      e.classList.add("bg-red-500"))
                                    : (e.classList.remove("bg-red-500"),
                                      e.classList.add("bg-white/20"));
                                });
                          };
                          e.addEventListener("scroll", t), t();
                        },
                        children: [
                          {
                            src: m.src,
                            alt: "Paso 1: Ir a Configuraci\xf3n de usuario > Conexiones",
                          },
                          {
                            src: p.src,
                            alt: "Paso 2: Buscar y seleccionar Conexiones",
                          },
                          {
                            src: w.src,
                            alt: "Paso 3: Busca y selecciona YouTube",
                          },
                          {
                            src: b.src,
                            alt: "Paso 4: Autorizar la conexi\xf3n",
                          },
                        ].map((e, t) =>
                          (0, r.jsxs)(
                            "button",
                            {
                              onClick: () => L(e.src),
                              className:
                                "relative flex-shrink-0 w-full aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#131118] snap-center",
                              "aria-label": "Ampliar imagen del paso ".concat(
                                t + 1,
                              ),
                              children: [
                                (0, r.jsx)(h.default, {
                                  src: e.src,
                                  alt: e.alt,
                                  fill: !0,
                                  className:
                                    "object-cover group-hover:scale-102 transition-transform duration-300",
                                }),
                                (0, r.jsx)("div", {
                                  className:
                                    "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                                  children: (0, r.jsx)("svg", {
                                    className: "w-10 h-10 text-white",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: (0, r.jsx)("path", {
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round",
                                      strokeWidth: 2,
                                      d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                                    }),
                                  }),
                                }),
                              ],
                            },
                            t,
                          ),
                        ),
                      }),
                      (0, r.jsx)("button", {
                        className:
                          "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-red-500",
                        "aria-label": "Siguiente imagen",
                        onClick: (e) => {
                          var t;
                          e.stopPropagation();
                          let s =
                            null == (t = e.currentTarget.parentElement)
                              ? void 0
                              : t.querySelector(".carousel-container");
                          s &&
                            s.scrollBy({
                              left: s.clientWidth,
                              behavior: "smooth",
                            });
                        },
                        children: (0, r.jsx)("svg", {
                          className: "w-5 h-5",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: (0, r.jsx)("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M9 5l7 7-7 7",
                          }),
                        }),
                      }),
                      (0, r.jsx)("div", {
                        className: "flex justify-center space-x-2 mt-3",
                        children: [0, 1, 2, 3].map((e) =>
                          (0, r.jsx)(
                            "button",
                            {
                              className:
                                "carousel-indicator block w-2 h-2 rounded-full bg-white/20 transition-colors duration-300 hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-red-500",
                              "aria-label": "Ir a imagen ".concat(e + 1),
                              onClick: (t) => {
                                var s;
                                t.stopPropagation();
                                let r =
                                  null ==
                                  (s = t.currentTarget.closest(".relative"))
                                    ? void 0
                                    : s.querySelector(".carousel-container");
                                r &&
                                  r.scrollTo({
                                    left: r.clientWidth * e,
                                    behavior: "smooth",
                                  });
                              },
                            },
                            e,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: "flex-1",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                          (0, r.jsx)("div", {
                            className:
                              "w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-lg",
                            children: "2",
                          }),
                          (0, r.jsx)("h3", {
                            className:
                              "text-xl font-bold text-white tracking-tight",
                            children: "Vincula tus cuentas",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        className: "space-y-3 mb-5",
                        children: [
                          (0, r.jsxs)("p", {
                            className: "text-white/80",
                            children: [
                              (0, r.jsx)("span", {
                                className:
                                  "inline-block w-5 h-5 mr-2 text-red-400",
                                children: "✓",
                              }),
                              "Ve a",
                              " ",
                              (0, r.jsxs)("span", {
                                className: "font-mono text-blue-300",
                                children: [
                                  "Ajustes de usuario ",
                                  ">",
                                  " Conexiones",
                                ],
                              }),
                            ],
                          }),
                          (0, r.jsxs)("p", {
                            className: "text-white/80",
                            children: [
                              (0, r.jsx)("span", {
                                className:
                                  "inline-block w-5 h-5 mr-2 text-red-400",
                                children: "✓",
                              }),
                              "Busca YouTube y haz clic en",
                              " ",
                              (0, r.jsx)("span", {
                                className: "font-medium text-white",
                                children: '"Autorizar"',
                              }),
                            ],
                          }),
                          (0, r.jsxs)("p", {
                            className: "text-white/80 flex items-start",
                            children: [
                              (0, r.jsx)("span", {
                                className:
                                  "inline-block w-5 h-5 mr-2 text-red-400",
                                children: "✓",
                              }),
                              "Autoriza los permisos necesarios",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                className:
                  "flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-[#131118] to-[#1E1B2A] p-6 rounded-xl border border-red-500/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]",
                children: [
                  (0, r.jsxs)("button", {
                    onClick: () => L(g.src),
                    className:
                      "relative w-full md:w-2/5 aspect-video rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#131118]",
                    "aria-label": "Ampliar imagen de acceso a Discord",
                    children: [
                      (0, r.jsx)(h.default, {
                        src: g.src,
                        alt: "Notificaci\xf3n de acceso a Discord",
                        fill: !0,
                        className:
                          "object-cover group-hover:scale-102 transition-transform duration-300",
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                        children: (0, r.jsx)("svg", {
                          className: "w-10 h-10 text-white",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: (0, r.jsx)("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                          }),
                        }),
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: "flex-1",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-3 mb-4",
                        children: [
                          (0, r.jsx)("div", {
                            className:
                              "w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-bold shadow-lg",
                            children: "3",
                          }),
                          (0, r.jsx)("h3", {
                            className:
                              "text-xl font-bold text-white tracking-tight",
                            children: "Obt\xe9n acceso a Discord",
                          }),
                        ],
                      }),
                      (0, r.jsx)("div", {
                        className: "space-y-3 mb-5",
                        children: (0, r.jsxs)("p", {
                          className: "text-white/80 flex items-start",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "inline-block w-5 h-5 mr-2 text-red-400",
                              children: "✓",
                            }),
                            "Recibir\xe1s una invitaci\xf3n autom\xe1tica al servidor privado",
                          ],
                        }),
                      }),
                      (0, r.jsx)("p", {
                        className: "text-sm text-white/50",
                        children:
                          "El acceso se otorga en los primeros 5 minutos despu\xe9s de suscribirte",
                      }),
                    ],
                  }),
                ],
              }),
              (0, r.jsx)(n.Y, {
                isOpen: !!e,
                onClose: () => {
                  t(null);
                },
                size: "5xl",
                placement: "center",
                backdrop: "opaque",
                classNames: {
                  body: "py-6",
                  backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                  base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                  header: "border-b-[1px] border-[#292f46]",
                  footer: "border-t-[1px] border-[#292f46]",
                  closeButton: "hover:bg-white/5 active:bg-white/10",
                },
                children: (0, r.jsxs)(c.g, {
                  children: [
                    (0, r.jsx)(d.c, {
                      children: (0, r.jsx)("h3", {
                        className: "text-xl font-semibold text-white",
                        children: "Vista ampliada",
                      }),
                    }),
                    (0, r.jsx)(u.h, {
                      children:
                        e &&
                        (0, r.jsxs)("div", {
                          className:
                            "relative w-full h-[70vh] overflow-hidden touch-none",
                          ref: A,
                          children: [
                            (0, r.jsx)("div", {
                              className:
                                "absolute inset-0 flex items-center justify-center",
                              children: (0, r.jsx)("div", {
                                className:
                                  "relative w-full h-full transition-transform duration-100 ease-out will-change-transform",
                                style: {
                                  transform: "scale("
                                    .concat(s, ") translate(")
                                    .concat(l.x, "px, ")
                                    .concat(l.y, "px)"),
                                  cursor:
                                    s > 1
                                      ? f
                                        ? "grabbing"
                                        : "grab"
                                      : "zoom-in",
                                  touchAction: "none",
                                },
                                onWheel: (e) => {
                                  e.preventDefault();
                                  let t = -(0.005 * e.deltaY);
                                  a((e) => Math.min(Math.max(1, e + t), 3));
                                },
                                onMouseDown: (e) => {
                                  s > 1 &&
                                    0 === e.button &&
                                    (j(!0), y({ x: e.clientX, y: e.clientY }));
                                },
                                onMouseMove: (e) => {
                                  f && S(e.clientX, e.clientY);
                                },
                                onMouseUp: () => j(!1),
                                onMouseLeave: () => j(!1),
                                onTouchStart: (e) => {
                                  if (2 === e.touches.length) {
                                    let t = e.touches[0],
                                      s = e.touches[1];
                                    M(
                                      Math.hypot(
                                        s.clientX - t.clientX,
                                        s.clientY - t.clientY,
                                      ),
                                    );
                                  } else
                                    1 === e.touches.length &&
                                      s > 1 &&
                                      (j(!0),
                                      y({
                                        x: e.touches[0].clientX,
                                        y: e.touches[0].clientY,
                                      }));
                                },
                                onTouchMove: (e) => {
                                  if (2 === e.touches.length && null !== k) {
                                    e.preventDefault();
                                    let t = e.touches[0],
                                      s = e.touches[1],
                                      r = Math.hypot(
                                        s.clientX - t.clientX,
                                        s.clientY - t.clientY,
                                      ),
                                      l = r / k;
                                    a((e) => Math.min(Math.max(1, e * l), 3)),
                                      M(r);
                                  } else
                                    1 === e.touches.length &&
                                      f &&
                                      (e.preventDefault(),
                                      S(
                                        e.touches[0].clientX,
                                        e.touches[0].clientY,
                                      ));
                                },
                                onTouchEnd: () => {
                                  j(!1), M(null);
                                },
                                children: (0, r.jsx)(h.default, {
                                  src: e,
                                  alt: "Imagen ampliada",
                                  fill: !0,
                                  className:
                                    "object-contain select-none pointer-events-none",
                                  priority: !0,
                                  draggable: !1,
                                }),
                              }),
                            }),
                            (0, r.jsxs)("div", {
                              className:
                                "absolute bottom-4 right-4 flex flex-col space-y-2 z-10",
                              children: [
                                (0, r.jsx)("button", {
                                  onClick: () => {
                                    if (
                                      (a((e) => Math.min(e + 0.25, 3)),
                                      A.current)
                                    ) {
                                      let { maxX: e, maxY: t } = C();
                                      x((s) => ({
                                        x: Math.max(-e, Math.min(e, s.x)),
                                        y: Math.max(-t, Math.min(t, s.y)),
                                      }));
                                    }
                                  },
                                  className:
                                    "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                  "aria-label": "Acercar",
                                  children: (0, r.jsx)("svg", {
                                    className: "w-5 h-5",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: (0, r.jsx)("path", {
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round",
                                      strokeWidth: 2,
                                      d: "M12 6v6m0 0v6m0-6h6m-6 0H6",
                                    }),
                                  }),
                                }),
                                (0, r.jsx)("button", {
                                  onClick: () => {
                                    a((e) => Math.max(e - 0.25, 1)),
                                      s - 0.25 <= 1 && x({ x: 0, y: 0 });
                                  },
                                  className:
                                    "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                  "aria-label": "Alejar",
                                  children: (0, r.jsx)("svg", {
                                    className: "w-5 h-5",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: (0, r.jsx)("path", {
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round",
                                      strokeWidth: 2,
                                      d: "M20 12H4",
                                    }),
                                  }),
                                }),
                                (0, r.jsx)("button", {
                                  onClick: () => {
                                    a(1), x({ x: 0, y: 0 });
                                  },
                                  className:
                                    "w-10 h-10 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors",
                                  "aria-label": "Resetear zoom",
                                  children: (0, r.jsx)("svg", {
                                    className: "w-5 h-5",
                                    fill: "none",
                                    stroke: "currentColor",
                                    viewBox: "0 0 24 24",
                                    children: (0, r.jsx)("path", {
                                      strokeLinecap: "round",
                                      strokeLinejoin: "round",
                                      strokeWidth: 2,
                                      d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
                                    }),
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                    }),
                  ],
                }),
              }),
            ],
          })
        );
      }
      function y() {
        return (0, r.jsx)("section", {
          className: "w-full py-20 bg-[#131118]",
          id: "como-acceder",
          children: (0, r.jsxs)("div", {
            className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
            children: [
              (0, r.jsxs)("div", {
                className: "text-center mb-16",
                children: [
                  (0, r.jsx)("h2", {
                    className: "text-4xl sm:text-5xl font-bold mb-4",
                    children: (0, r.jsx)("span", {
                      className:
                        "text-transparent bg-clip-text bg-gradient-to-r from-[#00E0FF] to-[#B45CFF]",
                      children: "Accede al Discord Exclusivo",
                    }),
                  }),
                  (0, r.jsx)("p", {
                    className: "text-lg text-white/70 max-w-2xl mx-auto",
                    children:
                      "Sigue estos pasos para unirte a nuestra comunidad privada de desarrolladores",
                  }),
                ],
              }),
              (0, r.jsx)("div", {
                className:
                  "bg-white/5 backdrop-blur-lg rounded-2xl p-1 shadow-[0_8px_32px_rgba(0,224,255,0.1)]",
                children: (0, r.jsxs)(a.r, {
                  "aria-label": "Platform options",
                  variant: "underlined",
                  classNames: {
                    base: "w-full",
                    tabList: "bg-transparent p-0",
                    cursor: "bg-gradient-to-r from-[#00E0FF] to-[#B45CFF]",
                    tab: "px-8 py-4 data-[hover=true]:bg-white/5",
                    tabContent:
                      "text-lg font-medium group-data-[selected=true]:text-white",
                  },
                  children: [
                    (0, r.jsx)(
                      l.i,
                      {
                        title: (0, r.jsxs)("div", {
                          className: "flex items-center gap-2",
                          children: [
                            (0, r.jsx)("svg", {
                              className: "w-5 h-5",
                              fill: "#FF0000",
                              viewBox: "0 0 24 24",
                              children: (0, r.jsx)("path", {
                                d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                              }),
                            }),
                            "YouTube",
                          ],
                        }),
                        children: (0, r.jsx)("div", {
                          className: "p-6 sm:p-8",
                          children: (0, r.jsx)(N, {}),
                        }),
                      },
                      "youtube",
                    ),
                    (0, r.jsx)(
                      l.i,
                      {
                        title: (0, r.jsxs)("div", {
                          className: "flex items-center gap-2",
                          children: [
                            (0, r.jsx)("svg", {
                              className: "w-5 h-5",
                              fill: "#9147FF",
                              viewBox: "0 0 24 24",
                              children: (0, r.jsx)("path", {
                                d: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z",
                              }),
                            }),
                            "Twitch",
                          ],
                        }),
                        children: (0, r.jsx)("div", {
                          className: "p-6 sm:p-8",
                          children: (0, r.jsx)(j, {}),
                        }),
                      },
                      "twitch",
                    ),
                  ],
                }),
              }),
            ],
          }),
        });
      }
    },
    3510: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 5523)),
        Promise.resolve().then(s.bind(s, 1234)),
        Promise.resolve().then(s.bind(s, 2903));
    },
    5523: (e, t, s) => {
      "use strict";
      s.d(t, { Banner: () => n });
      var r = s(5155),
        a = s(2671),
        l = s(6766);
      let o = { src: "./_next/static/media/png_logo.06e328fe.png" },
        i = { src: "./_next/static/media/background-image.35025b0e.jpg" };
      function n() {
        return (0, r.jsx)("div", {
          className: "w-full px-4 sm:px-0",
          children: (0, r.jsxs)("div", {
            className:
              "relative w-full rounded-none sm:rounded-xl overflow-hidden",
            style: {
              backgroundImage: "url(".concat(i.src, ")"),
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "300px",
            },
            children: [
              (0, r.jsx)("div", {
                className:
                  "absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-[5px]",
              }),
              (0, r.jsx)("div", {
                className:
                  "relative z-10 h-full flex flex-col items-center justify-center text-center p-8 sm:p-12",
                children: (0, r.jsxs)("div", {
                  className:
                    "flex flex-col items-center gap-6 w-full max-w-2xl",
                  children: [
                    (0, r.jsx)("div", {
                      className: "w-full max-w-[280px] sm:max-w-[360px]",
                      children: (0, r.jsx)(l.default, {
                        src: o.src,
                        alt: "DiegoVeloper Logo",
                        width: 400,
                        height: 150,
                        className:
                          "w-full h-auto object-contain drop-shadow-xl",
                        priority: !0,
                      }),
                    }),
                    (0, r.jsxs)("div", {
                      className: "space-y-4",
                      children: [
                        (0, r.jsxs)("p", {
                          className:
                            "text-2xl sm:text-3xl font-bold text-white drop-shadow-lg",
                          children: [
                            (0, r.jsx)("span", {
                              className:
                                "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400",
                              children: "Beneficios exclusivos",
                            }),
                            " ",
                            "para miembros",
                          ],
                        }),
                        (0, r.jsx)("p", {
                          className:
                            "text-lg sm:text-xl text-white/80 max-w-[600px]",
                          children:
                            "\xa1Con\xe9ctate con la comunidad, accede a contenido premium y participa en eventos privados!",
                        }),
                      ],
                    }),
                    (0, r.jsx)(a.T, {
                      radius: "full",
                      size: "lg",
                      className:
                        "mt-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white",
                      onPress: () => {
                        let e = document.getElementById("como-acceder");
                        e &&
                          e.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                      },
                      children: "\xdaNETE AL DISCORD",
                    }),
                  ],
                }),
              }),
            ],
          }),
        });
      }
    },
  },
  (e) => {
    e.O(0, [371, 441, 964, 358], () => e((e.s = 3510))), (_N_E = e.O());
  },
]);
