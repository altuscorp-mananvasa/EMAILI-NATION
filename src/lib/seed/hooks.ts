import type { SeedModule } from "./types";

export const HOOKS: SeedModule[] = [
  { category: "hook", variant_key: "A",  weight: 1, body: "Hi {{firstName}},\n\nI'm Manan — CA by training, founder-coach by accident, and I run Productivity Shastra. {{referrer}} thought you'd find this useful, hence the email." },
  { category: "hook", variant_key: "B",  weight: 1, body: "Hey {{firstName}},\n\nReaching out personally because what's inside Productivity Shastra only lands for a certain kind of founder — and from what I can see at {{company}}, that's you." },
  { category: "hook", variant_key: "C",  weight: 1, body: "{{firstName}},\n\nNo mass blast here. I'm emailing you one at a time because I'd genuinely like you at our next Productivity Shastra Orientation." },
  { category: "hook", variant_key: "D",  weight: 1, body: "Hi {{firstName}},\n\nThis is the shortest 'what if' I know how to write: what if {{company}} ran without you having to be in every decision?" },
  { category: "hook", variant_key: "E",  weight: 1, body: "Hi {{firstName}},\n\nYou came in through {{source}} — figured you might want to see what we actually do before the next cohort fills up." },
  { category: "hook", variant_key: "F",  weight: 1, body: "{{firstName}}, quick one.\n\nWe run a free 3.5-hour Orientation called the PSO. Live, on Zoom or in-person in Mumbai, hosted by me." },
  { category: "hook", variant_key: "G",  weight: 1, body: "Hi {{firstName}},\n\nI won't pretend this is anything other than a personal invite — but I think it's the most useful 3.5 hours you'll spend this month." },
  { category: "hook", variant_key: "H",  weight: 1, body: "Hey {{firstName}},\n\nMost of the founders I coach started exactly where you are — in {{industry}}, in {{city}}, running hard, sleeping less." },
  { category: "hook", variant_key: "I",  weight: 1, body: "{{firstName}},\n\nA friend asked me the other day: \"Manan, what's the one thing you'd send every founder if you could only send one thing?\" — the answer is the email below." },
  { category: "hook", variant_key: "J",  weight: 1, body: "Hi {{firstName}},\n\nI'm going to skip the intro and get to the point — there's a free Productivity Shastra Orientation next, and I think you should be in the room." },
  { category: "hook", variant_key: "K",  weight: 1, body: "{{firstName}}, I had you on my list.\n\nNot a marketing list — a personal shortlist of {{industry}} founders I wanted to personally pull into the next Productivity Shastra Orientation." },
  { category: "hook", variant_key: "L",  weight: 1, body: "Hi {{firstName}},\n\nA short note before I lose your attention in a 47-tab morning — I'm Manan Vasa, I host the Productivity Shastra Orientation, and I'd like you in the next one." },
];
