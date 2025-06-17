
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Gift, Users, Download, Phone, Mail, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ApplicationSuccessProps {
  applicationId: string;
}

const ApplicationSuccess = ({ applicationId }: ApplicationSuccessProps) => {
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Error fetching application status:', error);
          return;
        }

        if (data) {
          setApplicationStatus(data.status);
          setApplicationData(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();

    // Set up real-time subscription for status changes
    const subscription = supabase
      .channel('application-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'applications',
        filter: `id=eq.${applicationId}`
      }, (payload) => {
        setApplicationStatus(payload.new.status);
        setApplicationData(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted Successfully!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Thank you for submitting your application. We've sent it to <strong>{applicationData?.incubation_centre}</strong> admin for review.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">⏳ Waiting for Admin Approval</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You'll receive an email notification once your application is reviewed by the incubation center admin.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-800 mb-2">📧 Application Details Sent To:</h4>
                <p className="text-blue-700 text-sm">{applicationData?.incubation_centre} Admin</p>
                <p className="text-blue-600 text-xs mt-1">The admin will review your application and approve/reject it.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-700 mb-2">🎉 Congratulations!</CardTitle>
              <p className="text-xl text-gray-600">Your application has been approved by {applicationData?.incubation_centre}!</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                  <Gift className="mr-3 w-8 h-8" />
                  ₹40,000 Worth of Benefits
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                      <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Expert Consultation Booking</h4>
                        <p className="text-sm text-gray-600">1-on-1 sessions with industry experts and mentors</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                      <Download className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Premium Resource Downloads</h4>
                        <p className="text-sm text-gray-600">Business templates, pitch decks, legal documents & guides</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                      <Phone className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Dedicated Support Contact</h4>
                        <p className="text-sm text-gray-600">Direct line to our support team for immediate assistance</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                      <Gift className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Partner Tools & Credits</h4>
                        <p className="text-sm text-gray-600">Access to premium software, cloud credits & services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Contact Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                  <Mail className="mr-2 w-5 h-5" />
                  📞 Support Contact Information
                </h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-700">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>support@dreamersincubation.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>+91-9876543210</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp: +91-9876543210</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
                  <Users className="mr-2 w-4 h-4" />
                  Book Consultation
                </Button>
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3">
                  <Download className="mr-2 w-4 h-4" />
                  Download Resources
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3">
                  <ExternalLink className="mr-2 w-4 h-4" />
                  Contact Support
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Approved by <strong>{applicationData?.incubation_centre}</strong> on{' '}
                  {applicationData?.approved_at && new Date(applicationData.approved_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">Application Not Approved</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Unfortunately, your application was not approved by <strong>{applicationData?.incubation_centre}</strong> at this time.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Next Steps</p>
                <p className="text-red-700 text-sm mt-1">
                  You can contact support for feedback or submit a new application in the future.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-blue-800 mb-2">📞 Support Contact</h4>
                <div className="text-sm text-blue-700">
                  <p>Email: support@dreamersincubation.com</p>
                  <p>Phone: +91-9876543210</p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-4">
                <Mail className="mr-2 w-4 h-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default ApplicationSuccess;
