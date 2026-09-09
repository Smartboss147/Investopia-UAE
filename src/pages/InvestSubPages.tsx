import React from 'react';
import { InvestPageLayout } from '../components/InvestPageLayout';
import { motion } from 'motion/react';

const StubPage: React.FC<{ title: string; subtitle: string; content: string }> = ({ title, subtitle, content }) => (
  <InvestPageLayout title={title} subtitle={subtitle}>
    <section className="bg-white py-24">
      <div className="container mx-auto px-6">
        <div className="bg-gray-50 p-12 md:p-20 border border-gray-100">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-4xl"
          >
            <p className="text-gray-600 leading-relaxed text-xl">
              {content}
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white border border-gray-200 p-8 flex flex-col justify-between">
                  <div className="w-12 h-1 bg-[#C5A059]" />
                  <h4 className="text-[#00122e] font-bold text-lg">Recreation Section {i}</h4>
                  <p className="text-gray-400 text-sm">Detailed information and resources related to {title.toLowerCase()} will be presented here in the official platform.</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </InvestPageLayout>
);

export const AboutPage: React.FC = () => (
  <StubPage 
    title="About Investopia" 
    subtitle="Connecting the world's most ambitious investors with the future of the global economy."
    content="Launched in 2021 by the UAE Government, Investopia is a global investment platform that connects the world’s investment community with the growth sectors of the new economy. Our mission is to facilitate global dialogue, foster strategic partnerships, and catalyze capital flows into sustainable and innovative economic frontiers."
  />
);

export const EventsPage: React.FC = () => (
  <StubPage 
    title="Global Events" 
    subtitle="A calendar of flagship summits and international dialogues shaping the future of investment."
    content="From our flagship summit in Abu Dhabi to strategic global editions across Europe, Asia, and the Americas, Investopia brings together world leaders, CEOs, and visionaries to explore emerging economic opportunities and strengthen global investment ties."
  />
);

export const KnowledgePage: React.FC = () => (
  <StubPage 
    title="Knowledge Hub" 
    subtitle="Insights, research, and analysis on the growth sectors of the new economy."
    content="The Investopia Knowledge Hub serves as a central repository for strategic insights, expert analysis, and comprehensive research reports. We focus on sectors including fintech, clean energy, AI, healthcare, and the circular economy, providing the data needed to make informed investment decisions."
  />
);
