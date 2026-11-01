/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from "react";
import {
  Github,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
} from "lucide-react";

interface FooterProps {
  onNavigate: (view: "home" | "past-events") => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <div className="w-full">
      {/* Landmark Illustration: Chennai Egmore & Mascot */}
      <div className="w-full pointer-events-none select-none overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}assets/images/footer%20image.png`}
          alt="Chennai Egmore Station with EventSapiens Mascot"
          className="w-full h-auto block -mb-[28px]"
          loading="lazy"
        />
      </div>

      <footer
        id="site-footer"
        className="w-full bg-[#0B0B0B] text-neutral-300 py-10 px-4 sm:px-8 border-t-[2.5px] border-black"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left: Brand & Info */}
          <div className="space-y-1.5">
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#FFDE59] block">
              EventSapiens
            </span>

            <p className="text-xs sm:text-sm text-neutral-300">
              Brought to you by{" "}
              <a
                href="https://codesapiens.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#FFDE59] transition-colors"
              >
                CodeSapiens TamilNadu
              </a>
              ,
            </p>

            <p className="text-xs text-neutral-400">
              Licensed under MIT. Initiated by{" "}
              <a
                href="https://www.linkedin.com/in/keerthana-m-g-12ba59256/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white transition-colors"
              >
                Kee
              </a>{" "}
              and{" "}
              <a
                href="https://www.linkedin.com/in/jayakanth-sivakumar-434851257/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 hover:text-white transition-colors"
              >
                JK
              </a>
              .
            </p>
          </div>

          {/* Right: Quick Links & Socials */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-5 text-xs font-semibold text-neutral-300">
              <button
                onClick={() => onNavigate("past-events")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Past Events
              </button>
              <a
                href="https://github.com/CodeSapiens-in/EventSapiens"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Contribute</span>
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://www.instagram.com/codesapiens.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#FFDE59] text-black hover:bg-[#FFE680] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000]"
                aria-label="CodeSapiens Instagram"
                title="CodeSapiens Instagram"
              >
                <Instagram className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#FFDE59] text-black hover:bg-[#FFE680] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000]"
                aria-label="CodeSapiens YouTube"
                title="CodeSapiens YouTube"
              >
                <Youtube className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="https://chat.whatsapp.com/IiaPFDThmGk9UEoYzvoXWU"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#FFDE59] text-black hover:bg-[#FFE680] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000]"
                aria-label="CodeSapiens WhatsApp Community"
                title="CodeSapiens WhatsApp Community"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
              </a>

              <a
                href="https://www.linkedin.com/company/codesapiens-community/posts/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#FFDE59] text-black hover:bg-[#FFE680] flex items-center justify-center transition-colors shadow-[2px_2px_0px_#000]"
                aria-label="CodeSapiens LinkedIn"
                title="CodeSapiens LinkedIn"
              >
                <Linkedin className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
