
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, Users, Download, Phone, Mail, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: any;
}

const CongratulationsModal = ({ isOpen, onClose, applicationData }: CongratulationsModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti when modal opens
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-2xl">
        <div className="relative overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-12 text-center relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Sparkles className="w-16 h-16 text-yellow-300 animate-pulse" />
                  <div className="absolute -top-2 -right-2">
                    <Gift className="w-8 h-8 text-yellow-200 animate-bounce" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">🎉 CONGRATULATIONS! 🎉</h1>
              <p className="text-xl text-green-100 font-medium">
                Your startup application has been APPROVED!
              </p>
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mt-4">
                <p className="text-lg font-semibold">
                  Welcome to {applicationData?.incubation_centre}
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Benefits Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8 border border-green-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold text-2xl mb-4">
                  <Gift className="mr-3 w-8 h-8" />
                  ₹40,000 Worth of Benefits Unlocked!
                </div>
                <p className="text-gray-600 text-lg">
                  You now have access to exclusive resources and support
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="bg-blue-500 p-3 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Expert Consultation Booking</h4>
                      <p className="text-sm text-gray-600">1-on-1 sessions with industry experts and mentors</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="bg-purple-500 p-3 rounded-full">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Premium Resource Downloads</h4>
                      <p className="text-sm text-gray-600">Business templates, pitch decks, legal documents & guides</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="bg-green-500 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Dedicated Support Contact</h4>
                      <p className="text-sm text-gray-600">Direct line to our support team for immediate assistance</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                    <div className="bg-orange-500 p-3 rounded-full">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Partner Tools & Credits</h4>
                      <p className="text-sm text-gray-600">Access to premium software, cloud credits & services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Sparkles className="mr-2 w-5 h-5 text-green-500" />
                Your Application Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Startup Name:</span>
                  <span className="font-bold text-gray-800">{applicationData?.startup_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Founder:</span>
                  <span className="font-bold text-gray-800">{applicationData?.founder_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Incubation Centre:</span>
                  <span className="font-bold text-gray-800">{applicationData?.incubation_centre}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Approved On:</span>
                  <span className="font-bold text-gray-800">
                    {applicationData?.approved_at ? new Date(applicationData.approved_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                <Mail className="mr-2 w-5 h-5" />
                📞 Support Contact Information
              </h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-4 h-4" />
                  <span>support@dreamersincubation.com</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-4 h-4" />
                  <span>+91-9876543210</span>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp: +91-9876543210</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
                <Users className="mr-2 w-5 h-5" />
                Book Consultation
              </Button>
              <Button variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold">
                <Download className="mr-2 w-5 h-5" />
                Download Resources
              </Button>
              <Button variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                <Mail className="mr-2 w-5 h-5" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CongratulationsModal;
