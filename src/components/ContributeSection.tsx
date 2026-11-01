/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { FilePlus2, ArrowRight, Github } from 'lucide-react';

interface ContributeSectionProps {
  onOpenContributeModal: () => void;
}

export const ContributeSection: React.FC<ContributeSectionProps> = ({
  onOpenContributeModal
}) => {
  return (
    <section id="contribute" className="py-12 border-t-[2.5px] border-black bg-[#FFF8DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="border-[2.5px] border-black bg-[#FFDE59] p-6 sm:p-10 shadow-[6px_6px_0px_#000]">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight leading-tight">
              Hosting an event for students? Add it here.
            </h2>

            <p className="mt-2 text-xs sm:text-sm font-medium text-black/85 leading-relaxed">
              Add your symposium, hackathon or workshop to the college calendar. Submit via GitHub Pull Request.
            </p>
          </div>

          {/* 3 Step Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
            <div className="p-4 border-[2px] border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="w-7 h-7 border-[1.5px] border-black bg-[#FFDE59] flex items-center justify-center font-mono text-xs font-black text-black mb-2 shadow-[1px_1px_0px_#000]">
                1
              </div>
              <h3 className="text-xs font-black uppercase text-black">Fork Repo</h3>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                Fork <span className="font-mono font-bold text-black">SapiensCampus/EventSapiens</span> repository.
              </p>
            </div>

            <div className="p-4 border-[2px] border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="w-7 h-7 border-[1.5px] border-black bg-[#FFDE59] flex items-center justify-center font-mono text-xs font-black text-black mb-2 shadow-[1px_1px_0px_#000]">
                2
              </div>
              <h3 className="text-xs font-black uppercase text-black">Add Event File</h3>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                Add your event file inside <span className="font-mono font-bold text-black">events/</span>.
              </p>
            </div>

            <div className="p-4 border-[2px] border-black bg-white shadow-[3px_3px_0px_#000]">
              <div className="w-7 h-7 border-[1.5px] border-black bg-[#FFDE59] flex items-center justify-center font-mono text-xs font-black text-black mb-2 shadow-[1px_1px_0px_#000]">
                3
              </div>
              <h3 className="text-xs font-black uppercase text-black">Open Pull Request</h3>
              <p className="mt-1 text-xs text-neutral-600 font-medium">
                Validation tests run automatically and it goes live.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/SapiensCampus/EventSapiens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black text-white bg-black hover:bg-neutral-800 border-[2px] border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
            >
              <Github className="w-4 h-4 stroke-[2.5]" />
              <span>Contribute on GitHub</span>
            </a>

            <button
              onClick={onOpenContributeModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-black text-black bg-white hover:bg-neutral-100 border-[2px] border-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
            >
              <FilePlus2 className="w-4 h-4 stroke-[2.5]" />
              <span>Event Generator</span>
            </button>

            <a
              href="https://github.com/SapiensCampus/EventSapiens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:underline ml-auto"
            >
              <span>SapiensCampus/EventSapiens</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
