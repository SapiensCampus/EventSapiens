/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { ExternalLink, Sparkles, Github } from 'lucide-react';

export const TamilNaduTechCard: React.FC = () => {
  return (
    <div id="tamilnadu-tech-section" className="max-w-7xl mx-auto px-4 sm:px-8 my-8">
      <div className="border-[2.5px] border-black bg-[#FFF8DC] p-6 sm:p-8 shadow-[5px_5px_0px_#000] relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 border-[1.5px] border-black bg-[#FFDE59] px-2.5 py-0.5 text-[11px] font-mono font-black uppercase tracking-wider text-black shadow-[1.5px_1.5px_0px_#000]">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>COMMUNITY INSPIRATION</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
              Looking for tech community events across Tamil Nadu?
            </h3>

            <p className="text-xs sm:text-sm font-medium text-black/85 leading-relaxed">
              While <strong>EventSapiens</strong> curates student symposiums, collegiate hackathons, and campus workshops, you can explore grassroots tech meetups, developer groups, and community conferences across Tamil Nadu on{' '}
              <a
                href="https://tamilnadu.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline underline-offset-2 hover:text-[#000] text-black"
              >
                tamilnadu.tech
              </a>{' '}
              — an open-source inspiration and sister community project.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://tamilnadu.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-black border-2 border-black shadow-[3px_3px_0px_#000] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>Visit tamilnadu.tech</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>

            <a
              href="https://github.com/FOSSUChennai/Communities"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-neutral-100 text-xs sm:text-sm font-bold border-2 border-black shadow-[3px_3px_0px_#000] transition-all cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Open Source Repo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
