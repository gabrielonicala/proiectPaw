'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { motion } from 'framer-motion';
import MovingGradientBackground from '@/components/MovingGradientBackground';

export default function TributeCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4">
      <MovingGradientBackground theme="obsidian-veil" />
      <div className="relative z-10 max-w-md mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Card theme="obsidian-veil" effect="vintage">
            <div className="p-6 text-center">
              <div className="text-yellow-400 text-6xl mb-4">😔</div>
              <h1 className="font-pixel text-3xl text-white mb-4">Tribute Canceled</h1>
              <p className="text-gray-300 mb-6">
                Your Tribute has been canceled. You can still enjoy limited adventures with the free plan.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/')}
                  variant="primary"
                  className="w-full"
                >
                  Continue Adventure
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="w-full"
                >
                  Restore Tribute
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
