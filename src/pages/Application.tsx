
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FounderDetailsStep from '../components/application/FounderDetailsStep';
import IncubationInfoStep from '../components/application/IncubationInfoStep';
import StartupIdeaStep from '../components/application/StartupIdeaStep';
import ApplicationSuccess from '../components/application/ApplicationSuccess';
import CongratulationsModal from '../components/CongratulationsModal';

const Application = () => {
  const [loading, setLoading] = useState(true);
  const [userApplication, setUserApplication] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCongratulationsModal, setShowCongratulationsModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    // Step 1: Founder Details
    founderName: '',
    startupName: '',
    email: '',
    phone: '',
    companyType: '',
    teamSize: '',
    source: '',
    couponCode: '',
    
    // Step 2: Incubation Info
    incubationCentre: '',
    registrationCertificate: null,
    incubationLetter: null,
    website: '',
    
    // Step 3: Startup Idea
    ideaDescription: '',
    expectations: [],
    challenges: ''
  });

  const steps = [
    { number: 1, title: 'Founder Details', description: 'Basic information about you and your startup' },
    { number: 2, title: 'Incubation Info', description: 'Documents and incubation center details' },
    { number: 3, title: 'Startup Idea', description: 'Your vision and expectations' }
  ];

  useEffect(() => {
    checkUserApplication();
  }, []);

  const checkUserApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has an existing application
      const { data: applications, error } = await supabase
        .from('applications')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking user application:', error);
        toast({
          title: "Error",
          description: "Failed to check application status",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (applications && applications.length > 0) {
        const application = applications[0];
        setUserApplication(application);
        
        // Show congratulations modal for newly approved applications
        if (application.status === 'approved') {
          // Check if we should show the modal (first time seeing approval)
          const hasSeenCongratulations = localStorage.getItem(`congratulations_${application.id}`);
          if (!hasSeenCongratulations) {
            setShowCongratulationsModal(true);
            localStorage.setItem(`congratulations_${application.id}`, 'true');
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const updateApplicationData = (data: any) => {
    setApplicationData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FounderDetailsStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <IncubationInfoStep
            data={applicationData}
            updateData={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          <StartupIdeaStep
            data={applicationData}
            updateData={updateApplicationData}
            onPrev={prevStep}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking application status...</p>
        </div>
      </div>
    );
  }

  // If user has an existing application, show the success component
  if (userApplication) {
    return (
      <>
        <ApplicationSuccess applicationId={userApplication.id} />
        <CongratulationsModal 
          isOpen={showCongratulationsModal}
          onClose={() => setShowCongratulationsModal(false)}
          applicationData={userApplication}
        />
      </>
    );
  }

  // If no application exists, show the application form
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Startup Application</h1>
          <p className="text-gray-600">Complete your application for the Dreamers Incubation Program</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 border-gray-200">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Step {currentStep} of {steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between">
              {steps.map((step) => (
                <div key={step.number} className="flex-1 text-center">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                    step.number <= currentStep 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <div className="text-xs">
                    <div className={`font-medium ${step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-gray-400 hidden sm:block">
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Application;
