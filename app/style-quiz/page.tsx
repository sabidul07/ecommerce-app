"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  {
    id: 1,
    text: "Which palette resonates with your space?",
    options: [
      { id: 'a', text: 'Earthy & Natural', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop' },
      { id: 'b', text: 'Minimalist Charcoal', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop' },
      { id: 'c', text: 'Vibrant & Bohemian', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop' },
    ]
  },
  {
    id: 2,
    text: "What material speaks to you most?",
    options: [
      { id: 'a', text: 'Hand-thrown Ceramic', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop' },
      { id: 'b', text: 'Industrial Metal', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800&auto=format&fit=crop' },
      { id: 'c', text: 'Organic Linen', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop' },
    ]
  }
];

export default function StyleQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSelect = (optionId: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentStep].id]: optionId });
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Logic to determine style based on answers
    const styleType = answers[1] === 'a' ? 'Organic Minimalist' : 'Industrial Modern';

    if (user) {
      await supabase.from('style_quiz_results').upsert({
        user_id: user.id,
        style_type: styleType,
        results: answers
      });
    }

    setShowResult(true);
    setIsSubmitting(false);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="text-gold w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 italic">Your Style: Organic Minimalist</h1>
          <p className="text-stone-400 mb-8">We've curated a personalized collection based on your appreciation for natural materials and earthy tones.</p>
          <button 
            onClick={() => router.push('/products')}
            className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gold transition-colors"
          >
            Explore My Collection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Sparkles size={16} />
            <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Personalization</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white">Find Your Aesthetic</h1>
            <span className="text-stone-500 font-mono">Step {currentStep + 1} / {QUESTIONS.length}</span>
          </div>
        </div>

        <div className="relative overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl text-stone-300 font-medium">{QUESTIONS[currentStep].text}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {QUESTIONS[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option.id)}
                    className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border-2 transition-all ${
                      answers[QUESTIONS[currentStep].id] === option.id 
                        ? 'border-gold' 
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <img 
                      src={option.image} 
                      alt={option.text}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                      <span className="text-white font-bold text-lg">{option.text}</span>
                      {answers[QUESTIONS[currentStep].id] === option.id && (
                        <CheckCircle2 className="text-gold" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="flex items-center gap-2 text-stone-500 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          {currentStep === QUESTIONS.length - 1 && (
            <button
              onClick={handleSubmit}
              disabled={!answers[QUESTIONS[currentStep].id] || isSubmitting}
              className="bg-gold text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Curating...' : 'Reveal My Style'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
