import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Home, Zap, DollarSign, Info, ArrowRight, ChevronDown, Sparkles, TrendingUp, BarChart3, BookOpen, Users } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../common/ThemeToggle";
import { initAuthSession } from "../../services/authService";
import toast from "react-hot-toast";

type NavbarProps = {
  transparent?: boolean;
};

interface SubMenuItem {
  label: string;
  icon: any;
  desc: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  submenu?: SubMenuItem[];
}

const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const navigate = useNavigate();

  const navigateWithSession = async (type: 'login' | 'signup') => {
    try {
      const sid = await initAuthSession(type);
      const path = type === 'login' ? '/user/login' : '/user/register';
      const extra = type === 'signup' ? '&mode=signup' : '';
      navigate(`${path}?sid=${sid}${extra}`);
    } catch {
      toast.error('Failed to initialize session. Please try again.');
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [active, setActive] = useState("#home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const gradient = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(400px at ${x}px ${y}px, rgba(99,102,241,0.15), transparent 80%)`,
  );
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const move = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      mouseX.set(e.clientX + dx * 0.2);
      mouseY.set(e.clientY + dy * 0.2);

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const scroll = () => setScrolled(window.scrollY);

    scroll();

    window.addEventListener("mousemove", move);
    window.addEventListener("scroll", scroll);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, [mouseX, mouseY]);
  useEffect(() => {
    const sections = ["#home", "#features", "#pricing", "#how-it-works", "#contact"];

    const handleScroll = () => {
      sections.forEach((id) => {
        const el = document.querySelector(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          setActive(id);
        }
      });
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links: NavItem[] = [
    { label: "Home", href: "#home", icon: Home },
    { 
      label: "Features", 
      href: "#features", 
      icon: Zap,
      submenu: [
        { label: "AI Concept Synthesis", icon: Sparkles, desc: "Notes to practice exams" },
        { label: "Precision Testing", icon: TrendingUp, desc: "Adaptive weak domain tests" },
        { label: "Radar Analytics", icon: BarChart3, desc: "Dynamic mastery visualization" },
        { label: "AI doubt Solver", icon: Zap, desc: "Instant text breakdowns" },
      ]
    },
    { label: "Pricing", href: "#pricing", icon: DollarSign },
    { label: "How It Works", href: "#how-it-works", icon: Info },
    { label: "Resources", href: "#resources", icon: BookOpen, submenu: [
      { label: "Study Guides", icon: BookOpen, desc: "Step-by-step techniques" },
      { label: "Community", icon: Users, desc: "Learn with others" },
      { label: "Documentation", icon: Info, desc: "How to use Aura" },
    ]},
    { label: "Contact", href: "#contact", icon: ArrowRight },
  ];

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMagnetic = (e: React.MouseEvent) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btnRef.current!.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  };

  const resetMagnetic = () => {
    if (btnRef.current) btnRef.current.style.transform = `translate(0,0)`;
  };

  const shrink = scrolled > 50;
  const blur = Math.min(scrolled / 50, 1);
  const dragX = useMotionValue(0);
  const navSurface = transparent
    ? "border-white/20 bg-white/30 dark:bg-slate-900/30"
    : "border-white/40 bg-white/70 dark:border-slate-700/60 dark:bg-slate-900/80";

  return (
    <>
      {/* Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30"
        style={{ background: gradient }}
      />

      {/* ANIMATED BACKGROUND GRADIENT */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-20 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.2), transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(236,72,153,0.2), transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(168,85,247,0.2), transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.2), transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-40"
      >
        <div className="flex justify-center px-4 pt-4">
          <motion.div
            animate={{
              height: shrink ? 56 : 64,
              backdropFilter: `blur(${blur * 20}px)`,
            }}
            className={`relative w-full max-w-6xl rounded-2xl border shadow-2xl overflow-hidden ${navSurface}`}
          >
            {/* Animated Border Gradient */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              animate={{
                borderImage: [
                  "linear-gradient(90deg, rgba(99,102,241,0.3), rgba(236,72,153,0.3)) 0% 100%",
                  "linear-gradient(180deg, rgba(99,102,241,0.3), rgba(236,72,153,0.3)) 0% 100%",
                  "linear-gradient(270deg, rgba(99,102,241,0.3), rgba(236,72,153,0.3)) 0% 100%",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Glass shine effect with animation */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-white/30 via-transparent to-transparent pointer-events-none"
              animate={{
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Glow effect on hover */}
            <motion.div
              className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-pink-500 rounded-2xl opacity-0 -z-10 blur-xl group-hover:opacity-20 transition-opacity"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="h-full px-6 flex items-center justify-between relative z-10">
              {/* LOGO */}
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                aria-label="Go to home page"
                className="flex items-center gap-2 cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-8 h-8 bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center rounded-lg font-bold overflow-hidden relative"
                  whileHover={{
                    boxShadow: "0 0 20px rgba(99,102,241,0.8)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ rotateZ: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-linear-to-r from-indigo-600 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="relative z-10">A</span>
                </motion.div>
                <motion.span
                  className="font-bold text-base bg-linear-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent"
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(99,102,241,0)",
                      "0 0 20px rgba(99,102,241,0.3)",
                      "0 0 0px rgba(99,102,241,0)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  AURA
                </motion.span>
              </motion.button>

              {/* CENTER + RIGHT WRAPPER */}
              <div className="hidden md:flex items-center gap-2">
                {/* DESKTOP LINKS */}
                <div className="hidden md:flex gap-1 relative">
                  {links.map((link) => {
                    const isActive = active === link.href;
                    const hasSubmenu = link.submenu && link.submenu.length > 0;

                    return (
                      <div key={link.href} className="relative group">
                        <motion.button
                          type="button"
                          onClick={() => {
                            if (hasSubmenu) {
                              setOpenDropdown(openDropdown === link.href ? null : link.href);
                            } else {
                              scrollTo(link.href);
                            }
                          }}
                          className="relative px-3 py-2 rounded-lg transition-all duration-200"
                          whileHover={{ backgroundColor: "rgba(99,102,241,0.1)" }}
                        >
                        <span
                          className={`flex items-center gap-2 text-sm transition-colors ${
                            isActive
                              ? "text-indigo-600 font-semibold"
                              : "text-slate-600 group-hover:text-indigo-500"
                          }`}
                        >
                          {link.label}
                          {hasSubmenu && (
                            <motion.div
                              animate={{ rotate: openDropdown === link.href ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={16} />
                            </motion.div>
                          )}
                        </span>

                        {isActive && (
                          <motion.div
                            layoutId="underline"
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500"
                          />
                        )}
                      </motion.button>

                      {/* SUBMENU DROPDOWN */}
                      <AnimatePresence>
                        {hasSubmenu && openDropdown === link.href && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-white/30 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl p-2 z-50"
                          >
                            {link.submenu?.map((item: SubMenuItem, i: number) => (
                              <motion.button
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => {
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-3 rounded-lg flex items-start gap-3 hover:bg-indigo-500/10 transition-colors text-left group"
                              >
                                <div className="mt-0.5">
                                  <item.icon size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900 dark:text-slate-50 text-sm">
                                    {item.label}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {item.desc}
                                  </p>
                                </div>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT */}
              <div className="hidden md:flex items-center gap-4">
                <ThemeToggle />

                <div className="relative">
                  <motion.button
                    type="button"
                    disabled
                    onClick={() => navigateWithSession('login')}
                    className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800/30 cursor-not-allowed opacity-60 transition-colors group"
                    whileHover={{ scale: 1 }}
                    whileTap={{ scale: 1 }}
                  >
                    Sign In
                  </motion.button>
                  <div className="fixed px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 bottom-24 left-1/2 transform -translate-x-1/2">
                    Disabled: Button disabled due to the website is under processing to complete
                  </div>
                </div>

                <div className="relative">
                  <motion.button
                    type="button"
                    disabled
                    ref={btnRef}
                    onMouseMove={handleMagnetic}
                    onMouseLeave={resetMagnetic}
                    onClick={() => navigateWithSession('signup')}
                    className="relative px-6 py-2 rounded-lg text-white font-semibold overflow-hidden transition-all opacity-60 cursor-not-allowed group"
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-slate-500" />

                    <motion.div
                      className="absolute inset-0 bg-white/20 blur-xl"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.button>
                  <div className="fixed px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 bottom-24 left-1/2 transform -translate-x-1/2">
                    Disabled: Button disabled due to the website is under processing to complete
                  </div>
                </div>
              </div>
              </div>

              {/* MOBILE */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              drag="x"
              style={{ x: dragX }}
              onDragEnd={(e, info) => {
                if (info.offset.x > 120) setMobileOpen(false);
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm z-50 bg-white/85 dark:bg-slate-950/90 backdrop-blur-xl p-6 text-slate-900 dark:text-slate-50 overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="flex flex-col h-full justify-between">
                {/* NAV LINKS */}
                <div className="space-y-2">
                  {links.map((link, i) => {
                    const isActive = active === link.href;
                    const Icon = link.icon;
                    const hasSubmenu = link.submenu && link.submenu.length > 0;
                    const submenuOpen = openDropdown === link.href;

                    return (
                      <div key={link.href}>
                        <motion.button
                          type="button"
                          onClick={() => {
                            if (hasSubmenu) {
                              setOpenDropdown(submenuOpen ? null : link.href);
                            } else {
                              scrollTo(link.href);
                            }
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.96 }}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl backdrop-blur border transition-all ${
                            isActive
                              ? "bg-linear-to-r from-indigo-500/20 to-pink-500/20 border-indigo-400/40 text-indigo-600 shadow-md"
                              : "bg-white/40 dark:bg-slate-800/40 border-white/20 dark:border-slate-700/60 hover:bg-white/60 dark:hover:bg-slate-800/70"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.4 }}
                            >
                              <Icon size={18} />
                            </motion.div>

                            <span className="text-base font-medium">
                              {link.label}
                            </span>
                          </div>

                          {hasSubmenu && (
                            <motion.div
                              animate={{ rotate: submenuOpen ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown size={18} />
                            </motion.div>
                          )}
                        </motion.button>

                        {/* MOBILE SUBMENU */}
                        <AnimatePresence>
                          {hasSubmenu && submenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 pl-4 space-y-2 overflow-hidden"
                            >
                              {link.submenu?.map((item: SubMenuItem, j: number) => (
                                <motion.button
                                  key={item.label}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.05 }}
                                  className="w-full px-4 py-2 rounded-lg flex items-start gap-3 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors text-left border border-indigo-300/30"
                                >
                                  <div className="mt-0.5">
                                    <item.icon size={16} className="text-indigo-500" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-50">
                                      {item.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {item.desc}
                                    </p>
                                  </div>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/*AUTH BUTTONS */}
                <div className="pt-6 border-t border-white/20 space-y-3">
                  {/* SIGN IN */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled
                      onClick={() => navigateWithSession('login')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-200/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500
                   text-sm font-medium cursor-not-allowed opacity-60 transition group"
                    >
                      Sign In
                    </button>
                    <div className="fixed px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 -bottom-20 left-1/2 transform -translate-x-1/2">
                      Disabled: Button disabled due to the website is under processing to complete
                    </div>
                  </div>

                  {/* SIGN UP / GET STARTED */}
                  <div className="group relative">
                    <motion.button
                      type="button"
                      disabled
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 1 }}
                      onClick={() => navigateWithSession('signup')}
                      className="relative w-full px-4 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden opacity-60 cursor-not-allowed"
                    >
                      <span className="relative z-10">Get Started</span>

                      {/* gradient */}
                      <div className="absolute inset-0 bg-linear-to-r from-slate-400 to-slate-500" />

                      {/* glow pulse */}
                      <motion.div
                        className="absolute inset-0 bg-white/20 blur-xl"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                      Disabled: Button disabled due to the website is under processing to complete
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </>
  );
};

export default Navbar;
